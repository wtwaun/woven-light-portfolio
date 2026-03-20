/**
 * Merge spreadsheet metadata into gallery-data.json
 * Match by category + number from filename (e.g. Wildlife-3 → wildlife, 3)
 * Run: node merge-gallery-metadata.js
 */

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, 'gallery-data.json');

// Spreadsheet data: category (folder name) -> number -> { title, gear, technical_specs, print_info, location, field_notes }
const SPREADSHEET = {
  wildlife: {
    3: { title: 'Flamingo', gear: 'OM-1, OM 100-400 f5.0-6.3', technical_specs: '400mm, 320ISO, f/6.3, 1/1600', print_info: 'Canon Premium Matte', location: 'Atacama Desert, Chile' },
    16: { title: 'Kingfisher', gear: 'OM-1 Mark II, OM150-400 f4.5', technical_specs: '250mm, 1600ISO, f/6.3, 1/3200', print_info: 'Canon Pro Luster', location: 'The Parklands of Floyds Fork, KY' },
    13: { title: 'Western Bluebird', gear: 'OM-1 Mark II, OM 150-400 f4.5', technical_specs: '500mm, 1000ISO, f/5.6, 1/2500', print_info: 'Canon Pro Luster', location: 'Great Sand Dunes National Park, CO' },
    9: { title: 'Seal', gear: 'OM-1, OM 150-400 f4.5', technical_specs: '500mm, 200ISO, f/8.0, 1/800', print_info: 'Canon Pro Luster', location: 'Acadia National Park, ME' },
    1: { title: 'Great Egret Departure', gear: 'E-M1 Mark III, OM 100-400 f5.0-6.3 + MC-20', technical_specs: '800mm, 640ISO, f/14, 1/800', print_info: 'Canon Pro Luster', location: 'Falls of the Ohio, IN' },
    2: { title: 'Lizard', gear: 'OM-1, OM 100-400 f4.5', technical_specs: '385mm, 200ISO, f/6.3, 1/800', print_info: 'Canon Pro Luster', location: 'Atacama Desert, Chile' },
    4: { title: 'Comorants', gear: 'OM-1, OM 100-400 f4.5', technical_specs: '400mm, 320ISO, f/6.3, 1/2000', print_info: 'Canon Premium Matte', location: 'Chilean Coast' },
    6: { title: 'Osprey Sky', gear: 'OM-1, OM 100-400 f4.5', technical_specs: '400mm, 320ISO, f/6.3, 1/2500', print_info: 'Canon Premium Matte', location: 'Falls of the Ohio, IN' },
    5: { title: 'Oystercatcher', gear: 'OM-1, OM 100-400 f4.5', technical_specs: '400mm, 400ISO, f/6.3, 1/2500', print_info: 'Canon Pro Luster', location: 'Chilean Coast' },
    7: { title: 'Great Egret', gear: 'OM-1, OM 150-400 f4.5', technical_specs: '500mm, 320ISO, f/8.0, 1/400', print_info: 'Canon Pro Luster', location: 'Falls of the Ohio, IN' },
    19: { title: 'Short Eared Owl', gear: 'OM-1 Mark II, OM 150-400 f4.5', technical_specs: '500mm, 12800ISO, f/5.6, 1/800', print_info: 'Canon Pro Luster', location: 'Clarksville, IN' },
    18: { title: 'Ibis', gear: 'OM-1 Mark II, OM 150-400 f4.5', technical_specs: '273mm, 400ISO, f/6.3, 1/1000', print_info: 'Canon Premium Matte', location: 'Prospect, KY' },
    8: { title: 'Herb', gear: 'OM-1, OM 150-400 f4.5', technical_specs: '163mm, 640ISO, f/5.6, 1/1600', print_info: 'Canon Pro Luster', location: 'Bay of Fundy, ME' },
    15: { title: 'Swallows', gear: 'OM-1 Mark II, OM 150-400 f4.5 + MC-14', technical_specs: '586mm, 6400ISO, f/8.0, 1/3200', print_info: 'Canon Pro Luster', location: 'Clarksville, IN' },
    11: { title: 'Sandhills Crane', gear: 'OM-1, OM 150-400 f4.5', technical_specs: '500mm, 4000ISO, f/5.6, 1/320', print_info: 'Canon Premium Matte', location: 'Cecilia, KY' },
    12: { title: 'Great Horned Owl', gear: 'OM-1 Mark II, OM 150-400 f4.5', technical_specs: '500mm, 2500ISO, f/5.6, 1/1600', print_info: 'Canon Pro Luster', location: 'Louisville, KY' },
    14: { title: 'Baltimore Oriole', gear: 'OM-1 Mark II, OM 150-400 f4.5', technical_specs: '500mm, 2000ISO, f/5.6, 1/5000', print_info: 'Canon Pro Luster', location: 'Falls of the Ohio, IN' },
    20: { title: 'Screech Owl', gear: 'OM-1 Mark II, OM 150-400 f4.5 + MC-14', technical_specs: '700mm, 3200ISO, f/8.0, 1/1000', print_info: 'Canon Pro Luster', location: 'The Parklands of Floyds Fork, KY' },
    17: { title: 'Osprey Fishing', gear: 'OM-1 Mark II, OM 150-400 f4.5 + MC-14', technical_specs: '529mm, 800ISO, f/8.0, 1/2500', print_info: 'Canon Pro Luster', location: 'Falls of the Ohio, IN' },
    10: { title: 'White Throated Sparrow', gear: 'OM-1, OM 150-400 f4.5', technical_specs: '400mm, 2000ISO, f/4.5, 1/3200', print_info: 'Canon Premium Matte', location: 'Origin Park, IN' },
  },
  landscape: {
    11: { title: 'Dune Mountains', gear: 'OM-3, OM 17 f1.8 II', technical_specs: '17mm, 160ISO, f/8.0, 1/400', print_info: 'Canon Premium Matte', location: 'Great Sand Dune National Park, CO' },
    8: { title: 'Portland Lighthouse', gear: 'OM-1, Olympus 17 f1.8', technical_specs: '17mm, 320ISO, f/8.0, 1/2', print_info: 'Canon Premium Matte', location: 'Portland, ME' },
    4: { title: 'Atacama Layered Mountains', gear: 'OM-1, Olympus 100-400 f5.0-6.3', technical_specs: '218mm, 200ISO, f/6.0, 1/2000', print_info: 'Canon Premium Matte', location: 'Atacama Desert, Chile' },
    6: { title: 'Chilean Coast', gear: 'OM-1, Olympus 17 f1.8', technical_specs: '17mm, 1600ISO, f/13.0, 1/1600', print_info: 'Canon Pro Luster', location: 'Chilean Coast' },
    2: { title: 'Washington Fog', gear: 'E-M1 Mark III, Olympus 12-40 f2.8', technical_specs: '24mm, 200ISO, f/2.8, 1/100', print_info: 'Canon Premium Matte', location: 'Washington Coast' },
    12: { title: 'Japanese Garden', gear: 'OM-3, Olympus 75 f1.8', technical_specs: '75mm 200ISO, f/8.0, 1/100', print_info: 'Canon Pro Luster', location: 'St. Louis Botanical Garden, MO' },
    7: { title: 'Maine Coast', gear: 'OM-1, OM 150-400 f4.5', technical_specs: '280mm, 500ISO, f/5.6, 0.6sec', print_info: 'Canon Premium Matte', location: 'Acadia National Park, ME' },
    1: { title: 'Washington Light Beams', gear: 'E-M1 Mark III, Olympus 17 f1.8', technical_specs: '17mm, 200ISO, f/1.8, 1/5000', print_info: 'Canon Premium Matte', location: 'Washington Coast' },
    3: { title: 'Curtain Falls', gear: 'E-M1 Mark III, Olympus 17 f1.8', technical_specs: '17mm, 64ISO, f/22, 1/2', print_info: 'Canon Premium Matte', location: 'BWCA, ME' },
    9: { title: 'Provincetown Lighthouse', gear: 'OM-1, OM 150-400 f4.5', technical_specs: '272mm, 200ISO, f/8.0, 1/640', print_info: 'Canon Premium Matte', location: 'Provincetown, MA' },
    5: { title: 'Atacama Desert', gear: 'OM-1, Olympus 17 f1.8', technical_specs: '17mm, 200ISO, f/1.8, 1/8000', print_info: 'Canon Pro Luster', location: 'Atacama Desert, Chile' },
    10: { title: 'Dunes', gear: 'OM-1 Mark II, OM 150-400 f4.5', technical_specs: '250mm, 200ISO, f/14.0, 1/2', print_info: 'Canon Premium Matte', location: 'Great Sand Dune National Park, CO' },
  },
  abstract: {
    4: { title: 'Mushroom', gear: 'E-M1 Mark III, OM 100-400 f5.0-6.3 + MC-20', technical_specs: '800mm, 640ISO, f/13.0, 1/800', print_info: 'Canon Pro Luster', location: 'Falls of the Ohio, IN' },
    7: { title: 'Twisted Water', gear: 'E-M1 Mark III, Olympus 40-150 f2.8', technical_specs: '150mm, 64ISO, f/5.6, 1.3', print_info: 'Canon Premium Matte', location: 'Falls of the Ohio, IN' },
    2: { title: 'Shells', gear: 'E-M1 Mark III, Olympus 12-40 f2.8', technical_specs: '17mm, 200ISO, f/3.2, 1/125', print_info: 'Canon Pro Luster', location: 'Washington Coast' },
    1: { title: 'Textured Shore', gear: 'E-M1 Mark III, Olympus 17 f1.8', technical_specs: '17mm, 400ISO, f/9.0, 1/1600', print_info: 'Canon Pro Luster', location: 'Seattle, WA' },
    3: { title: 'Green', gear: 'E-M1 Mark III, OM 100-400 f5.0-6.3 + MC-20', technical_specs: '200mm, 6400ISO, f/10.0, 1/400', print_info: 'Canon Premium Matte', location: 'Falls of the Ohio, IN' },
    6: { title: 'Wood Bark', gear: 'E-M1 Mark III, Olympus 75 f1.8', technical_specs: '75mm, 1000ISO, f/8.0, 1/60', print_info: 'Canon Premium Matte', location: 'Falls of the Ohio, IN' },
    5: { title: 'Stone', gear: 'E-M1 Mark III, Olympus 75 f1.8', technical_specs: '75mm, 200ISO, f/1.8, 1/125', print_info: 'Canon Premium Matte', location: 'Falls of the Ohio, IN' },
  },
  cityscape: {
    6: { title: 'Minneapolis Frame', gear: 'OM-3, Olympus 75 f1.8', technical_specs: '75mm, 200ISO, f/5.0, 1/4000', print_info: 'Canon Pro Luster', location: 'Minneapolis, MN' },
    4: { title: 'Lattice Locks', gear: 'E-M1 Mark III, Olympus 40-150 f2.8 + MC-14', technical_specs: '210mm, 200ISO, f/16.0, 1/400', print_info: 'Canon Pro Luster', location: 'Louisville, KY' },
    1: { title: 'Louisville Lights', gear: 'E-M1 Mark III, Olympus 40-150 f2.8 + MC-14', technical_specs: '56mm, 200ISO, f/9.0, 3.2', print_info: 'Canon Pro Luster', location: 'Louisville, KY' },
    3: { title: 'Walking Bridge', gear: 'E-M1 Mark III, Olympus 40-150 f2.8 + MC-14', technical_specs: '56mm, 200ISO, f/4.0, 1/125', print_info: 'Canon Pro Luster', location: 'Louisville, KY' },
    5: { title: 'Navidad Beach Houses', gear: 'OM-1, OM 100-400 f5.0-6.3', technical_specs: '100mm, 80ISO, f/5.0, 1/2000', print_info: 'Canon Pro Luster', location: 'Chilean Coast' },
    2: { title: '2nd Street Blood Moon', gear: 'E-M1 Mark III, Olympus 40-150 f2.8 + MC-14', technical_specs: '87mm, 200ISO, f/11.0, 5sec', print_info: 'Canon Pro Luster', location: 'Louisville, KY' },
    7: { title: 'Minneapolis Form', gear: 'OM-3, Olympus 75 f1.8', technical_specs: '75mm, 200ISO, f/6.3, 1/2000', print_info: 'Canon Pro Luster', location: 'Minneapolis, MN' },
  },
  plants: {
    9: { title: 'Fern', gear: 'OM-3, Olympus 75 f1.8', technical_specs: '75mm, 200ISO, f/8.0, 1/160', print_info: 'Canon Premium Matte', location: 'St. Louis Botanical Garden, MO' },
    4: { title: 'Mushroom', gear: 'OM-1, OM 100-400 f5.0-6.3', technical_specs: '400mm, 8000ISO, f/8.0, 1/320', print_info: 'Canon Pro Luster', location: 'Jefferson Memorial Forest, KY' },
    2: { title: 'Washington Flower', gear: 'E-M1 Mark III, Olympus 12-40 f2.8', technical_specs: '40mm, 200ISO, f/2.8, 1/125', print_info: 'Canon Premium Matte', location: 'Washington Coast' },
    3: { title: 'DC Butterfly', gear: 'E-M1 Mark III, Olympus 40-150 f2.8 + MC-20', technical_specs: '300mm, 160ISO, f/5.6, 1/2000', print_info: 'Canon Premium Matte', location: 'Washington, D.C.' },
    5: { title: 'Swamp Flower', gear: 'OM-1, OM 100-400 f5.0-6.3', technical_specs: '400mm, 500ISO, f/6.3, 1/80', print_info: 'Canon Pro Luster', location: 'Caperton Swamp Park, KY' },
    8: { title: 'Dune Tree', gear: 'OM-1, OM 150-400 f4.5', technical_specs: '263mm, 200ISO, f4.5, 1/4000', print_info: 'Canon Premium Matte', location: 'Great Sand Dune National Park, CO' },
    1: { title: 'Starfish', gear: 'E-M1 Mark III, Olympus 12-40 f2.8', technical_specs: '40mm, 200ISO, f/2.8, 1/250', print_info: 'Canon Pro Luster', location: 'Washington Coast' },
    6: { title: 'Purple Flower', gear: 'E-M1 Mark III, Olympus 40-150 f2.8 + MC-20', technical_specs: '164mm, 6400ISO, f5.6, 1/1600', print_info: 'Canon Premium Matte', location: 'Caperton Swamp Park, KY' },
    7: { title: 'Maine Tree', gear: 'OM-1, Olympus 17 f1.8', technical_specs: '17mm, 125ISO, f/1.8, 1/1000', print_info: 'Canon Pro Luster', location: 'Acadia National Park, ME' },
  },
  stars: {
    2: { title: 'BWCA Stars', gear: 'E-M1 Mark III, Olympus 17 f1.8', technical_specs: '17mm, 4000ISO, f/1.8, 15sec', print_info: 'Canon Pro Luster', location: 'BWCA, MN' },
    3: { title: 'BWCA Stars', gear: 'E-M1 Mark III, Olympus 17 f1.8', technical_specs: '17mm, 1600ISO, f/1.8, 15sec', print_info: 'Canon Pro Luster', location: 'BWCA, MN' },
    6: { title: 'Blood Moon', gear: 'OM-1 Mark II, OM 150-400 + MC-14', technical_specs: '700mm, 12800ISO, f/8.0, 1/5', print_info: 'Canon Pro Luster', location: 'Louisville, KY' },
    4: { title: 'BWCA Stars Up', gear: 'E-M1 Mark III, Olympus 8mm f1.8', technical_specs: '8mm, 800ISO, f/1.8, 20sec', print_info: 'Canon Pro Luster', location: 'BWCA, MN' },
    1: { title: 'Washington Coast Stars', gear: 'E-M1 Mark III, Olympus 8mm f1.8', technical_specs: '8mm, 640ISO, f/1.8, 30sec', print_info: 'Canon Pro Luster', location: 'Washington Coast' },
    5: { title: 'BWCA Trees and Stars', gear: 'E-M1 Mark III, Olympus 8mm f1.8', technical_specs: '8mm, 2500ISO, f/1.8, 25sec', print_info: 'Canon Pro Luster', location: 'Great Sand Dunes National Park, CO' },
    7: { title: 'Dunes Moon', gear: 'OM-1 Mark II, OM 150-400', technical_specs: '158mm, 200ISO, f/22.0, 1/40', print_info: 'Canon Premium Matte', location: 'Great Sand Dunes National Park, CO' },
  },
};

function getNumberFromFilename(filename) {
  const base = path.basename(filename, path.extname(filename));
  const m = base.match(/-(\d+)$/);
  return m ? parseInt(m[1], 10) : null;
}

const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
let id = 1;
const seen = new Set();
const out = [];

for (const img of data.images) {
  const num = getNumberFromFilename(img.filename);
  const meta = SPREADSHEET[img.category] && num != null ? SPREADSHEET[img.category][num] : null;

  const key = `${img.category}-${num}`;
  if (img.category === 'landscape' && num === 4 && seen.has(key)) continue;
  seen.add(key);

  const stem =
    img.unique_id ||
    path.basename(img.filename || '', path.extname(img.filename || ''));

  out.push({
    id: id++,
    category: img.category,
    filename: img.filename,
    unique_id: stem,
    // Preserve existing title / gear / print_info exactly as in gallery-data.json
    title: img.title,
    gear: img.gear ?? '',
    // Only these two fields are merged from the spreadsheet
    technical_specs: meta?.technical_specs ?? img.technical_specs ?? '',
    print_info: img.print_info ?? '',
    location: meta?.location ?? img.location ?? '',
    field_notes: img.field_notes ?? '',
  });
}

fs.writeFileSync(DATA_PATH, JSON.stringify({ images: out }, null, 2), 'utf8');
console.log('Merged', out.length, 'entries into gallery-data.json');
