# NightChat

Discord-style real-time chat with image support, reactions, markdown formatting, and emoji picker.

## Run locally

```bash
npm install
node server.js
```

Open http://localhost:3000

## Deploy to Vercel

> **Heads up:** Vercel is serverless. WebSockets and in-memory chat history don't work reliably on it. Chat will load, but messages may not deliver in real time and history resets often. Render.com or Railway.app are better fits — but here are the Vercel steps anyway.

### 1. Install the Vercel CLI

```bash
npm install -g vercel
```

### 2. Log in

```bash
vercel login
```

It opens your browser. Sign up / log in with GitHub, GitLab, Bitbucket, or email.

### 3. Deploy

From inside the `chatdark-main` folder:

```bash
vercel
```

Answer the prompts:
- **Set up and deploy?** → `Y`
- **Which scope?** → pick your account
- **Link to existing project?** → `N`
- **Project name?** → `nightchat` (or anything)
- **In which directory is your code?** → `./` (just press Enter)
- **Modify settings?** → `N`

Wait ~30 seconds. You'll get a live URL like `https://nightchat-xxx.vercel.app`.

### 4. Promote to production

```bash
vercel --prod
```

Done. Share the URL.

## Deploy to GitHub (when you're ready)

```bash
git init
git add .
git commit -m "Initial commit"
```

Then create a repo on github.com (don't add README/gitignore — you have them) and run the commands GitHub shows you, which look like:

```bash
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/nightchat.git
git push -u origin main
```

## Files

- `server.js` — Express + Socket.io backend
- `public/index.html` — full single-file frontend
- `vercel.json` — Vercel routing config
- `.gitignore` — keeps node_modules out of git
