/**
 * Image Optimization Script
 * Resizes images to max 1920px (covers 1080p+ displays), converts to WebP
 * Quality-focused: 92% quality, smart subsampling, photo preset
 * Processes only "Website *" folders, outputs to images-optimized/{category}/
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const INPUT_DIR = path.join(__dirname, 'images');
const OUTPUT_DIR = path.join(__dirname, 'images-optimized');
const MAX_DIMENSION = 1920;
const WEBP_QUALITY = 92;

const EXTENSIONS = ['.jpg', '.jpeg', '.png'];

// Map Website folder names to site category names (display names)
const FOLDER_MAP = {
  'Website Wildlife': 'wildlife',
  'Website Landscape': 'landscape',
  'Website Plants': 'plants',
  'Website Stars': 'stars',
  'Website Abstract': 'abstract',
  'Website Cityscape': 'cityscape',
};

async function optimizeImage(inputPath, outputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  if (!EXTENSIONS.includes(ext)) return;

  await sharp(inputPath, { limitInputPixels: false })
    .resize(MAX_DIMENSION, MAX_DIMENSION, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({
      quality: WEBP_QUALITY,
      smartSubsample: true,
      preset: 'photo',
      effort: 6
    })
    .toFile(outputPath);
}

async function processWebsiteFolder(folderName) {
  const category = FOLDER_MAP[folderName];
  if (!category) return;

  const inputFolder = path.join(INPUT_DIR, folderName);
  if (!fs.existsSync(inputFolder) || !fs.statSync(inputFolder).isDirectory()) return;

  const outputFolder = path.join(OUTPUT_DIR, category);
  fs.mkdirSync(outputFolder, { recursive: true });

  const entries = fs.readdirSync(inputFolder, { withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile() && EXTENSIONS.includes(path.extname(e.name).toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  for (const entry of files) {
    const fullPath = path.join(inputFolder, entry.name);
    const ext = path.extname(entry.name).toLowerCase();
    const baseName = path.basename(entry.name, ext);
    const outputPath = path.join(outputFolder, `${baseName}.webp`);

    try {
      await optimizeImage(fullPath, outputPath);
      const stats = fs.statSync(outputPath);
      const originalStats = fs.statSync(fullPath);
      const savings = ((1 - stats.size / originalStats.size) * 100).toFixed(1);
      console.log(`✓ ${folderName}/${entry.name} → ${category}/${baseName}.webp (${(stats.size / 1024).toFixed(0)}KB, ${savings}% smaller)`);
    } catch (err) {
      console.error(`✗ ${folderName}/${entry.name}:`, err.message);
    }
  }
}

async function main() {
  console.log('Optimizing images from Website folders...\n');
  console.log(`Config: max ${MAX_DIMENSION}px, WebP quality ${WEBP_QUALITY}%\n`);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Remove old optimized images for categories we're about to write
  for (const category of Object.values(FOLDER_MAP)) {
    const outFolder = path.join(OUTPUT_DIR, category);
    if (fs.existsSync(outFolder)) {
      fs.rmSync(outFolder, { recursive: true });
    }
  }

  for (const folderName of Object.keys(FOLDER_MAP)) {
    await processWebsiteFolder(folderName);
  }

  console.log('\nDone! Optimized images saved to images-optimized/');
}

main().catch(console.error);
