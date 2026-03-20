/**
 * WILDWAUN Lightroom Publish Watcher
 * ------------------------------------
 * Watches a folder for new JPEGs, reads metadata with ExifReader, writes WebP
 * into images-optimized/[category]/, appends to gallery-data.json, optionally
 * runs git add/commit/push.
 *
 * 1) Edit CONFIG below (watch folder path, toggles).
 * 2) From this project folder: npm run watch-publish
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const chokidar = require('chokidar');
const sharp = require('sharp');
const ExifReader = require('exifreader');
const { DOMParser, onErrorStopParsing } = require('@xmldom/xmldom');

// =============================================================================
// CONFIG — edit these for your machine
// =============================================================================
const CONFIG = {
  /** Folder Lightroom exports into (must exist). */
  watchDir: '/Users/williamwaun/Desktop/WILDWAUN_PUBLISH',

  /** Root of this portfolio (gallery-data.json). Resolved automatically if possible. */
  projectRoot: path.resolve(__dirname),

  /** Subfolder inside watchDir where processed JPEGs are moved (avoids re-processing). */
  processedSubdir: '_processed',

  /** If true: git add / commit / push after each successful publish (uses real git root). */
  autoGitPush: true,

  /** Git commit message */
  gitCommitMessage: 'New Photo Published',

  /** WebP quality 1–100 */
  webpQuality: 90,

  /** Extra delay after chokidar “stable” so Lightroom has fully released the file (ms). */
  settleDelayMs: 2000,

  /** If longest side exceeds this, resize down (fits inside box, keeps aspect ratio). */
  maxLongSidePx: 2500,
};

/** Prefer a parent folder that contains gallery-data.json (supports nested layouts). */
function resolvePortfolioRoot(startDir) {
  let dir = path.resolve(startDir);
  let fallback = dir;
  for (let i = 0; i < 15; i++) {
    if (fs.existsSync(path.join(dir, 'gallery-data.json'))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return fallback;
}

CONFIG.projectRoot = resolvePortfolioRoot(__dirname);

/** Ensure _processed exists as soon as the script loads (avoids ENOENT on first rename). */
const INITIAL_PROCESSED_DIR = path.resolve(CONFIG.watchDir, CONFIG.processedSubdir);
if (fs.existsSync(CONFIG.watchDir) && !fs.existsSync(INITIAL_PROCESSED_DIR)) {
  fs.mkdirSync(INITIAL_PROCESSED_DIR, { recursive: true });
}

const ALLOWED_CATEGORIES = [
  'wildlife',
  'landscape',
  'abstract',
  'cityscape',
  'plants',
  'stars',
];

const processing = new Set();

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hasGitDir(dir) {
  return fs.existsSync(path.join(path.resolve(dir), '.git'));
}

/**
 * Resolve Git repo root for Netlify deploys: try git rev-parse from several folders,
 * then walk up from projectRoot and __dirname looking for .git.
 */
function getGitRoot() {
  const candidates = [
    path.resolve(CONFIG.projectRoot),
    path.resolve(__dirname),
    process.cwd(),
  ].filter((p, i, a) => a.indexOf(p) === i);

  for (const cwd of candidates) {
    try {
      if (!fs.existsSync(cwd)) continue;
      const out = execSync('git rev-parse --show-toplevel', {
        cwd,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      })
        .trim();
      if (out && hasGitDir(out)) return path.resolve(out);
    } catch (_) {
      /* not a git work tree from this cwd */
    }
  }

  for (const start of [CONFIG.projectRoot, __dirname]) {
    let dir = path.resolve(start);
    for (let i = 0; i < 20; i++) {
      if (hasGitDir(dir)) {
        try {
          return path.resolve(
            execSync('git rev-parse --show-toplevel', {
              cwd: dir,
              encoding: 'utf8',
              stdio: ['ignore', 'pipe', 'ignore'],
            }).trim()
          );
        } catch (_) {
          return dir;
        }
      }
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }

  return null;
}

function pickDesc(group, name) {
  if (!group || !group[name]) return '';
  const t = group[name];
  if (Array.isArray(t)) {
    return t
      .map((x) => (x.description ?? x.value ?? '').toString().trim())
      .filter(Boolean)
      .join(', ');
  }
  return (t.description ?? t.value ?? '').toString().trim();
}

/** Try XMP group keys for a Lightroom-style title. */
function titleFromXmp(xmp) {
  if (!xmp || typeof xmp !== 'object') return '';
  for (const key of Object.keys(xmp)) {
    if (/title$/i.test(key) || key === 'dc:title' || key.includes('title')) {
      const v = pickDesc(xmp, key);
      if (v) return v;
    }
  }
  return '';
}

/**
 * Case-insensitive: IPTC Category field first; if empty / no match, Keywords; else wildlife.
 */
function normalizeCategory(rawCategory, keywordsText, filenameForLog) {
  const tryMatch = (s) => {
    if (s == null || s === '') return '';
    const t = s
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
    if (!t) return '';
    if (ALLOWED_CATEGORIES.includes(t)) return t;
    for (const c of ALLOWED_CATEGORIES) {
      if (t === c) return c;
      try {
        const re = new RegExp(`\\b${c}\\b`, 'i');
        if (re.test(s.toString())) return c;
      } catch (_) {
        if (t.includes(c)) return c;
      }
    }
    return '';
  };

  const tryKeywords = (text) => {
    const parts = (text || '')
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean);
    for (const p of parts) {
      const c = tryMatch(p);
      if (c) return c;
    }
    return '';
  };

  // 1) IPTC Category field first (Lightroom "Category")
  const fromCategory = tryMatch(rawCategory);
  if (fromCategory) return fromCategory;

  // 2) Keywords only if Category did not yield a recognized slug
  const fromKeywords = tryKeywords(keywordsText);
  if (fromKeywords) return fromKeywords;

  const categoryEmpty = !String(rawCategory ?? '').trim();
  const keywordsEmpty = !String(keywordsText ?? '').trim();

  if (categoryEmpty && keywordsEmpty) {
    console.warn(
      `[watcher] No category found for ${filenameForLog}, defaulting to wildlife.`
    );
  } else {
    console.warn(
      `[watcher] No recognized category for ${filenameForLog} (IPTC Category / Keywords must match: ${ALLOWED_CATEGORIES.join(', ')}). Defaulting to wildlife.`
    );
  }
  return 'wildlife';
}

function buildTechnicalSpecs(exif) {
  if (!exif) return '';
  let focal = pickDesc(exif, 'FocalLength').replace(/\s*mm\s*$/i, '').trim();
  if (focal && !/mm$/i.test(focal)) focal += 'mm';

  let isoRaw = pickDesc(exif, 'ISOSpeedRatings') || pickDesc(exif, 'ISO');
  const iso = isoRaw ? `${isoRaw.replace(/\s/g, '')}ISO` : '';

  const fn = pickDesc(exif, 'FNumber');
  const shutter = pickDesc(exif, 'ExposureTime');

  const parts = [focal, iso, fn, shutter].filter(Boolean);
  return parts.join(', ');
}

function buildGear(exif) {
  if (!exif) return '';
  const make = pickDesc(exif, 'Make');
  const model = pickDesc(exif, 'Model');
  const lens = pickDesc(exif, 'LensModel');
  const body = [make, model].filter(Boolean).join(' ');
  return [body, lens].filter(Boolean).join(', ');
}

function nextWebpBasename(category) {
  const cap = category.charAt(0).toUpperCase() + category.slice(1);
  const outDir = path.join(CONFIG.projectRoot, 'images-optimized', category);
  let max = 0;
  if (fs.existsSync(outDir)) {
    const re = new RegExp(`^${cap}-(\\d+)\\.webp$`, 'i');
    for (const f of fs.readdirSync(outDir)) {
      const m = f.match(re);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    }
  }
  const dataPath = path.join(CONFIG.projectRoot, 'gallery-data.json');
  if (fs.existsSync(dataPath)) {
    try {
      const { images } = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      const re = new RegExp(`images-optimized/${category}/${cap}-(\\d+)\\.webp`, 'i');
      for (const img of images || []) {
        const m = (img.filename || '').match(re);
        if (m) max = Math.max(max, parseInt(m[1], 10));
      }
    } catch (_) {}
  }
  return `${cap}-${max + 1}.webp`;
}

function nextImageId(dataPath) {
  const { images } = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  let max = 0;
  for (const img of images || []) {
    if (typeof img.id === 'number') max = Math.max(max, img.id);
  }
  return max + 1;
}

function appendGalleryEntry(entry) {
  const dataPath = path.join(CONFIG.projectRoot, 'gallery-data.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  if (!Array.isArray(data.images)) data.images = [];
  data.images.push(entry);
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function runGitSteps() {
  if (!CONFIG.autoGitPush) return;
  const gitRoot = getGitRoot();
  if (!gitRoot) {
    console.warn(
      '[watcher] No Git repository found — skipping git add/commit/push. ' +
        'Clone your Netlify-connected repo, ensure `.git` exists, and run this script from that project. ' +
        `Tried projectRoot=${CONFIG.projectRoot}, watcherDir=${__dirname}, cwd=${process.cwd()}`
    );
    return;
  }
  console.log('[watcher] Git root:', gitRoot);
  try {
    execSync('git add -A', { cwd: gitRoot, stdio: 'inherit' });
  } catch (e) {
    console.warn('[watcher] git add failed:', e.message);
    return;
  }
  try {
    execSync(`git commit -m "${CONFIG.gitCommitMessage.replace(/"/g, '\\"')}"`, {
      cwd: gitRoot,
      stdio: 'inherit',
    });
  } catch (_) {
    console.log('[watcher] git commit skipped (nothing to commit or hook issue).');
    return;
  }
  try {
    execSync('git push', { cwd: gitRoot, stdio: 'inherit' });
    console.log('[watcher] SUCCESS: Site update sent to Netlify.');
  } catch (e) {
    console.warn('[watcher] git push failed:', e.message);
  }
}

/**
 * Wait until Lightroom has released the file: exists, non-zero size, and the same
 * size for several polls in a row (not still writing).
 */
async function waitForFileReleased(filePath, options = {}) {
  const intervalMs = options.intervalMs ?? 250;
  const maxWaitMs = options.maxWaitMs ?? 120000;
  const stableReads = options.stableReads ?? 4;
  const start = Date.now();
  let lastSize = -1;
  let stableStreak = 0;

  while (Date.now() - start < maxWaitMs) {
    try {
      if (!fs.existsSync(filePath)) {
        stableStreak = 0;
        lastSize = -1;
        await sleep(intervalMs);
        continue;
      }
      const st = fs.statSync(filePath);
      if (st.size <= 0) {
        stableStreak = 0;
        await sleep(intervalMs);
        continue;
      }
      if (st.size === lastSize) {
        stableStreak++;
        if (stableStreak >= stableReads) {
          return true;
        }
      } else {
        lastSize = st.size;
        stableStreak = 1;
      }
    } catch (_) {
      stableStreak = 0;
    }
    await sleep(intervalMs);
  }

  return fs.existsSync(filePath) && fs.statSync(filePath).size > 0;
}

function moveToProcessed(filePath, destJpg) {
  const processedDir = path.dirname(destJpg);
  fs.mkdirSync(processedDir, { recursive: true });
  try {
    fs.renameSync(filePath, destJpg);
  } catch (err) {
    if (err.code === 'EXDEV' || err.code === 'ENOENT') {
      fs.copyFileSync(filePath, destJpg);
      try {
        fs.unlinkSync(filePath);
      } catch (e2) {
        console.warn('[watcher] Copied to _processed but could not remove original:', e2.message);
      }
    } else {
      throw err;
    }
  }
}

async function processJpeg(filePath) {
  const base = path.basename(filePath);
  const lower = base.toLowerCase();
  if (!lower.endsWith('.jpg') && !lower.endsWith('.jpeg')) return;

  const watchResolved = path.resolve(CONFIG.watchDir);
  const rel = path.relative(watchResolved, path.resolve(filePath));
  if (rel.startsWith(CONFIG.processedSubdir + path.sep) || rel === CONFIG.processedSubdir || rel.includes('..')) {
    return;
  }

  if (processing.has(filePath)) return;
  processing.add(filePath);

  try {
    // 1) Settle + stable size: Lightroom must finish writing and release the file
    await sleep(CONFIG.settleDelayMs);

    const released = await waitForFileReleased(filePath, {
      intervalMs: 250,
      stableReads: 4,
      maxWaitMs: 120000,
    });
    if (!released) {
      console.warn('[watcher] File not stable / readable after wait, skipping:', filePath);
      return;
    }

    const buffer = fs.readFileSync(filePath);
    const tags = ExifReader.load(buffer, {
      expanded: true,
      domParser: new DOMParser({ onError: onErrorStopParsing }),
    });

    const iptc = tags.iptc || {};
    const exif = tags.exif || {};
    const xmp = tags.xmp || {};

    const title =
      pickDesc(iptc, 'Object Name') ||
      titleFromXmp(xmp) ||
      path.basename(base, path.extname(base)).replace(/-/g, ' ');

    const field_notes = pickDesc(iptc, 'Caption/Abstract');
    const location = pickDesc(iptc, 'Sub-location');
    const print_info = pickDesc(iptc, 'Headline');
    const iptcCategory = pickDesc(iptc, 'Category');
    const keywords = pickDesc(iptc, 'Keywords');
    const category = normalizeCategory(iptcCategory, keywords, base);

    const technical_specs = buildTechnicalSpecs(exif);
    const gear = buildGear(exif);

    const webpName = nextWebpBasename(category);
    const outDir = path.join(CONFIG.projectRoot, 'images-optimized', category);
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, webpName);

    // 2) If width OR height exceeds max long side, resize to fit inside box (keeps aspect ratio) — avoids WebP size errors
    const maxSide = CONFIG.maxLongSidePx;
    const sharpOpts = { limitInputPixels: 268_402_689 }; // ~16384²; helps very large exports
    const meta = await sharp(filePath, sharpOpts).metadata();
    const w = meta.width || 0;
    const h = meta.height || 0;
    let chain = sharp(filePath, sharpOpts);
    const needsResize = w > 0 && h > 0 && (w > maxSide || h > maxSide);
    if (needsResize) {
      chain = chain.resize(maxSide, maxSide, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }
    await chain.webp({ quality: CONFIG.webpQuality }).toFile(outPath);

    const dataPath = path.join(CONFIG.projectRoot, 'gallery-data.json');
    const id = nextImageId(dataPath);
    const relFilename = `images-optimized/${category}/${webpName}`;

    appendGalleryEntry({
      id,
      category,
      filename: relFilename,
      title,
      gear,
      technical_specs,
      print_info,
      location,
      field_notes,
    });

    // 3) _processed: create every time, then move (copy+unlink fallback)
    const processedDir = path.resolve(CONFIG.watchDir, CONFIG.processedSubdir);
    fs.mkdirSync(processedDir, { recursive: true });
    const destJpg = path.join(
      processedDir,
      `${path.parse(webpName).name}-${Date.now()}${path.extname(base)}`
    );
    moveToProcessed(filePath, destJpg);

    console.log(`[watcher] Published: ${relFilename}`);
    console.log(`[watcher]   title="${title}" category=${category}`);
    console.log(`[watcher]   moved original to ${path.basename(destJpg)}`);

    runGitSteps();
  } catch (err) {
    console.error('[watcher] Error processing', filePath, err);
  } finally {
    processing.delete(filePath);
  }
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

function main() {
  if (!fs.existsSync(CONFIG.watchDir)) {
    console.error(
      `[watcher] Watch folder does not exist:\n  ${CONFIG.watchDir}\n` +
        'Create it or update CONFIG.watchDir in watcher.js.'
    );
    process.exit(1);
  }

  const processedDir = path.resolve(CONFIG.watchDir, CONFIG.processedSubdir);
  fs.mkdirSync(processedDir, { recursive: true });

  const gitRoot = getGitRoot();
  console.log('[watcher] Watching:', path.resolve(CONFIG.watchDir));
  console.log('[watcher] Project root (gallery):', CONFIG.projectRoot);
  console.log('[watcher] Git root:', gitRoot || '(none — run inside a cloned repo for Netlify auto-deploy)');
  console.log('[watcher] Auto git push:', CONFIG.autoGitPush);
  console.log('[watcher] Settle delay:', CONFIG.settleDelayMs, 'ms · Max long side:', CONFIG.maxLongSidePx, 'px');
  console.log('[watcher] Processed JPEGs →', CONFIG.processedSubdir + '/\n');

  const processedAbs = path.resolve(CONFIG.watchDir, CONFIG.processedSubdir);
  const watcher = chokidar.watch(path.resolve(CONFIG.watchDir), {
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 200,
    },
    ignored: (p) => {
      const abs = path.resolve(p);
      return abs === processedAbs || abs.startsWith(processedAbs + path.sep);
    },
  });

  watcher.on('add', (p) => {
    processJpeg(p).catch((e) => console.error(e));
  });

  watcher.on('error', (err) => console.error('[watcher] chokidar error:', err));
}

main();
