const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const ExifReader = require('exifreader');
const { DOMParser, onErrorStopParsing } = require('@xmldom/xmldom');

const PUBLISH_DIR = path.join(__dirname, 'WILDWAUN_PUBLISH');
const GALLERY_DATA_PATH = path.join(__dirname, 'gallery-data.json');
const IMAGES_OPT_DIR = path.join(__dirname, 'images-optimized');
const PROTECTED_HERO_ID = 'P8150904-Enhanced-NR-Edit';

const ALLOWED_CATEGORIES = [
  'wildlife', 'landscape', 'abstract', 'cityscape', 'plants', 'stars', 'uncategorized'
];

function cleanCategoryInput(raw) {
  if (raw == null || raw === '') return '';
  let s = raw.toString();
  s = s.replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, ' ');
  return s.trim().replace(/\s+/g, ' ');
}

function normalizedCategoryKey(raw) {
  return cleanCategoryInput(raw).toLowerCase();
}

function mapFragmentToCategorySlug(fragment) {
  const key = normalizedCategoryKey(fragment);
  if (!key) return '';

  if (ALLOWED_CATEGORIES.includes(key)) return key;

  const stripWrappers = key.replace(/^[\s"'“”‘’[\]()]+|[\s"'“”‘’[\])]+$/g, '').trim();
  if (ALLOWED_CATEGORIES.includes(stripWrappers)) return stripWrappers;

  const spaced = stripWrappers.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (ALLOWED_CATEGORIES.includes(spaced)) return spaced;

  const ALIASES = {
    'wild life': 'wildlife', 'wild-life': 'wildlife', 'city scape': 'cityscape',
    'city-scape': 'cityscape', 'cityscapes': 'cityscape', 'landscapes': 'landscape',
    'abstracts': 'abstract', 'plant': 'plants', 'plant life': 'plants',
    'star': 'stars', 'stars': 'stars', 'astro': 'stars', 'astrophotography': 'stars',
  };
  if (ALIASES[spaced]) return ALIASES[spaced];
  if (ALIASES[stripWrappers]) return ALIASES[stripWrappers];

  for (const c of ALLOWED_CATEGORIES) {
    if (spaced === `${c}s` && c !== 'plants' && c !== 'stars') return c;
  }
  if (spaced === 'plant' || spaced === 'plants') return 'plants';
  if (spaced === 'star' || spaced === 'stars') return 'stars';

  return '';
}

function categoryFromWatchFilePath(watchResolved, absFilePath) {
  const rel = path.relative(watchResolved, absFilePath);
  let dir = path.dirname(absFilePath);
  const chain = [];
  while (dir && dir !== watchResolved && dir.startsWith(watchResolved + path.sep)) {
    chain.push(path.basename(dir));
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  if (chain.length === 0) return 'uncategorized';

  for (const folderRaw of chain) {
    const slug = mapFragmentToCategorySlug(folderRaw);
    if (slug) return slug;
  }
  return 'uncategorized';
}

function pickDesc(group, name) {
  if (!group || !group[name]) return '';
  const t = group[name];
  if (Array.isArray(t)) return t.map((x) => (x.description ?? x.value ?? '').toString().trim()).filter(Boolean).join(', ');
  return (t.description ?? t.value ?? '').toString().trim();
}

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

function buildTechnicalSpecs(exif) {
  if (!exif) return '';
  let focal = pickDesc(exif, 'FocalLength').replace(/\s*mm\s*$/i, '').trim();
  if (focal && !/mm$/i.test(focal)) focal += 'mm';
  let isoRaw = pickDesc(exif, 'ISOSpeedRatings') || pickDesc(exif, 'ISO');
  const iso = isoRaw ? `${isoRaw.replace(/\s/g, '')}ISO` : '';
  const fn = pickDesc(exif, 'FNumber');
  const shutter = pickDesc(exif, 'ExposureTime');
  return [focal, iso, fn, shutter].filter(Boolean).join(', ');
}

function buildGear(exif) {
  if (!exif) return '';
  const make = pickDesc(exif, 'Make');
  const model = pickDesc(exif, 'Model');
  const lens = pickDesc(exif, 'LensModel');
  const body = [make, model].filter(Boolean).join(' ');
  return [body, lens].filter(Boolean).join(', ');
}

function extractOriginalFilename(tags, exportBasenameNoExt) {
  const exif = tags.exif || {};
  const xmp = tags.xmp || {};
  const tryVal = (v) => {
    const s = (v || '').toString().trim();
    return s ? s.replace(/^.*[/\\]/, '').trim() : '';
  };
  const candidates = [tryVal(pickDesc(exif, 'OriginalRawFileName')), tryVal(pickDesc(exif, 'RawFile'))];
  if (xmp && typeof xmp === 'object') {
    for (const key of Object.keys(xmp)) {
      const kn = key.toLowerCase().replace(/[{}]/g, '');
      if ((kn.includes('original') && kn.includes('file')) || kn.includes('originalfilename') || kn.includes('sourcefilename') || kn.endsWith('originalfilename')) {
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

function slugUniqueIdFromOriginalName(originalRef) {
  let base = path.basename(String(originalRef).trim());
  base = base.replace(/\.(jpe?g|jpeg|tiff?|tif|png|webp|cr2|cr3|nef|arw|dng|raf|orf|rw2|heic)$/i, '');
  base = base.replace(/[^a-zA-Z0-9._-]/g, '_');
  return base || 'photo';
}

function parseExportFilenameSequence(exportStem) {
  const stem = String(exportStem || '').trim();
  const m = stem.match(/^(\d+)-(.+)$/);
  if (!m) return { sort_order: null, idStemForUniqueId: null };
  const n = parseInt(m[1], 10);
  const rest = m[2].trim();
  if (!Number.isFinite(n) || !rest) return { sort_order: null, idStemForUniqueId: null };
  return { sort_order: n, idStemForUniqueId: rest };
}

function sortGalleryDataImages(data) {
  if (!data || !Array.isArray(data.images)) return;
  data.images.sort((a, b) => {
    const catA = String(a.category || '').toLowerCase();
    const catB = String(b.category || '').toLowerCase();
    if (catA < catB) return -1;
    if (catA > catB) return 1;

    const ao = typeof a.sort_order === 'number' && Number.isFinite(a.sort_order) ? a.sort_order : Infinity;
    const bo = typeof b.sort_order === 'number' && Number.isFinite(b.sort_order) ? b.sort_order : Infinity;
    if (ao !== bo) return ao - bo;
    return (a.id || 0) - (b.id || 0);
  });
  data.images.forEach((img, idx) => { img.id = idx + 1; });
}

function scanDirRecursive(dir, extensions = /\.(jpg|jpeg)$/i, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === '_processed') continue;
    const abs = path.join(dir, file);
    if (fs.statSync(abs).isDirectory()) {
      scanDirRecursive(abs, extensions, fileList);
    } else {
      if (abs.match(extensions)) {
        fileList.push(abs);
      }
    }
  }
  return fileList;
}

async function processImages() {
  console.log(`Starting CI image processing in ${PUBLISH_DIR}...`);

  let galleryData = { images: [] };
  if (fs.existsSync(GALLERY_DATA_PATH)) {
    galleryData = JSON.parse(fs.readFileSync(GALLERY_DATA_PATH, 'utf8'));
  }

  // Preserve the protected hero
  const heroEntry = galleryData.images.find(img => img.unique_id === PROTECTED_HERO_ID);
  
  // We will build a new array of images, so deletions from WILDWAUN_PUBLISH automatically remove entries
  const newImages = [];
  if (heroEntry) newImages.push(heroEntry);

  const jpegs = scanDirRecursive(PUBLISH_DIR);
  console.log(`Found ${jpegs.length} JPEGs to process.`);

  for (const filePath of jpegs) {
    const base = path.basename(filePath);
    const category = categoryFromWatchFilePath(PUBLISH_DIR, filePath);

    const buffer = fs.readFileSync(filePath);
    const tags = ExifReader.load(buffer, { expanded: true, domParser: new DOMParser({ onError: onErrorStopParsing }) });
    const iptc = tags.iptc || {};
    const exif = tags.exif || {};
    const xmp = tags.xmp || {};

    const exportStem = path.basename(base, path.extname(base));
    const seq = parseExportFilenameSequence(exportStem);
    const originalFromMeta = extractOriginalFilename(tags, exportStem);
    const unique_id = seq.idStemForUniqueId
      ? slugUniqueIdFromOriginalName(seq.idStemForUniqueId)
      : slugUniqueIdFromOriginalName(originalFromMeta);

    // Skip if it conflicts with the hero image
    if (unique_id === PROTECTED_HERO_ID) {
      console.log(`Skipping ${base} because it matches the protected hero ID.`);
      continue;
    }

    const titleFromExportStem = seq.idStemForUniqueId ? seq.idStemForUniqueId.replace(/-/g, ' ') : exportStem.replace(/-/g, ' ');
    const title = pickDesc(iptc, 'Object Name') || titleFromXmp(xmp) || titleFromExportStem;
    const field_notes = pickDesc(iptc, 'Caption/Abstract');
    const location = pickDesc(iptc, 'Sub-location');
    const print_info = pickDesc(iptc, 'Headline');
    const technical_specs = buildTechnicalSpecs(exif);
    const gear = buildGear(exif);

    const webpName = `${unique_id}.webp`;
    const outDir = path.join(IMAGES_OPT_DIR, category);
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, webpName);

    const maxSide = 2500;
    const sharpOpts = { limitInputPixels: 268_402_689 };
    const meta = await sharp(filePath, sharpOpts).metadata();
    const w = meta.width || 0;
    const h = meta.height || 0;
    let chain = sharp(filePath, sharpOpts);
    if (w > 0 && h > 0 && (w > maxSide || h > maxSide)) {
      chain = chain.resize(maxSide, maxSide, { fit: 'inside', withoutEnlargement: true });
    }
    await chain.webp({ quality: 90 }).toFile(outPath);

    const relFilename = `images-optimized/${category}/${webpName}`;

    newImages.push({
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
    console.log(`Processed: ${base} -> ${relFilename}`);
  }

  // Sync to galleryData
  galleryData.images = newImages;
  sortGalleryDataImages(galleryData);

  // Clean up any webp files in images-optimized that are no longer in the JSON
  const validWebpPaths = new Set(newImages.map(img => path.resolve(__dirname, img.filename)));
  const allOptimizedFiles = scanDirRecursive(IMAGES_OPT_DIR, /\.webp$/i);
  for (const optFile of allOptimizedFiles) {
    if (!validWebpPaths.has(path.resolve(optFile))) {
      try {
        fs.unlinkSync(optFile);
        console.log(`Deleted orphaned WebP: ${path.basename(optFile)}`);
      } catch (e) {
        console.warn(`Could not delete orphaned WebP: ${optFile}`);
      }
    }
  }

  fs.writeFileSync(GALLERY_DATA_PATH, JSON.stringify(galleryData, null, 2) + '\n', 'utf8');
  console.log('Saved gallery-data.json successfully.');
}

processImages().catch(err => {
  console.error('Error processing images:', err);
  process.exit(1);
});
