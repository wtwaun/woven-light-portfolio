/**
 * Build locked homepage hero WebP from TIF (optional) or a dark placeholder.
 * Source: hero-source/P8150904-Enhanced-NR-Edit.tif (same base name as your master file).
 * Output: images-optimized/wildlife/P8150904-Enhanced-NR-Edit.webp
 *
 * Run: npm run hero:build
 */
'use strict';

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const HERO_BASE = 'P8150904-Enhanced-NR-Edit';
const HERO_TIF = path.join(__dirname, 'hero-source', `${HERO_BASE}.tif`);
const HERO_TIFF = path.join(__dirname, 'hero-source', `${HERO_BASE}.tiff`);
const OUT = path.join(__dirname, 'images-optimized', 'wildlife', `${HERO_BASE}.webp`);

async function main() {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });

  const src = fs.existsSync(HERO_TIF) ? HERO_TIF : fs.existsSync(HERO_TIFF) ? HERO_TIFF : null;

  if (src) {
    await sharp(src, { limitInputPixels: false })
      .resize(2500, 2500, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 92, smartSubsample: true, preset: 'photo', effort: 6 })
      .toFile(OUT);
    console.log('Hero WebP built from', path.basename(src), '→', path.relative(__dirname, OUT));
    return;
  }

  console.warn(
    'No TIF found in hero-source/. Creating dark placeholder WebP — replace by running npm run hero:build after adding',
    `${HERO_BASE}.tif`
  );
  await sharp({
    create: {
      width: 2400,
      height: 1350,
      channels: 3,
      background: { r: 6, g: 7, b: 10 },
    },
  })
    .webp({ quality: 85 })
    .toFile(OUT);
  console.log('Wrote placeholder:', path.relative(__dirname, OUT));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
