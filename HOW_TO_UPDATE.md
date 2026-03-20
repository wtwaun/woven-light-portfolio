# How to Update Your Website After Deployment

Once your site is live, here's how to make changes and update it:

## General Process

1. **Make changes locally** on your computer
2. **Test the changes** to make sure everything works
3. **Upload/redeploy** the updated files

---

## Method 1: Netlify (Drag & Drop Method)

If you deployed by dragging your folder to Netlify:

### Option A: Drag & Drop Again (Easiest)
1. Make your changes to files on your computer
2. Test locally (open `index.html` in browser)
3. Go to [netlify.com](https://www.netlify.com) and log in
4. Find your site in the dashboard
5. Go to the "Deploys" tab
6. Drag your updated `woven-light-portfolio` folder onto the deploy area
7. Your site will update automatically!

### Option B: Netlify Drop (Even Easier)
1. Make your changes
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
3. Drag your updated folder
4. Done!

**Note:** Each drag & drop creates a new deployment. Your old site stays live until the new one is ready.

---

## Method 2: Netlify with Git (Recommended for Frequent Updates)

If you want automatic updates, connect Netlify to GitHub:

### Setup (One Time):
1. Create a GitHub account and repository (see GitHub Pages section below)
2. In Netlify, go to "Add new site" > "Import an existing project"
3. Connect to GitHub and select your repository
4. Netlify will auto-deploy whenever you push changes

### Making Updates:
```bash
# Make your changes locally
# Then commit and push:
cd /Users/williamwaun/woven-light-portfolio
git add .
git commit -m "Updated images/added new photos"
git push
```

Netlify will automatically detect the changes and redeploy your site!

---

## Method 3: GitHub Pages

If you deployed via GitHub Pages:

### Making Updates:
1. **Make changes** to your files locally
2. **Test locally** (open `index.html` in browser)
3. **Commit and push** your changes:

```bash
cd /Users/williamwaun/woven-light-portfolio
git add .
git commit -m "Description of your changes"
git push
```

4. **Wait 1-2 minutes** - GitHub Pages automatically updates
5. **Refresh your site** to see the changes

**Note:** Changes usually appear within 1-2 minutes, but can take up to 10 minutes.

---

## Method 4: Vercel

If you deployed via Vercel:

### With Git (Automatic):
1. Make changes locally
2. Commit and push:
```bash
git add .
git commit -m "Your changes"
git push
```
3. Vercel automatically redeploys!

### Without Git (Manual):
1. Make changes locally
2. Run:
```bash
vercel --prod
```

---

## Method 5: Traditional Web Hosting (FTP)

If you're using traditional hosting:

1. **Make changes** to your files locally
2. **Test locally**
3. **Use FTP client** (FileZilla, Cyberduck, etc.) or your hosting's file manager
4. **Upload only the changed files** to your server
5. **Refresh your website** to see changes

---

## Common Update Scenarios

### Adding New Images

1. Add your new image files to the appropriate folder (e.g., `images/wildlife/`)
2. Open `script.js`
3. Add a new entry to the `galleryImages` array:
   ```javascript
   { src: 'images/wildlife/Wildlife-75.jpg', category: 'wildlife', alt: 'Wildlife Photography' },
   ```
4. Save the file
5. Test locally
6. Deploy using your chosen method above

### Changing the Logo

1. Replace `logowhite.png` in your project folder with your new logo
2. Make sure it's named exactly `logowhite.png`
3. Test locally
4. Deploy the updated `logowhite.png` file

### Updating Colors/Design

1. Edit `styles.css` to change colors, fonts, etc.
2. Test locally
3. Deploy the updated `styles.css` file

### Adding/Removing Categories

1. Edit `index.html` to add/remove category buttons
2. Edit `script.js` to update the `galleryImages` array
3. Test locally
4. Deploy both files

---

## Testing Changes Locally

**Always test before deploying!**

```bash
# Navigate to your project folder
cd /Users/williamwaun/woven-light-portfolio

# Start a local server
python3 -m http.server 8000

# Open in browser
# Visit: http://localhost:8000
```

Or simply double-click `index.html` to open in your browser.

---

## Best Practices

1. **Test locally first** - Always check your changes work before deploying
2. **Keep backups** - Save copies of working versions
3. **Use descriptive commit messages** - If using Git, write clear messages about what changed
4. **Update incrementally** - Make small changes and test, rather than many changes at once
5. **Check after deployment** - Always visit your live site after updating to verify changes

---

## Quick Reference

| Method | How to Update |
|--------|---------------|
| **Netlify (Drag & Drop)** | Drag folder to Netlify again |
| **Netlify (Git)** | `git push` (auto-deploys) |
| **GitHub Pages** | `git push` (auto-updates in 1-2 min) |
| **Vercel (Git)** | `git push` (auto-deploys) |
| **Vercel (Manual)** | `vercel --prod` |
| **FTP/Web Hosting** | Upload changed files via FTP |

---

## Troubleshooting

**Changes not showing?**
- Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Wait a few minutes (some hosts cache content)
- Check that you uploaded the correct files
- Verify file paths are correct

**Images not loading?**
- Check file names match exactly (case-sensitive)
- Verify images are in the correct folders
- Make sure image paths in `script.js` are correct

**Site looks broken?**
- Check browser console for errors (F12)
- Verify all files were uploaded
- Test locally first to catch errors

---

## Need Help?

- **Netlify Support**: [docs.netlify.com](https://docs.netlify.com)
- **GitHub Pages**: [docs.github.com/pages](https://docs.github.com/pages)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)

