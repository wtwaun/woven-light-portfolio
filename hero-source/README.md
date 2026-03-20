# Homepage hero source

Place your master file here as:

**`P8150904-Enhanced-NR-Edit.tif`**

(same stem as your edit; `.tiff` also works)

Then from the project root run:

```bash
npm run hero:build
```

That writes **`images-optimized/wildlife/P8150904-Enhanced-NR-Edit.webp`**, which is the path locked in `script.js` (`HOME_HERO`) and in `gallery-data.json`.

You can keep `.tif` files out of Git (large binaries); only the WebP under `images-optimized/` needs to be committed for the live site.
