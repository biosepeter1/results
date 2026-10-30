# Academic Examination & CBT Portal 🎓

A modern, fast, and resilient web-based Academic Examination and Computer-Based Testing (CBT) portal designed for schools and educational institutions. Built with high-performance vanilla web standards, Supabase PostgreSQL database integration, and multi-cloud deployment support.

---

## 🌟 Key Features

- **Student & Teacher Portal (`index.html`)**:
  - Interactive exam sitting with timer, question navigation, and real-time state persistence.
  - Academic result lookup and report card generation.
  - Word document (`.docx`) exam parser and question ingestion using integrated Mammoth.js.
  - Image lightbox preview for diagram-based questions.

- **Administrative Management Dashboard (`admin.html`)**:
  - Centralized examination schedule configuration.
  - Subject catalog management with automated MongoDB ObjectId compatibility.
  - Question bank authoring and batch imports/exports (`JSON` and `CSV`).
  - Score approval and publishing workflows.

- **Resilient Dual Backend**:
  - **Supabase (Primary / Recommended)**: PostgreSQL database with automated Row Level Security (RLS) policies, schema migrations (`supabase/schema.sql`), and real-time query speed.
  - **Firebase (Legacy / Fallback)**: Built-in Firestore and Auth client configuration.

- **Offline-First & CDN Resilient**:
  - Bundled local libraries with automatic CDN fallback.
  - Zero heavy build steps—runs directly in any modern browser.

---

## 📁 Repository Structure

```plaintext
├── admin.html               # Administrator dashboard & question bank manager
├── index.html               # Main student exam & teacher portal
├── DEPLOYMENT_GUIDE.md      # Detailed cloud deployment walkthrough
├── jsconfig.json            # JavaScript tooling & path configuration
├── vercel.json              # Vercel deployment & security header rules
├── _headers                 # Cloudflare Pages security & caching headers
├── _redirects               # Cloudflare Pages SPA/routing fallback
├── firebase.json            # Firebase hosting configuration
├── .firebaserc              # Firebase project settings
├── .gitignore               # Git ignore rules for builds, secrets & OS files
├── css/
│   ├── admin.css            # Styles for administration dashboard
│   └── teacher.css          # Styles for examination & teacher views
├── js/
│   ├── admin.js             # Admin management & question bank logic
│   ├── cbt-catalog.js       # Standard CBT subjects catalog & ObjectId mapping
│   ├── mammoth.browser.min.js # Local offline fallback for DOCX parsing
│   ├── supabase-config.js   # Supabase client configuration & adapter
│   └── teacher.js           # Exam conduction, timer & teacher tools
├── supabase/
│   └── schema.sql           # Complete PostgreSQL DDL (tables, indexes, RLS)
└── data/
    ├── cbtApp_v2.exams.csv
    ├── cbtApp_v2.exams.json
    ├── cbtApp_v2.questions.csv
    └── cbtApp_v2.questions.json
```

---

## 🚀 Quick Start (Local Development)

Because this is built with standard web technologies, no build or compile step is required!

1. **Clone the repository**:
   ```bash
   git clone https://github.com/<your-username>/<your-repo-name>.git
   cd <your-repo-name>
   ```

2. **Serve locally** using any static web server:
   ```bash
   # Using Python 3:
   python -m http.server 8080

   # Or using Node (npx):
   npx serve .

   # Or using VS Code Live Server extension
   ```

3. Open [http://localhost:8080](http://localhost:8080) in your web browser.

---

## ⚙️ Configuration

### Supabase Setup
1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard and run the script in [`supabase/schema.sql`](supabase/schema.sql).
3. Update [`js/supabase-config.js`](js/supabase-config.js) with your project URL and public Anon Key:
   ```javascript
   const SUPABASE_CONFIG = {
     url: "https://your-project.supabase.co",
     anonKey: "your-publishable-anon-key"
   };
   ```

---

## ☁️ Deployment

This project is pre-configured for instant zero-configuration deployment on:

- **Cloudflare Pages** (Recommended for unlimited school bandwidth):
  - Connect your GitHub repository to Cloudflare Pages.
  - Set **Build output directory** to `/` or `.`.
  - Leave **Build command** empty.
- **Vercel**:
  - Import the repository into Vercel. Configuration is handled by [`vercel.json`](vercel.json).
- **Firebase Hosting**:
  - Run `firebase deploy --only hosting`.

For a step-by-step guide, check out [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md).

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
