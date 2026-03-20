# Connect this folder to GitHub + Netlify

Replace `YOUR_GITHUB_URL` below with your repo URL, e.g. `https://github.com/yourusername/woven-light-portfolio.git`

## 1. Open Terminal and go to the project

```bash
cd /Users/williamwaun/Desktop/woven-light-portfolio
```

## 2. Initialize Git and commit everything

```bash
git init
git branch -M main
git add -A
git commit -m "Initial commit: portfolio site"
```

## 3. Link GitHub and push to `main`

```bash
git remote add origin YOUR_GITHUB_URL
git push -u origin main
```

Example (HTTPS):

```bash
git remote add origin https://github.com/yourusername/your-repo-name.git
git push -u origin main
```

If GitHub shows an error because the remote already has commits (e.g. README), run **once**:

```bash
git pull origin main --allow-unrelated-histories
```

Resolve any merge conflicts if prompted, then:

```bash
git push -u origin main
```

## 4. Netlify

In Netlify: **Add new site → Import from Git** → pick this GitHub repo → set build command/publish directory per your setup (often **publish directory** = `.` if static, or leave defaults).

After this, `watcher.js` can run `git push` and Netlify will build when you publish from Lightroom.

## 5. Authentication

- **HTTPS:** Git may ask for a **Personal Access Token** (not your password) when you push.
- **SSH:** Use `git@github.com:yourusername/your-repo.git` as `origin` and add your SSH key to GitHub.
