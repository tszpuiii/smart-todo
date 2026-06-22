# Smart To-Do List

A full-stack to‑do web app with a Notion‑like UI. Frontend uses React (Vite), backend uses Node.js/Express and MongoDB. Supports registration/login, task CRUD, categories (lists), Kanban board with drag‑and‑drop, calendar view, i18n (English/Traditional Chinese), themes, and a weather page (OpenWeatherMap).

**Live demo:** https://smart-todo-fawn.vercel.app  
**Custom feature (Oursky pre-test):** **Energy Match** — filter and prioritize tasks by cognitive effort (🟢 low / 🟡 medium / 🔴 high), not just due date. See `writeup.md` for the product narrative and `TEST_PIPELINE.md` for a manual QA checklist.

## Repository Structure

```
backend/   # Express + MongoDB API server
frontend/  # Vite + React web client
writeup.md # Half-page feature writeup for submission
TEST_PIPELINE.md  # Step-by-step test checklist for Energy Match
```

## Features

### Core app
- Authentication: register/login with JWT, tokens stored client-side.
- Tasks: create/edit/delete, toggle complete, due date, notes, subtasks, categories.
- Views: List (three‑pane with details drawer), Kanban board (drag‑and‑drop), Calendar (day list).
- Filters: Upcoming, Today, Expired; per‑category views with dynamic counts.
- Lists: create, delete (cascade or move to general); sidebar always shows lists even if all tasks completed.
- UX: Notion‑like layout, animations (add/delete/complete), accessible focus styles, custom dialogs.
- Settings: Day/Night themes, accent color, language (en/zh‑Hant) persisted in localStorage.
- Weather: city search, unit switching (°C/°F), geolocation with reverse geocode; proxy by backend.

### Energy Match (custom feature)
PM-oriented **cognitive energy** tagging and filtering — addresses context-switching cost between admin work and deep-focus work.

| Level | Meaning | Typical use |
|-------|---------|-------------|
| 🟢 Low | Admin / low focus | Reply Slack, email, update tickets — between meetings |
| 🟡 Medium | Normal focus | Default; routine work |
| 🔴 High | Deep focus / strategy | Write PRD, plan roadmap — needs uninterrupted time |

**What it does:**
- **Sidebar `MATCH MY ENERGY`** — filter tasks by `?energy=low|medium|high` in the URL (shareable, survives refresh).
- **Priority + due-date sorting** — within any view, tasks sort by: incomplete first → priority (🔥 High first) → earliest due date → manual order.
- **`Start here` hint** — in an energy view, the top incomplete task is labeled as the suggested starting point (decision support, not AI).
- **Smart creation defaults** — new tasks inherit the current energy filter; title keywords auto-suggest energy (e.g. “Reply” → 🟢, “Write PRD” → 🔴).
- **Quick add** — `Ctrl+K` supports `@low`, `@medium`, `@high` plus `#category` and `due:YYYY-MM-DD`.
- **Kanban** — colored left border per energy; warning when more than 2 high-focus tasks are in **Doing**.
- **Task fields** — `energyLevel` and `priority` on create/edit forms and detail panel.

**What it does *not* do:** No AI daily planner. The app narrows and ranks tasks; you still choose what to work on.

## Prerequisites
- Node.js ≥ 18
- A MongoDB connection string (Atlas or local)
- An OpenWeatherMap API key (optional, only for weather page)

## Backend – Setup & Run
1) Create `backend/.env`:
```
PORT=5050
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret
OPENWEATHER_API_KEY=your_openweather_api_key   # optional but recommended
# For production CORS (comma-separated list, include localhost for dev if needed)
CORS_ORIGIN=https://your-frontend-domain, http://localhost:5173
```

2) Install & start:
```
cd backend
npm install
npm run dev
# Server: http://localhost:5050 (change PORT in .env if needed)
```

3) Health check:
```
GET http://localhost:5050/api/health
```

## Frontend – Setup & Run (Vite proxy to backend)
```
cd frontend
npm install
npm run dev
# App: http://localhost:5173
```
The frontend calls `/api/*` which Vite proxies to the backend at `http://localhost:5050`. If you use a different backend port, update `frontend/vite.config.js`.

For production builds when frontend and backend are on different domains, set:
```
# in frontend build environment
VITE_API_BASE=https://your-backend-domain/api
```
so the client will call the deployed API instead of relative `/api`.

## API Overview

Auth
- POST `/api/auth/register` { name, email, password }
- POST `/api/auth/login` { email, password }

Tasks (Authorization: Bearer <token>)
- GET `/api/tasks?category=...&completed=true|false&energyLevel=low|medium|high`
- POST `/api/tasks` { title, description?, category?, status?, energyLevel?, priority?, notes?, subtasks?, dueDate? }
- PUT `/api/tasks/:id` { title?, description?, category?, status?, energyLevel?, priority?, completed?, notes?, subtasks?, dueDate? }
- PATCH `/api/tasks/:id/toggle`
- POST `/api/tasks/reorder` { ids: string[] }  // reorder within current filter
- DELETE `/api/tasks/:id`
- DELETE `/api/tasks/category/:categoryName`  // delete many by category

Lists (Authorization: Bearer <token>)
- GET `/api/lists`
- POST `/api/lists` { name }
- DELETE `/api/lists/:id?cascade=true|false`
  - cascade=true: delete all tasks in that category
  - cascade=false (default): move tasks to `general`

Weather (Authorization: Bearer <token>)
- GET `/api/weather?city=Hong%20Kong&units=metric&lang=en`
- GET `/api/weather?lat=22.3&lon=114.2&units=metric&lang=en`
  - requires `OPENWEATHER_API_KEY` in backend `.env`

## Build
Frontend:
```
cd frontend
npm run build
```
Backend typically runs as a service (no build step required).

## Deployment (quick suggestion)
- Backend: Render/Railway/Fly.io
  - Set env vars `PORT`, `MONGO_URI`, `JWT_SECRET`, `OPENWEATHER_API_KEY`.
  - Also set `CORS_ORIGIN=https://<your-frontend-domain>`
  - Expose `/api/*`.
- Frontend: Vercel/Netlify
  - Build command `npm run build` and output `dist`.
  - If backend is on another domain, set env `VITE_API_BASE=https://<your-backend-domain>/api` before build.

## Demo Flow (suggested)

### Energy Match (reviewer path — ~3 min)
1) Register → Login → open **Tasks**  
2) Sidebar **MATCH MY ENERGY** → **🟢 Low energy**  
3) Add tasks with different priorities/due dates (or `Ctrl+K`: `Email CEO @low`)  
4) Confirm list is sorted and top row shows **Start here**  
5) Open **Sticky Wall** — energy borders + Doing WIP hint if applicable  

### Full app smoke test
1) Register → Login  
2) Create tasks; show List/Board/Calendar views  
3) Toggle complete, show sidebar counts and category persistence  
4) Show Today/Upcoming/Expired filters  
5) Settings: change theme/accent/language  
6) Weather: city search and “Use my location”

## Notes
- JWT default lifetime: 7 days.
- All task/list CRUD are authenticated and isolated per user.
- Accessibility: focus styles, reduced motion preference respected.

## Recent Updates
- **Energy Match:** cognitive energy filter (`energyLevel`), URL-driven sidebar filters, priority + due-date sorting, `Start here` hint, smart form defaults, keyword inference, Kanban energy borders and Doing WIP warning.
- Dark mode refinements: unified surface color, improved sidebar badges/active row, Kanban column tints for better contrast.
- Inputs readability in dark mode: higher-contrast text/placeholders for inputs/selects.
- Login UX: polished loading overlay with animated spinner and “Signing in…” hint.
- Date validation: task `dueDate` year strictly limited to 4 digits (1000–9999) at both client (HTML min/max) and server (Mongoose validator).
- SPA deploy: `frontend/vercel.json` proxies `/api` to Render backend; client-side routing rewrites.
