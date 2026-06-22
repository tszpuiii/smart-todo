# Deployment Guide (Vercel + Render + MongoDB Atlas)

Your login/register issue happens because **only the frontend is on Vercel**.  
The app calls `/api/...`, but Vercel was returning `index.html` instead of JSON.

This guide deploys:
- **Frontend** → Vercel (`frontend/`)
- **Backend** → Render (`backend/`)
- **Database** → MongoDB Atlas (free tier)

---

## Step 1 — MongoDB Atlas (5 min)

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free cluster.
2. Database Access → create a database user (save username + password).
3. Network Access → add `0.0.0.0/0` (allow from anywhere) for Render.
4. Connect → Drivers → copy connection string, e.g.  
   `mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/smart-todo`
5. Replace `<password>` with your real password (URL-encode special characters).

---

## Step 2 — Deploy backend on Render (10 min)

1. Push this repo to GitHub (public).
2. Go to [https://dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint**.
3. Connect repo `tszpuiii/smart-todo` — Render reads `render.yaml`.
4. Set environment variables when prompted:
   - `MONGO_URI` = your Atlas connection string
   - `CORS_ORIGIN` = `https://YOUR-VERCEL-APP.vercel.app,http://localhost:5173`
   - `JWT_SECRET` = any long random string (Render can auto-generate)
5. Deploy. Wait until status is **Live**.
6. Test: open `https://smart-todo-api.onrender.com/api/health`  
   Expected: `{"status":"ok","timestamp":"..."}`

> **Service name matters:** `render.yaml` uses `smart-todo-api`, so URL is  
> `https://smart-todo-api.onrender.com`. If you pick a different name, update `frontend/vercel.json` proxy URL.

---

## Step 3 — Deploy frontend on Vercel (5 min)

1. Go to [https://vercel.com](https://vercel.com) → Import Git repo.
2. **Root Directory** → set to `frontend` (important).
3. Build command: `npm run build`  
   Output directory: `dist`
4. Before deploy, confirm `frontend/vercel.json` proxy points to your Render URL:

```json
{
  "source": "/api/:path*",
  "destination": "https://smart-todo-api.onrender.com/api/:path*"
}
```

5. Deploy. Copy your live URL, e.g. `https://smart-todo-xxx.vercel.app`.

---

## Step 4 — Link frontend ↔ backend

1. In **Render** → your service → Environment → set/update:
   ```
   CORS_ORIGIN=https://YOUR-VERCEL-URL.vercel.app,http://localhost:5173
   ```
2. **Redeploy** Render (env change requires restart).
3. **Redeploy** Vercel if you changed `vercel.json`.

---

## Step 5 — Verify end-to-end

1. Open your Vercel URL.
2. Register a new account.
3. Add a task → mark complete → delete.
4. Try **Today / Upcoming / Expired** in the sidebar (custom feature).
5. Optional: `Ctrl+K` command palette for quick task entry.

If login fails, open browser DevTools → Network → check `/api/auth/login`:
- **200 + JSON** → backend OK
- **HTML response** → `vercel.json` proxy not set or wrong Render URL
- **502/503** → Render service sleeping (free tier cold start ~30s) or `MONGO_URI` wrong

---

## Local development

```bash
# Terminal 1 — backend
cd backend
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET
npm install
npm run dev

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
```

Frontend proxies `/api` to `localhost:5050` via `vite.config.js`.

---

## Alternative: direct API URL (no Vercel proxy)

Set in Vercel → Settings → Environment Variables:

```
VITE_API_BASE=https://smart-todo-api.onrender.com/api
```

Redeploy frontend. Also set `CORS_ORIGIN` on Render to your Vercel domain.

---

## Submit to Oursky

See `writeup.md` for the half-page writeup template.
