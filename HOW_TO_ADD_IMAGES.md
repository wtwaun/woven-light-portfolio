# How to Add Your Images

## Quick Answer
**Place images in `images/Website [Category]/`, run `npm run optimize-images`, then `npm run generate-gallery-data`.** The gallery reads from `gallery-data.json` (or uses a built-in fallback if the file can’t be loaded).

## Step-by-Step Instructions

### Step 1: Place Your Images in Website Folders
Put your photos in the appropriate **Website** category folders:
- `images/Website Wildlife/` - for wildlife photos
- `images/Website Landscape/` - for landscape photos
- `images/Website Abstract/` - for abstract photos
- `images/Website Cityscape/` - for cityscape photos
- `images/Website Plants/` - for plant photos
- `images/Website Stars/` - for astrophotography

### Step 2: Optimize Images
```bash
npm run optimize-images
```
Outputs WebP files to `images-optimized/{category}/`.

### Step 3: Update the Gallery Manifest
```bash
npm run generate-gallery-data
```
Scans `images/` and writes `gallery-data.json`. **Display order follows the order in that file**—reorder by editing the JSON.

### Step 4: Edit gallery-data.json (optional)
Each entry has:
- **title** – Display caption (default from filename)
- **gear** – e.g. `OM-1 Mark II`
- **print_info** – e.g. `Canon Pro-1000 | Pro Luster`

### Supported File Formats (source)
- `.jpg` / `.jpeg`
- `.png`

### Note
For the gallery to load from `gallery-data.json`, open the site over **HTTP** (e.g. `npx serve` or `python3 -m http.server 8080`). If you open `index.html` directly (file://), the site uses the built-in fallback list so the gallery still works.

