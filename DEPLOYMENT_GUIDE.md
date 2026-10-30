# Academic Examination & CBT Portal: Cloud Deployment Guide

This guide provides everything you need to run your Academic Portal and CBT offline exam system on modern, high-performance infrastructure: **Supabase** (Database) and **Vercel** or **Cloudflare Pages** (Hosting).

---

## 1. Cloudflare vs. Vercel vs. Supabase — Which is Better?

| Feature | Cloudflare Pages | Vercel | Supabase (Database) |
| :--- | :--- | :--- | :--- |
| **Primary Role** | High-Speed Web Hosting | High-Speed Web Hosting | PostgreSQL Database |
| **Bandwidth Limits** | **100% Free & Unlimited** | 100 GB / month free | Unlimited API calls |
| **Speed in Africa / Global** | 330+ Edge cities (Lagos, Nairobi, JHB) | Global Edge CDN | Frankfurt, London, AWS/GCP |
| **Ease of Deployment** | Drag-and-drop folder OR GitHub | Git integration OR Vercel CLI | Web Dashboard SQL Editor |
| **Best For** | **Recommended for School Bandwidth** | **Great Developer Experience** | **Best for Student/Teacher Data** |

### The Winning Recommendation
- **Database**: **Supabase** (PostgreSQL) is miles ahead of Firebase. It has **no restrictive daily read/write limits**, provides a visual Excel-like table dashboard for school staff, and handles large student datasets effortlessly.
- **Frontend Hosting**: **Cloudflare Pages** or **Vercel**. Both work identically with zero code changes. Cloudflare Pages is especially advantageous for schools because bandwidth is 100% free with no monthly data cap.

---

## 2. Step 1: Set Up Supabase Database (5 Minutes)

1. Go to [https://supabase.com](https://supabase.com) and create a free account.
2. Click **New Project**, choose an organization, name it `school-exam-portal`, and set a strong database password. Choose the closest region (e.g. Europe - London or Frankfurt).
3. Once the project is created, click **SQL Editor** on the left menu.
4. Click **New query**, open the file [`supabase/schema.sql`](./supabase/schema.sql), copy all its contents, paste them into the query editor, and click **Run**.
   - This automatically creates:
     - `exam_results` (Student score records)
     - `exam_teachers` (Teacher logins and assigned subjects/classes)
     - `cbt_submissions` (Exams created by teachers with questions and diagrams)
     - `cbt_subjects` (Official catalog with MongoDB ObjectIds)
     - `exam_meta` (System metadata)
     - Row Level Security (RLS) policies and performance indexes.
5. Go to **Project Settings** (gear icon) -> **API**:
   - Copy **Project URL** (e.g. `https://xyzcompany.supabase.co`)
   - Copy **Project API Key** (the `anon` public key)
6. Open [`js/supabase-config.js`](./js/supabase-config.js) and paste your URL and Anon Key into `SUPABASE_CONFIG`.

---

## 3. Step 2A: Deploy to Cloudflare Pages (Easiest & Free Unlimited Bandwidth)

### Method 1: Direct Folder Upload (No Git Required)
1. Go to [https://dash.cloudflare.com](https://dash.cloudflare.com) and sign in.
2. In the left sidebar, click **Workers & Pages** -> **Create application** -> **Pages** tab.
3. Click **Upload assets**.
4. Give your project a name (e.g. `school-academic-portal`).
5. Drag and drop this whole folder (the one containing `index.html`, `admin.html`, `css/`, `js/`) into the upload box.
6. Click **Deploy site**.
7. Your portal will be live immediately on a free global URL (e.g. `https://school-academic-portal.pages.dev`).

### Method 2: GitHub Integration
1. Push this folder to a GitHub repository.
2. In Cloudflare Pages, select **Connect to Git** -> select your repository.
3. Build setting: Leave **Build command** empty. Set **Build output directory** to `/` or `.`.
4. Click **Save and Deploy**. Every time you push changes to GitHub, Cloudflare automatically deploys in seconds.

---

## 4. Step 2B: Deploy to Vercel (Alternative)

### Method 1: Via Vercel Dashboard
1. Push this folder to a GitHub repository.
2. Go to [https://vercel.com](https://vercel.com) and sign in.
3. Click **Add New** -> **Project** -> Import your GitHub repository.
4. Framework Preset: Select **Other**.
5. Click **Deploy**.
6. The included [`vercel.json`](./vercel.json) automatically configures clean URLs and security headers.
   - Teachers access: `https://your-project.vercel.app/`
   - Admins access: `https://your-project.vercel.app/admin`

---

## 5. Summary of Included Configuration Files

- [`supabase/schema.sql`](./supabase/schema.sql): Complete database creation script with indexes and RLS policies.
- [`js/supabase-config.js`](./js/supabase-config.js): Supabase credentials configuration file.
- [`vercel.json`](./vercel.json): Vercel routing rules, clean URLs, and HTTP cache headers.
- [`_redirects`](./_redirects): Cloudflare Pages clean route rewrites (`/admin`, `/teacher`).
- [`_headers`](./_headers): Cloudflare Pages browser caching and HTTP security headers.

