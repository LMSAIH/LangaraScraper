This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```


# 🎓 Langara Unified Scraper API

This is a full-stack scraping project built with **Next.js**, designed to expose structured data from three sources via clean API endpoints:

- 🏫 **Langara Course Scraper**
- 🔁 **BC Transfer Guide Scraper**
- 👨‍🏫 **RateMyProfessors Scraper**

Supports integration with a planner/calendar frontend or external tools via REST.

---

## 📁 Project Structure

```
/langara-course-scraper/
├── /lib/sources       # Source-specific scraper logic
├── /pages/api/scrape  # Unified API route
├── /models            # Optional: MongoDB models
├── /pages/index.js    # Optional: UI planner frontend
```

---

## 🚀 Setup Instructions

### 1. Clone and install

```bash
git clone https://github.com/yourusername/langara-course-scraper.git
cd langara-course-scraper
npm install
```

### 2. Run locally

```bash
npm run dev
```

### 3. Optional: Configure `.env.local`

If using MongoDB:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
```

---

## 🔌 API Endpoints

Each endpoint is available at:

```
GET /api/scrape/[source]?q=your-query
```

### ✅ Langara

| Example                          | Description                    |
|----------------------------------|--------------------------------|
| `/api/scrape/langara?q=abst-1102` | Fetch course info from Langara |

### ✅ BC Transfer

| Example                                      | Description                             |
|----------------------------------------------|-----------------------------------------|
| `/api/scrape/bctransfer?q=LANGARA:STAT1123`  | Look up equivalency in BC Transfer Guide |

### ✅ RateMyProf

| Example                                     | Description                     |
|---------------------------------------------|---------------------------------|
| `/api/scrape/ratemyprof?q=Smith Langara`    | Search for a prof at Langara    |

---

## 🛠 Folder Descriptions

| Folder/File                    | Purpose |
|-------------------------------|---------|
| `lib/sources/`                | Scraper logic for each source |
| `pages/api/scrape/[source].js` | Dynamic API route dispatcher |
| `models/`                     | MongoDB schemas (optional) |
| `pages/index.js`              | Planner/calendar frontend (optional) |

---

## 💡 Features to Add

- ✅ Calendar planner UI with drag-and-drop
- ✅ Caching scraped results to MongoDB
- 🔐 API key auth for rate-limiting access
- 🕒 Scheduled scraping with Vercel Cron or GitHub Actions

---

## 📦 Deployment

Deploy to [Vercel](https://vercel.com/) with:

1. Push this repo to GitHub
2. Connect to Vercel
3. Add any environment variables (MongoDB, etc.)
4. Trigger your scraping endpoints from the frontend or curl

---

## 🧠 License

MIT — free to use, modify, and share.
