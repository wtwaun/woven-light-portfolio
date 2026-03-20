/**
 * Generate gallery-data.json from images/Website * folders
 * Run: node generate-gallery-data.js
 * Run npm run optimize-images first so images-optimized/ exists
 */

const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, 'images');
const OUTPUT_FILE = path.join(__dirname, 'gallery-data.json');
const EXTENSIONS = ['.jpg', '.jpeg', '.png'];

const FOLDER_MAP = {
  'Website Wildlife': 'wildlife',
  'Website Landscape': 'landscape',
  'Website Plants': 'plants',
  'Website Stars': 'stars',
  'Website Abstract': 'abstract',
  'Website Cityscape': 'cityscape',
};

// Display order per category (matches current gallery)
const DISPLAY_ORDER = {
  abstract: ['Abstract-4', 'Abstract-7', 'Abstract-2', 'Abstract-1', 'Abstract-3', 'Abstract-6', 'Abstract-5'],
  cityscape: ['Cityscape-6', 'Cityscape-4', 'Cityscape-1', 'Cityscape-3', 'Cityscape-5', 'Cityscape-2', 'Cityscape-7'],
  landscape: ['Landscape-11', 'Landscape-8', 'Landscape-4', 'Landscape-6', 'Landscape-2', 'Landscape-12', 'Landscape-7', 'Landscape-1', 'Landscape-3', 'Landscape-9', 'Landscape-5', 'Landscape-10'],
  plants: ['Plants-9', 'Plants-4', 'Plants-2', 'Plants-3', 'Plants-5', 'Plants-8', 'Plants-1', 'Plants-6', 'Plants-7'],
  stars: ['Stars-2', 'Stars-3', 'Stars-6', 'Stars-4', 'Stars-1', 'Stars-5', 'Stars-7'],
  wildlife: ['Wildlife-3', 'Wildlife-16', 'Wildlife-13', 'Wildlife-9', 'Wildlife-1', 'Wildlife-2', 'Wildlife-4', 'Wildlife-6', 'Wildlife-5', 'Wildlife-7', 'Wildlife-19', 'Wildlife-18', 'Wildlife-8', 'Wildlife-15', 'Wildlife-11', 'Wildlife-12', 'Wildlife-14', 'Wildlife-20', 'Wildlife-17', 'Wildlife-10'],
};

function filenameToTitle(baseName) {
  return baseName.replace(/-(\d+)$/, ' $1').replace(/-/g, ' ');
}

function scanAndBuild() {
  const existing = {};
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
      (data.images || []).forEach((img) => {
        const key = `${img.category}:${path.basename(img.filename)}`;
        existing[key] = img;
      });
    } catch (e) {}
  }

  const images = [];
  let id = 1;
  const categoryOrder = ['abstract', 'cityscape', 'landscape', 'plants', 'stars', 'wildlife'];

  for (const category of categoryOrder) {
    const order = DISPLAY_ORDER[category];
    const folderName = Object.keys(FOLDER_MAP).find((k) => FOLDER_MAP[k] === category);
    if (!folderName) continue;

    const inputFolder = path.join(INPUT_DIR, folderName);
    if (!fs.existsSync(inputFolder)) continue;

    const entries = fs.readdirSync(inputFolder, { withFileTypes: true });
    const files = entries
      .filter((e) => e.isFile() && EXTENSIONS.includes(path.extname(e.name).toLowerCase()))
      .map((e) => path.basename(e.name, path.extname(e.name)));

    const ordered = order ? order.filter((name) => files.includes(name)) : [];
    const extra = files.filter((f) => !ordered.includes(f)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    const finalOrder = ordered.length ? [...ordered, ...extra] : files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    for (const baseName of finalOrder) {
      const filename = `images-optimized/${category}/${baseName}.webp`;
      const key = `${category}:${baseName}.webp`;
      const prev = existing[key];
      images.push({
        id: id++,
        category,
        filename,
        title: prev?.title ?? filenameToTitle(baseName),
        gear: prev?.gear ?? '',
        print_info: prev?.print_info ?? '',
        field_notes: prev?.field_notes ?? '',
      });
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ images }, null, 2), 'utf8');
  console.log(`Wrote ${images.length} entries to gallery-data.json`);
}

scanAndBuild();
