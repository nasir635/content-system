# ContentOS — Setup & Deploy Guide

## What you're deploying
A full Next.js app that runs on Vercel. Instagram dissection, script studio, streamlines, and a dashboard — all styled like Instagram, data saved in Notion.

---

## Step 1 — Get a GitHub account (if you don't have one)
Go to **github.com** → Sign up (free). You need this to deploy to Vercel.

---

## Step 2 — Push this code to GitHub
1. Install Git if you don't have it: **git-scm.com**
2. Open terminal in the `content-system` folder
3. Run:
```bash
git init
git add .
git commit -m "Initial ContentOS"
```
4. On GitHub, click **New Repository** → name it `content-system` → Create
5. Follow the "push existing repo" commands GitHub shows you

---

## Step 3 — Set up Notion
1. Go to **notion.so/my-integrations** → New Integration → name it "ContentOS" → Submit
2. Copy the **Internal Integration Token** (starts with `secret_`)
3. Create a new Notion page called "ContentOS" — this is where the databases will live
4. Open that page → click `...` → `Add connections` → add your integration
5. Copy the **Page ID** from the URL: `notion.so/YOUR-PAGE-ID-HERE`

---

## Step 4 — Set up Bright Data
1. Go to **brightdata.com** → Sign up (free trial available)
2. Create a new zone: **Web Unlocker** → name it `instagram_scraper`
3. Copy your **API Key** from the dashboard

---

## Step 5 — Get your Anthropic API key
1. Go to **console.anthropic.com** → API Keys → Create key
2. Copy it (starts with `sk-ant-`)

---

## Step 6 — Deploy to Vercel
1. Go to **vercel.com** → Sign up with GitHub
2. Click **New Project** → Import your `content-system` repo
3. Before deploying, click **Environment Variables** and add:

| Variable | Value |
|---|---|
| `NOTION_TOKEN` | Your Notion integration token |
| `NOTION_DISSECTIONS_DB_ID` | Leave blank for now — add after Step 7 |
| `NOTION_SCRIPTS_DB_ID` | Leave blank for now |
| `NOTION_STREAMLINES_DB_ID` | Leave blank for now |
| `ANTHROPIC_API_KEY` | Your Anthropic key |
| `BRIGHTDATA_API_KEY` | Your Bright Data API key |
| `BRIGHTDATA_ZONE` | `instagram_scraper` |
| `BLOB_READ_WRITE_TOKEN` | See below |

4. For `BLOB_READ_WRITE_TOKEN`: In Vercel, go to **Storage** → **Create Blob Store** → copy the token
5. Click **Deploy**

---

## Step 7 — Create Notion databases (one-time)
1. Open your deployed app (e.g. `your-app.vercel.app`)
2. Go to **Settings** tab
3. Paste your Notion token and parent page ID
4. Click **Create Notion Databases**
5. Copy the 3 database IDs it shows you
6. Go back to Vercel → Project Settings → Environment Variables
7. Add the 3 database IDs → **Redeploy**

---

## Step 8 — You're live!
Open your Vercel URL on any device. Start dissecting content.

---

## Running locally (optional)
```bash
cd content-system
npm install
cp .env.example .env.local
# fill in .env.local with your keys
npm run dev
# Open http://localhost:3000
```
