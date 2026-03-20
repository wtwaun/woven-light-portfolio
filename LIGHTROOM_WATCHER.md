# Lightroom publish watcher (plug-and-play)

This project includes **`watcher.js`**, which watches **category subfolders** under your publish root, converts new JPEGs to WebP, **upserts** **`gallery-data.json`** (by **`unique_id`**), **removes** rows and WebPs when you delete a publish file, and (optionally) runs **`git add` / `commit` / `push`**.

### Bulletproof database behavior

- **Folder = category (recursive)** — The watcher watches the **entire** publish tree (nested **Published Folder** paths, etc.). It walks **up** from the JPEG’s **parent folder** toward the publish root and uses the **first** folder whose name matches **Wildlife**, **Landscape**, **Abstract**, **Cityscape**, **Plants**, or **Stars** (case-insensitive; fuzzy aliases still map). Example: **`…/Wildlife/Lightroom Export/001-foo.jpg`** → **Wildlife**. **IPTC / XMP category tags are ignored** for routing. JPEGs **directly** in the publish root (no subfolder) get **`category: "uncategorized"`** and WebPs go to **`images-optimized/uncategorized/`**. **`_processed/`** at the publish root is **ignored** for watching and is **never** treated as a category (ingest moves completed JPEGs there so they don’t re-trigger).
- **`unique_id`** — If the filename uses **Custom Order** (see below), the part **after** the leading number is used (e.g. `001-P8150904.jpg` → `P8150904`). Otherwise: metadata **Original Filename** (EXIF / XMP), or the **export basename** if those are missing.
- **`sort_order`** — Names like **`001-P8150904.jpg`** set **`sort_order`** from the leading number (per category) and **re-sort** `gallery-data.json` after each change. Entries **without** that prefix sort **after** all numbered items on the site.
- **WebP on disk** — **`images-optimized/{category}/{unique_id}.webp`**. Re-publishing **overwrites** that file.
- **Updates** — Same **`unique_id`** → update metadata and path (e.g. after moving the file to another category folder).
- **Mirror deletions** — Deleting a JPEG from a category subfolder removes the **`gallery-data.json`** row (**`unique_id` + `category`**) and the **`.webp`**, then runs git with **`gitRemoveCommitMessage`** when **`autoGitPush`** is on. Ingest moves to **`_processed`** do **not** trigger this (handled internally).
- **Startup cleanup** — Dedupes by **`unique_id`** / **`filename`**, then sorts by **`sort_order`**.

**Terminal heartbeats:** **`[watcher] New file in Wildlife: 001-P8150904.jpg (# 1)`** (use **`# —`** without a sequence prefix). **`[watcher] File removed from Wildlife: 001-P8150904.jpg. Syncing...`** when a publish file is deleted.

You’ll still see **`[watcher] Updated existing photo: [id]`** or **`[watcher] Added new photo: [id]`** from the upsert step.

### Hard reset `gallery-data.json`

**Stop** `npm run watch-publish` first — otherwise it will rewrite the file as soon as you save. Then edit `gallery-data.json` (e.g. `{"images": []}` or a single hero row), commit, and push. The homepage hero image path is **locked in `script.js`** (`HOME_HERO`); JSON only supplies metadata and the wildlife grid when you include that row.

## 1. One-time setup

1. **Create the publish folder** and **one subfolder per gallery** on your Mac (or point `CONFIG.watchDir` elsewhere):

   `~/Desktop/WILDWAUN_PUBLISH/Wildlife/`, `…/Landscape/`, `…/Abstract/`, `…/Cityscape/`, `…/Plants/`, `…/Stars/`

   You can nest Lightroom **Published Folders** under those folders (e.g. **`Wildlife/My Publish/…`**). Avoid putting new JPEGs **directly** in the publish root unless you want **`uncategorized`**.

2. **Open `watcher.js`** in this repo and check the top **`CONFIG`** block:

   - `watchDir` — already set to `/Users/williamwaun/Desktop/WILDWAUN_PUBLISH` (change if your username or folder differs).
   - `projectRoot` — leave as `__dirname` (the portfolio folder).
   - `autoGitPush` — `true` runs git after each successful photo; set to `false` if you don’t want that.
   - `processedSubdir` — `_processed` (processed JPEGs are moved here so they aren’t picked up twice).
   - `gitRemoveCommitMessage` — commit message when a photo is **deleted** from a category folder and the gallery syncs.

3. **Install dependencies** (from the portfolio folder):

   ```bash
   cd /Users/williamwaun/Desktop/woven-light-portfolio
   npm install
   ```

4. **Git (optional)** — If you use `autoGitPush: true`, initialize or clone the repo with a remote so `git push` works:

   ```bash
   git remote -v
   ```

## 2. Lightroom metadata mapping

Set these in Lightroom’s metadata (IPTC / export). The watcher reads them with **ExifReader**:

| Your field (Lightroom / IPTC) | Saved in `gallery-data.json` |
|------------------------------|------------------------------|
| **Title** (often IPTC *Object Name*) | `title` |
| **Caption** (*Caption/Abstract*) | `field_notes` |
| **Sublocation** (*Sub-location*) | `location` |
| **Headline** | `print_info` |
| **Category** *or* **Keywords** | `category` |

**Category** must resolve to one of:

`wildlife` · `landscape` · `abstract` · `cityscape` · `plants` · `stars`

Examples: keyword `wildlife`, or Category text `Wildlife`. If nothing matches, the watcher defaults to **`wildlife`** and logs a warning.

**Camera EXIF** (automatic):

- `technical_specs` — focal length, ISO, aperture, shutter (combined like your existing site strings).
- `gear` — camera make/model + lens model.

## 3. Start the watcher

From the portfolio directory:

```bash
cd /Users/williamwaun/Desktop/woven-light-portfolio
npm run watch-publish
```

Leave this terminal open while you work. When Lightroom finishes writing a `.jpg` / `.jpeg`, the watcher waits for the file to stabilize (~2s), then processes it.

### Run in the background

```bash
cd /Users/williamwaun/Desktop/woven-light-portfolio
nohup npm run watch-publish > watcher.log 2>&1 &
```

- Logs: `watcher.log`
- Stop: `jobs` then `kill %1`, or `pkill -f "node watcher.js"`

## 4. What happens for each new JPEG

1. Reads metadata (ExifReader + XMP via `@xmldom/xmldom`).
2. Writes **`images-optimized/<category>/<Category>-N.webp`** (next free number for that category).
3. Appends one object to **`gallery-data.json`** with `id`, `filename`, `title`, `gear`, `technical_specs`, `print_info`, `location`, `field_notes`.
4. Moves the original JPEG to **`WILDWAUN_PUBLISH/_processed/`** (with a timestamp in the name).
5. If `autoGitPush` is true and `.git` exists: `git add -A`, `git commit -m "New Photo Published"`, `git push`.

## 5. Troubleshooting

- **“Watch folder does not exist”** — Create `WILDWAUN_PUBLISH` on the Desktop or fix `CONFIG.watchDir`.
- **Wrong category** — Add a single keyword matching one of the six slugs above (matching is **case-insensitive**, e.g. `Wildlife` = `wildlife`).
- **ENOENT / race while moving file** — The watcher waits **2 seconds** after detection, then checks the file exists and size is stable before reading. Processed originals go to `_processed/` (folder is created automatically).
- **WebP “image too large”** — Exports wider/taller than **2500px** on the longest side are resized to fit inside 2500×2500 before WebP encoding.
- **“Not inside a Git repository”** — The script uses **`git rev-parse --show-toplevel`** from `projectRoot`, so it works even if `.git` is on a **parent** folder. If you still see this, you’re not inside a clone (e.g. folder copied without `.git`). Run `git clone` for your Netlify repo, then open that folder in Cursor and run the watcher from there.
- **Git commit skipped** — No changes, or pre-commit hook failed; check terminal output.
- **Git push failed** — No `origin`, auth, or network; fix remote/credentials.

If XMP-heavy exports miss some IPTC fields, ensure metadata is actually embedded in the exported JPEG (Lightroom export settings).
