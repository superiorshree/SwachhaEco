# Vercel & Supabase Cloud Deployment Guide

**SwachhSetu • Pune Municipal Corporation (PMC)**

This guide provides step-by-step instructions to deploy SwachhSetu to **Vercel** with a **Supabase (Cloud PostgreSQL)** production database.

---

## Overview

| Component | Provider | Configuration |
|---|---|---|
| **Frontend SPA** | Vercel Edge Network | Built via Vite to `client/dist` |
| **Backend API** | Vercel Serverless Functions | Express app at `api/index.ts` |
| **Cloud Database** | Supabase (PostgreSQL) | Configured via `SUPABASE_URL` & `SUPABASE_KEY` |
| **Photo Uploads** | Serverless In-Memory | Base64 Data URL or Supabase Storage |
| **Local Fallback** | SQLite (`smartwaste.db`) | Automatic when Supabase credentials are empty |

---

## Step 1: Set Up Supabase Cloud Database (2 minutes)

1. Go to [https://supabase.com](https://supabase.com) and sign in (or sign up for free).
2. Click **"New Project"**:
   - **Name**: `swachhsetu` (or your preferred name)
   - **Database Password**: Set a secure password
   - **Region**: Select closest to your users (e.g. `South Asia (Mumbai)` for India)
   - Click **"Create new project"**.
3. Once the database finishes provisioning (~1 minute):
   - In the left sidebar, click on **SQL Editor**.
   - Click **"New Query"**.
   - Open [`supabase_schema.sql`](./supabase_schema.sql) from this repository, copy its entire contents, and paste it into the SQL editor.
   - Click **"Run"** (or press `Ctrl + Enter`).
4. **All tables and Pune seed data are now live!**
   - Tables created: `users`, `requests`, `ratings`, `badges`
   - Pre-seeded personas: **Shreeyansh Mahamuni** (Kothrud, Verified Citizen), **Priya Deshmukh**, **Rohan Shinde** (flagged fraud), Field Collectors **Santosh Shinde** & **Sunita Kamble**, and Admin **Mahesh Gokhale**.

5. Retrieve your API credentials:
   - Click **Project Settings** (gear icon at the bottom left) -> **API**.
   - Copy **Project URL** (e.g. `https://xyzcompany.supabase.co`).
   - Under *Project API keys*, copy the **`anon` `public`** key (or the **`service_role`** key).

---

## Step 2: Push Repository to GitHub

If you haven't pushed your code to GitHub yet:

```bash
git init
git add .
git commit -m "feat: SwachhSetu Pune Municipal Corporation portal with Vercel and Supabase support"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/swachhsetu.git
git push -u origin main
```

---

## Step 3: Deploy to Vercel (1 minute)

1. Go to [https://vercel.com](https://vercel.com) and log in.
2. Click **"Add New..."** -> **"Project"**.
3. Import your GitHub repository: `swachhsetu`.
4. Configure Project Settings:
   - **Framework Preset**: *Vite* (or *Other*)
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build:client` (already configured in `vercel.json`)
   - **Output Directory**: `client/dist` (already configured in `vercel.json`)
5. Under **Environment Variables**, add:
   - `SUPABASE_URL` = `https://your-project-id.supabase.co`
   - `SUPABASE_KEY` = `your-anon-or-service-role-key`
6. Click **"Deploy"**.

Vercel will build the React frontend and deploy the serverless `/api` endpoints automatically. In under 60 seconds, your production URL will be live!

---

## Step 4: Verify Deployment

1. Visit your Vercel deployment URL (e.g. `https://swachhsetu.vercel.app`).
2. Verify:
   - Header shows **`SwachhSetu • Pune EcoPortal`**.
   - Top right shows **`Shreeyansh Mahamuni (Verified)`** with 350 points and 3-week streak.
   - Click **"+ New Pickup"** to submit a pickup request.
   - Switch user to **Santosh Shinde (Collector)** and see claimable and active tasks.
   - Switch user to **Mahesh Gokhale (Admin)** and view municipal metrics and flagged accounts.

---

## Local Development & Testing

You can run the application locally anytime:

```bash
# 1. Install dependencies
npm run install:all

# 2. Run backend (Port 8080)
npm run dev:server

# 3. Run frontend (Port 5173 with proxy to 8080)
npm run dev:client
```

- When `SUPABASE_URL` is set in your `.env`, local dev talks directly to Supabase Cloud!
- When `.env` has no Supabase keys, it automatically falls back to local SQLite (`smartwaste.db`).
