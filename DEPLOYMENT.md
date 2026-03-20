# How to Deploy Your Portfolio Online

Here are the easiest ways to get your WILD WAUN portfolio website online:

## Option 1: Netlify (Easiest - Recommended)

### Method A: Drag and Drop
1. Go to [netlify.com](https://www.netlify.com) and sign up for a free account
2. Once logged in, you'll see a drag-and-drop area
3. Simply drag your entire `woven-light-portfolio` folder onto the page
4. Netlify will automatically deploy your site and give you a URL like `random-name-123.netlify.app`
5. You can customize the site name in Site settings > General > Site details

### Method B: Using Netlify CLI
```bash
# Install Netlify CLI (if you have Node.js)
npm install -g netlify-cli

# Navigate to your project folder
cd /Users/williamwaun/woven-light-portfolio

# Deploy
netlify deploy

# For production deployment
netlify deploy --prod
```

**Pros:**
- Free SSL certificate
- Custom domain support
- Automatic HTTPS
- Very easy to use
- Free tier is generous

---

## Option 2: GitHub Pages (Free)

1. **Create a GitHub account** at [github.com](https://github.com) if you don't have one

2. **Create a new repository:**
   - Click the "+" icon in the top right
   - Name it something like `woven-light-portfolio`
   - Make it public
   - Don't initialize with README
   - Click "Create repository"

3. **Upload your files:**
   ```bash
   cd /Users/williamwaun/woven-light-portfolio
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/woven-light-portfolio.git
   git push -u origin main
   ```
   (Replace YOUR-USERNAME with your GitHub username)

4. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click "Settings" tab
   - Scroll to "Pages" in the left sidebar
   - Under "Source", select "main" branch
   - Click "Save"
   - Your site will be at: `https://YOUR-USERNAME.github.io/woven-light-portfolio`

**Pros:**
- Free
- Works with git version control
- Custom domain support

---

## Option 3: Vercel (Free)

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click "Add New Project"
3. Import your GitHub repository (or use their CLI)
4. Vercel will automatically detect it's a static site and deploy it

**Using Vercel CLI:**
```bash
npm install -g vercel
cd /Users/williamwaun/woven-light-portfolio
vercel
```

**Pros:**
- Very fast
- Free SSL
- Easy custom domains
- Great performance

---

## Option 4: Traditional Web Hosting

If you have web hosting (like Bluehost, HostGator, etc.):

1. Use an FTP client (like FileZilla) or your hosting's file manager
2. Upload all files from `woven-light-portfolio` to your `public_html` or `www` folder
3. Make sure `index.html` is in the root directory
4. Your site will be live at your domain

---

## Important Notes Before Deploying:

### 1. Test Locally First
Make sure everything works by opening `index.html` in your browser or using a local server:
```bash
cd /Users/williamwaun/woven-light-portfolio
python3 -m http.server 8000
```
Then visit `http://localhost:8000`

### 2. Check File Paths
All your image paths should work correctly. They're already set up as relative paths, so they should work fine.

### 3. Logo File
Make sure your `logowhite.png` file is in the root directory of your project.

### 4. Image Files
Ensure all your image files are in the `images/` folders as expected.

---

## Recommended: Netlify

For the easiest deployment, I recommend **Netlify**:
- No command line needed (drag and drop)
- Free SSL certificate
- Fast CDN
- Easy custom domain setup
- Free tier is perfect for portfolios

Just drag your folder to netlify.com and you're done!

---

## Adding a Custom Domain

Once deployed, you can add your own domain:
1. Purchase a domain (Namecheap, Google Domains, etc.)
2. In your hosting platform (Netlify/Vercel), go to Domain settings
3. Add your custom domain
4. Update DNS records as instructed

Your site will then be accessible at `www.yourdomain.com`!

