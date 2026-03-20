/**
 * WILDWAUN Lightroom Publish Watcher
 * ------------------------------------
 * Watches category subfolders under the publish root (e.g. Wildlife/*.jpg),
 * reads metadata with ExifReader, writes WebP into images-optimized/[category]/,
 * updates gallery-data.json (sort_order from 001-name.jpg), mirrors file deletions,
 * optionally runs git add/commit/push.
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

  /** Git commit message (new / updated photos) */
  gitCommitMessage: 'New Photo Published',

  /** Git commit message when a publish file is deleted and gallery syncs */
  gitRemoveCommitMessage: 'Photo removed from gallery',

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

/** Title-case labels for console feedback (folder slugs → Lightroom-style names). */
const CATEGORY_DISPLAY = {
  wildlife: 'Wildlife',
  landscape: 'Landscape',
  abstract: 'Abstract',
  cityscape: 'Cityscape',
  plants: 'Plants',
  stars: 'Stars',
};

const processing = new Set();

/** Absolute paths we moved to _processed — ignore matching `unlink` (not a user deletion). */
const ignoredUnlinks = new Set();

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
 * Trim, collapse whitespace, strip odd Unicode spaces (case preserved for error messages).
 */
function cleanCategoryInput(raw) {
  if (raw == null || raw === '') return '';
  let s = raw.toString();
  s = s.replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, ' ');
  return s.trim().replace(/\s+/g, ' ');
}

/**
 * Lowercase + collapsed spaces for matching only.
 */
function normalizedCategoryKey(raw) {
  return cleanCategoryInput(raw).toLowerCase();
}

/**
 * Collect strings from IPTC Category, Supplemental Category, and XMP fields Lightroom uses
 * for “Content Category” / category-like tags (excluding location fields).
 */
function extractCategoryCandidates(iptc, xmp) {
  const out = [];
  const push = (v) => {
    const c = cleanCategoryInput(v);
    if (c) out.push(c);
  };

  push(pickDesc(iptc, 'Category'));
  const supplemental = pickDesc(iptc, 'Supplemental Category');
  if (supplemental) {
    supplemental
      .split(/[,;]/)
      .map((s) => cleanCategoryInput(s))
      .filter(Boolean)
      .forEach((p) => out.push(p));
  }

  if (xmp && typeof xmp === 'object') {
    for (const key of Object.keys(xmp)) {
      const lk = key.toLowerCase().replace(/[{}]/g, '');
      if (lk.includes('location')) continue;
      if (lk.includes('category')) {
        const v = pickDesc(xmp, key);
        if (v) {
          v.split(/[,;]/)
            .map((s) => cleanCategoryInput(s))
            .filter(Boolean)
            .forEach((p) => out.push(p));
        }
      }
    }
  }

  return out;
}

/**
 * Map a single human-entered fragment to a folder slug, or ''.
 * Case-insensitive; trims; fuzzy word boundaries and light aliases.
 */
function mapFragmentToCategorySlug(fragment) {
  const key = normalizedCategoryKey(fragment);
  if (!key) return '';

  if (ALLOWED_CATEGORIES.includes(key)) return key;

  const stripWrappers = key
    .replace(/^[\s"'“”‘’[\]()]+|[\s"'“”‘’[\])]+$/g, '')
    .trim();
  if (ALLOWED_CATEGORIES.includes(stripWrappers)) return stripWrappers;

  const spaced = stripWrappers.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (ALLOWED_CATEGORIES.includes(spaced)) return spaced;

  const ALIASES = {
    'wild life': 'wildlife',
    'wild-life': 'wildlife',
    'city scape': 'cityscape',
    'city-scape': 'cityscape',
    'cityscapes': 'cityscape',
    'landscapes': 'landscape',
    'abstracts': 'abstract',
    plant: 'plants',
    'plant life': 'plants',
    star: 'stars',
    stars: 'stars',
    astro: 'stars',
    astrophotography: 'stars',
  };
  if (ALIASES[spaced]) return ALIASES[spaced];
  if (ALIASES[stripWrappers]) return ALIASES[stripWrappers];

  for (const c of ALLOWED_CATEGORIES) {
    if (spaced === `${c}s` && c !== 'plants' && c !== 'stars') return c;
  }
  if (spaced === 'plant' || spaced === 'plants') return 'plants';
  if (spaced === 'star' || spaced === 'stars') return 'stars';

  const hay = spaced;
  for (const c of ALLOWED_CATEGORIES) {
    const esc = c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(^|\\s|[\\/_-])${esc}($|\\s|[\\/_-])`, 'i');
    if (re.test(hay)) return c;
  }

  for (const c of ALLOWED_CATEGORIES) {
    if (hay === c || hay.startsWith(`${c} `) || hay.endsWith(` ${c}`)) return c;
  }

  return '';
}

function tryKeywordsForSlug(keywordsText) {
  const parts = (keywordsText || '')
    .split(/[,;]/)
    .map((s) => cleanCategoryInput(s))
    .filter(Boolean);
  for (const p of parts) {
    const slug = mapFragmentToCategorySlug(p);
    if (slug) return slug;
  }
  return '';
}

/**
 * Legacy: IPTC/XMP category resolution. Unused — publish **subfolder** name sets category (`categoryFromPublishRelative`).
 * Kept for reference or future opt-in.
 */
function normalizeCategory(iptc, xmp, keywordsText, filenameForLog) {
  const candidates = extractCategoryCandidates(iptc, xmp);

  for (const cand of candidates) {
    const slug = mapFragmentToCategorySlug(cand);
    if (slug) {
      console.log(`[watcher] Category detected: ${CATEGORY_DISPLAY[slug]}.`);
      return slug;
    }
  }

  const fromKeywords = tryKeywordsForSlug(keywordsText);
  if (fromKeywords) {
    console.log(`[watcher] Category detected: ${CATEGORY_DISPLAY[fromKeywords]}.`);
    return fromKeywords;
  }

  const seenCategory = candidates.length ? candidates.join(' ; ') : '';
  const seenKeywords = cleanCategoryInput(keywordsText);
  const foundVal =
    seenCategory || seenKeywords || '(empty)';

  console.error(
    `[watcher] ERROR: No matching category for ${filenameForLog}. Found '${foundVal}' instead.`
  );
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

/**
 * Original Filename from metadata (Lightroom / camera). Falls back to export basename.
 */
function extractOriginalFilename(tags, exportBasenameNoExt) {
  const exif = tags.exif || {};
  const xmp = tags.xmp || {};

  const tryVal = (v) => {
    const s = (v || '').toString().trim();
    return s ? s.replace(/^.*[/\\]/, '').trim() : '';
  };

  const candidates = [
    tryVal(pickDesc(exif, 'OriginalRawFileName')),
    tryVal(pickDesc(exif, 'RawFile')),
  ];

  if (xmp && typeof xmp === 'object') {
    for (const key of Object.keys(xmp)) {
      const kn = key.toLowerCase().replace(/[{}]/g, '');
      if (
        (kn.includes('original') && kn.includes('file')) ||
        kn.includes('originalfilename') ||
        kn.includes('sourcefilename') ||
        kn.endsWith('originalfilename')
      ) {
        const v = tryVal(pickDesc(xmp, key));
        if (v) candidates.push(v);
      }
    }
  }

  for (const c of candidates) {
    if (c) return c;
  }

  return (exportBasenameNoExt || 'photo').trim();
}

/** Sanitized stem used as unique_id and WebP basename (e.g. P953782). */
function slugUniqueIdFromOriginalName(originalRef) {
  let base = path.basename(String(originalRef).trim());
  base = base.replace(/\.(jpe?g|jpeg|tiff?|tif|png|webp|cr2|cr3|nef|arw|dng|raf|orf|rw2|heic)$/i, '');
  base = base.replace(/[^a-zA-Z0-9._-]/g, '_');
  if (!base) base = 'photo';
  return base;
}

/**
 * Lightroom export name with Custom Order prefix: "001-P8150904.jpg" → sort_order 1,
 * id stem "P8150904" (used for unique_id / dedupe). No prefix → nulls (fall back to EXIF stem).
 */
function parseExportFilenameSequence(exportStem) {
  const stem = String(exportStem || '').trim();
  const m = stem.match(/^(\d+)-(.+)$/);
  if (!m) return { sort_order: null, idStemForUniqueId: null };
  const n = parseInt(m[1], 10);
  const rest = m[2].trim();
  if (!Number.isFinite(n) || !rest) return { sort_order: null, idStemForUniqueId: null };
  return { sort_order: n, idStemForUniqueId: rest };
}

/**
 * Sort gallery JSON by sort_order ascending; entries without a number go last (stable by id).
 */
function sortGalleryDataImages(data) {
  if (!data || !Array.isArray(data.images)) return;
  data.images.sort((a, b) => {
    const ao =
      typeof a.sort_order === 'number' && Number.isFinite(a.sort_order) ? a.sort_order : Infinity;
    const bo =
      typeof b.sort_order === 'number' && Number.isFinite(b.sort_order) ? b.sort_order : Infinity;
    if (ao !== bo) return ao - bo;
    return (a.id || 0) - (b.id || 0);
  });
}

/**
 * First folder under the publish root must be a known category (Wildlife/foo.jpg).
 * Returns null for files sitting directly in the publish root or under _processed/.
 */
function categoryFromPublishRelative(relPath, logLabel) {
  const parts = String(relPath || '')
    .split(/[/\\]/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length < 2) return null;
  if (parts[0] === CONFIG.processedSubdir) return null;
  const folderRaw = parts[0];
  const slug = mapFragmentToCategorySlug(folderRaw);
  if (!slug) {
    console.warn(
      `[watcher] Unknown category subfolder "${folderRaw}" (${logLabel}) — use one of: ${ALLOWED_CATEGORIES.join(', ')}`
    );
    return null;
  }
  return {
    slug,
    display: CATEGORY_DISPLAY[slug],
    folderName: folderRaw,
  };
}

/** unique_id + sort_order from export filename only (used after unlink — no EXIF). */
function uniqueIdFromExportBasename(baseFilename) {
  const base = path.basename(baseFilename);
  const exportStem = path.basename(base, path.extname(base));
  const seq = parseExportFilenameSequence(exportStem);
  if (seq.idStemForUniqueId) {
    return {
      unique_id: slugUniqueIdFromOriginalName(seq.idStemForUniqueId),
      sort_order: seq.sort_order,
      exportStem,
    };
  }
  return {
    unique_id: slugUniqueIdFromOriginalName(exportStem),
    sort_order: seq.sort_order,
    exportStem,
  };
}

/**
 * Remove gallery row (unique_id + category) and delete WebP on disk.
 * @returns {boolean} true if JSON or a WebP file changed
 */
function removeGalleryEntryAndWebp(unique_id, categorySlug) {
  const dataPath = path.join(CONFIG.projectRoot, 'gallery-data.json');
  if (!fs.existsSync(dataPath)) return false;

  let data;
  try {
    data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (e) {
    console.warn('[watcher] Could not read gallery-data.json for removal:', e.message);
    return false;
  }
  if (!Array.isArray(data.images)) return false;

  const uidNorm = String(unique_id).toLowerCase();
  const idx = data.images.findIndex(
    (img) =>
      String(img.unique_id || '').toLowerCase() === uidNorm && img.category === categorySlug
  );

  let changed = false;
  const conventionalRel = `images-optimized/${categorySlug}/${unique_id}.webp`;
  const conventionalAbs = path.join(CONFIG.projectRoot, conventionalRel);

  if (idx >= 0) {
    const entry = data.images[idx];
    const storedRel = entry.filename;
    const storedAbs = storedRel ? path.join(CONFIG.projectRoot, storedRel) : null;
    data.images.splice(idx, 1);
    sortGalleryDataImages(data);
    saveGalleryData(dataPath, data);
    changed = true;
    if (storedAbs && fs.existsSync(storedAbs)) {
      try {
        fs.unlinkSync(storedAbs);
      } catch (e) {
        console.warn('[watcher] Could not delete WebP:', storedRel, e.message);
      }
    }
  } else {
    console.warn(
      `[watcher] No gallery entry for unique_id="${unique_id}" category="${categorySlug}" (file was removed from publish folder).`
    );
  }

  if (fs.existsSync(conventionalAbs)) {
    try {
      fs.unlinkSync(conventionalAbs);
      changed = true;
    } catch (e) {
      console.warn('[watcher] Could not delete WebP:', conventionalRel, e.message);
    }
  }

  return changed;
}

function saveGalleryData(dataPath, data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

/**
 * One-time cleanup on startup: assign unique_id from filename if missing; drop duplicate
 * unique_id or duplicate filename (keep highest numeric id).
 */
function dedupeGalleryDataOnStartup() {
  const dataPath = path.join(CONFIG.projectRoot, 'gallery-data.json');
  if (!fs.existsSync(dataPath)) {
    console.log('[watcher] No gallery-data.json — skip dedupe cleanup.');
    return;
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (e) {
    console.warn('[watcher] Cleanup: invalid gallery-data.json:', e.message);
    return;
  }
  if (!Array.isArray(data.images)) return;

  let mutated = false;
  for (const img of data.images) {
    if (!img.unique_id && img.filename) {
      img.unique_id = path.basename(img.filename, path.extname(img.filename));
      mutated = true;
    }
  }

  const before = data.images.length;
  const orderBefore = data.images.map((i) => i.id).join(',');
  const sorted = [...data.images].sort((a, b) => (b.id || 0) - (a.id || 0));
  const seenUid = new Set();
  const seenPath = new Set();
  const kept = [];

  for (const img of sorted) {
    const uid = String(img.unique_id || path.basename(img.filename || '', '.webp')).toLowerCase();
    const fp = (img.filename || '').toLowerCase();
    if (!uid) {
      kept.push(img);
      continue;
    }
    if (seenUid.has(uid) || (fp && seenPath.has(fp))) {
      continue;
    }
    seenUid.add(uid);
    if (fp) seenPath.add(fp);
    kept.push(img);
  }

  sortGalleryDataImages({ images: kept });
  data.images = kept;
  const orderAfter = data.images.map((i) => i.id).join(',');

  if (kept.length !== before) {
    mutated = true;
    console.log(
      `[watcher] Cleanup: removed ${before - kept.length} duplicate gallery entries (same unique_id or filename).`
    );
  }
  if (orderBefore !== orderAfter) {
    mutated = true;
  }

  if (mutated) {
    saveGalleryData(dataPath, data);
  }
}

/**
 * Insert or update by unique_id. WebP path: images-optimized/{category}/{unique_id}.webp
 * Overwrites existing WebP; removes old WebP if category/filename changed.
 */
function upsertGalleryEntry(newEntry) {
  const dataPath = path.join(CONFIG.projectRoot, 'gallery-data.json');
  let data;
  if (fs.existsSync(dataPath)) {
    data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } else {
    data = { images: [] };
  }
  if (!Array.isArray(data.images)) data.images = [];

  const uidNorm = String(newEntry.unique_id).toLowerCase();

  const idx = data.images.findIndex((img) => {
    if (img.unique_id && String(img.unique_id).toLowerCase() === uidNorm) return true;
    const stem = path.basename(img.filename || '', '.webp').toLowerCase();
    return stem === uidNorm;
  });

  if (idx >= 0) {
    const old = data.images[idx];
    const oldRel = old.filename;
    const newRel = newEntry.filename;
    if (oldRel && oldRel !== newRel) {
      const oldAbs = path.join(CONFIG.projectRoot, oldRel);
      if (fs.existsSync(oldAbs)) {
        try {
          fs.unlinkSync(oldAbs);
        } catch (e) {
          console.warn('[watcher] Could not remove old WebP:', oldRel, e.message);
        }
      }
    }
    newEntry.id = old.id;
    data.images[idx] = newEntry;
    sortGalleryDataImages(data);
    saveGalleryData(dataPath, data);
    console.log(`[watcher] Updated existing photo: ${newEntry.id}`);
    return { updated: true, entry: newEntry };
  }

  const maxId = data.images.reduce((m, i) => Math.max(m, typeof i.id === 'number' ? i.id : 0), 0);
  newEntry.id = maxId + 1;
  data.images.push(newEntry);
  sortGalleryDataImages(data);
  saveGalleryData(dataPath, data);
  console.log(`[watcher] Added new photo: ${newEntry.id}`);
  return { updated: false, entry: newEntry };
}

function runGitSteps(commitMessage) {
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
  const msg = (commitMessage || CONFIG.gitCommitMessage).replace(/"/g, '\\"');
  console.log('[watcher] Git root:', gitRoot);
  try {
    execSync('git add -A', { cwd: gitRoot, stdio: 'inherit' });
  } catch (e) {
    console.warn('[watcher] git add failed:', e.message);
    return;
  }
  try {
    execSync(`git commit -m "${msg}"`, {
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
  const abs = path.resolve(filePath);
  const rel = path.relative(watchResolved, abs);
  if (rel.startsWith('..') || rel.split(/[/\\]/).includes('..')) return;
  if (rel.startsWith(CONFIG.processedSubdir + path.sep) || rel === CONFIG.processedSubdir) {
    return;
  }

  const catInfo = categoryFromPublishRelative(rel, base);
  if (!catInfo) {
    console.warn(`[watcher] Ignoring JPEG outside a category subfolder: ${rel}`);
    return;
  }
  const category = catInfo.slug;

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

    const exportStem = path.basename(base, path.extname(base));
    const seq = parseExportFilenameSequence(exportStem);
    const originalFromMeta = extractOriginalFilename(tags, exportStem);
    const unique_id = seq.idStemForUniqueId
      ? slugUniqueIdFromOriginalName(seq.idStemForUniqueId)
      : slugUniqueIdFromOriginalName(originalFromMeta);

    const titleFromExportStem = seq.idStemForUniqueId
      ? seq.idStemForUniqueId.replace(/-/g, ' ')
      : exportStem.replace(/-/g, ' ');

    const title =
      pickDesc(iptc, 'Object Name') ||
      titleFromXmp(xmp) ||
      titleFromExportStem;

    const field_notes = pickDesc(iptc, 'Caption/Abstract');
    const location = pickDesc(iptc, 'Sub-location');
    const print_info = pickDesc(iptc, 'Headline');

    const technical_specs = buildTechnicalSpecs(exif);
    const gear = buildGear(exif);

    const webpName = `${unique_id}.webp`;
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

    const relFilename = `images-optimized/${category}/${webpName}`;

    upsertGalleryEntry({
      unique_id,
      category,
      filename: relFilename,
      title,
      gear,
      technical_specs,
      print_info,
      location,
      field_notes,
      sort_order: seq.sort_order != null ? seq.sort_order : null,
    });

    const orderHeart =
      seq.sort_order != null ? String(seq.sort_order) : '—';
    console.log(
      `[watcher] New file in ${catInfo.display}: ${base} (# ${orderHeart})`
    );
    console.log(
      `[watcher]   WebP: ${relFilename} · unique_id=${unique_id} · title="${title}"`
    );

    // 3) _processed: create every time, then move (copy+unlink fallback)
    const processedDir = path.resolve(CONFIG.watchDir, CONFIG.processedSubdir);
    fs.mkdirSync(processedDir, { recursive: true });
    const destJpg = path.join(processedDir, `${unique_id}-${Date.now()}${path.extname(base)}`);
    ignoredUnlinks.add(abs);
    try {
      moveToProcessed(filePath, destJpg);
    } catch (moveErr) {
      ignoredUnlinks.delete(abs);
      throw moveErr;
    }
    console.log(`[watcher]   moved export to _processed/${path.basename(destJpg)}`);

    runGitSteps();
  } catch (err) {
    console.error('[watcher] Error processing', filePath, err);
  } finally {
    processing.delete(filePath);
  }
}

async function handleJpegRemoved(filePath) {
  const base = path.basename(filePath);
  const lower = base.toLowerCase();
  if (!lower.endsWith('.jpg') && !lower.endsWith('.jpeg')) return;

  const abs = path.resolve(filePath);
  if (ignoredUnlinks.has(abs)) {
    ignoredUnlinks.delete(abs);
    return;
  }

  const watchResolved = path.resolve(CONFIG.watchDir);
  const rel = path.relative(watchResolved, abs);
  if (rel.startsWith('..') || rel.split(/[/\\]/).includes('..')) return;

  const catInfo = categoryFromPublishRelative(rel, base);
  if (!catInfo) return;

  const { unique_id } = uniqueIdFromExportBasename(base);

  console.log(`[watcher] File removed from ${catInfo.display}: ${base}. Syncing...`);

  const changed = removeGalleryEntryAndWebp(unique_id, catInfo.slug);
  if (changed) {
    runGitSteps(CONFIG.gitRemoveCommitMessage);
    console.log('[watcher]   Deletion synced (gallery-data.json + WebP).');
  } else {
    console.log('[watcher]   Nothing to remove (no matching gallery row or WebP).');
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

  dedupeGalleryDataOnStartup();

  const gitRoot = getGitRoot();
  console.log('[watcher] Watching:', path.resolve(CONFIG.watchDir));
  console.log(
    '[watcher] Category subfolders:',
    ALLOWED_CATEGORIES.map((s) => CATEGORY_DISPLAY[s]).join(', ')
  );
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

  watcher.on('unlink', (p) => {
    handleJpegRemoved(p).catch((e) => console.error(e));
  });

  watcher.on('error', (err) => console.error('[watcher] chokidar error:', err));
}

main();
