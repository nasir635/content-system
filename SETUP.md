# ContentOS — Setup & Deploy Guide

## What this is
A personal content portal that runs on Vercel. Save **Inspirations** (a reel or
any link + how you'll use it + reference shots), write your own **Scripts** in a
Notion-style editor, and keep a **References** library — everything cross-linked
and synced. No Notion, no AI keys. Data is stored online by the app itself, so
you can open it from any device.

---

## Step 1 — Push to GitHub (already done)
This repo lives at **github.com/nasir635/content-system** and auto-deploys to
Vercel on every push to `main`.

To work on it locally:
```bash
git clone https://github.com/nasir635/content-system.git
cd content-system
npm install
npm run dev      # http://localhost:3000
```

---

## Step 2 — Deploy on Vercel (already connected)
The repo is linked to the Vercel project `content-system`. Pushing to `main`
builds and deploys automatically — no env vars are required for the app to run.

Live URL: **content-system-six.vercel.app**

---

## Step 3 — Turn on cross-device sync (one-time, ~2 min)
By default the portal saves to the browser you're using. To sync your data
across devices, connect a free **Vercel Blob** store:

1. Go to **vercel.com** → your **content-system** project → **Storage**
2. Click **Create Database** → choose **Blob** → connect it to this project
3. Vercel automatically adds the `BLOB_READ_WRITE_TOKEN` env var and triggers a
   redeploy
4. Open the app → **Settings** → it should now say **“Cloud sync is active”**

That's it. From then on, your inspirations, scripts, and references load on any
device where you open the URL. Uploaded images are stored in the same Blob store.

> Note: the portal has no login — anyone with the URL can view and edit it. Keep
> the link private, or ask to add a password if you want access control.

---

## Backups
Settings → **Export backup (JSON)** downloads everything in one file at any time.
