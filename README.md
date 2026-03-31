# Weight Tracker

A progressive web app for tracking your daily body weight — installable on iPhone and desktop, with offline support and cross-device sync via Supabase.

## Features

- Log weight in **lbs or kg** (stored in lbs, decimals to 1 place)
- **Line graph** of all entries with date on x-axis and weight on y-axis
- **7-day rolling median overlay** (toggleable)
- Click/tap any graph point to **highlight that entry** in the list
- **Edit or delete** any entry inline
- **Dark mode** by default, with a toggle for light mode
- **Offline support** — works without internet, syncs when reconnected
- Fully installable PWA — add to iPhone home screen via Safari

---

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in (or create a free account).
2. Click **New Project**.
3. Choose your organization, give the project a name (e.g. `weight-tracker`), set a database password, and pick a region close to you.
4. Wait ~2 minutes for the project to provision.

### Run the Database Schema

1. In your Supabase project, go to **SQL Editor** (left sidebar).
2. Click **New query** and paste the following:

```sql
-- Create the weight entries table
CREATE TABLE weight_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  weight_lbs numeric(6,1) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for fast date-ordered queries
CREATE INDEX weight_entries_date_idx ON weight_entries(date DESC);

-- Enable Row Level Security
ALTER TABLE weight_entries ENABLE ROW LEVEL SECURITY;

-- Allow all operations (single-user app, no auth required)
CREATE POLICY "allow all" ON weight_entries
  FOR ALL USING (true) WITH CHECK (true);
```

3. Click **Run** (or press `Cmd+Enter`).

### Get Your API Keys

1. In your Supabase project, go to **Project Settings → API**.
2. Copy:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon / public** key (under "Project API Keys")

---

## Step 2: Set Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` and fill in your keys:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> **Note:** The app also works without Supabase — it will use `localStorage` only ("Local mode" shown in header). No sync across devices in that case.

---

## Step 3: Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Step 4: Deploy to Vercel

### Option A — Vercel CLI (fastest)

```bash
npm install -g vercel
vercel
```

Follow the prompts. When asked about build settings, Vercel will auto-detect Vite — just accept defaults.

### Option B — Vercel Dashboard (GitHub)

1. Push this project to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) → **Add New Project**.
3. Import your GitHub repo.
4. Vercel auto-detects Vite. No changes needed.
5. **Before deploying**, add your environment variables:
   - Go to **Settings → Environment Variables**
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
6. Click **Deploy**.

Your app will be live at `https://your-app.vercel.app`.

---

## Step 5: Install on iPhone

1. Open your deployed URL in **Safari** on your iPhone.
2. Tap the **Share** button (box with arrow).
3. Tap **Add to Home Screen**.
4. Name it "Weight Tracker" and tap **Add**.

The app will open full-screen (no browser chrome) and work offline.

---

## Project Structure

```
weight-tracker/
├── public/
│   └── icons/          # PWA icons (192, 512, 180px)
├── src/
│   ├── components/
│   │   ├── App.jsx
│   │   ├── Header.jsx
│   │   ├── WeightForm.jsx
│   │   ├── WeightChart.jsx
│   │   └── EntryList.jsx
│   ├── hooks/
│   │   ├── useWeightData.js   # Supabase + localStorage sync
│   │   └── useTheme.js
│   ├── lib/
│   │   └── supabase.js
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js       # PWA plugin config
├── tailwind.config.js
├── vercel.json          # SPA routing for Vercel
├── .env.example
└── package.json
```

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 + Vite | UI framework and build tool |
| Tailwind CSS v3 | Utility-first styling |
| Recharts | Chart library |
| Supabase JS | Backend / real-time database |
| vite-plugin-pwa | Service worker + manifest generation |
| Workbox | Offline caching strategy |
