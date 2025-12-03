# Smart To-Do List

A full-stack to‑do web app with a Notion‑like UI. Frontend uses React (Vite), backend uses Node.js/Express and MongoDB. Supports registration/login, task CRUD, categories (lists), Kanban board with drag‑and‑drop, calendar view, i18n (English/Traditional Chinese), themes, and a weather page (OpenWeatherMap).

## Repository Structure

```
backend/   # Express + MongoDB API server
frontend/  # Vite + React web client
```

## Features
- Authentication: register/login with JWT, tokens stored client-side.
- Tasks: create/edit/delete, toggle complete, due date, notes, subtasks, categories.
- Views: List (three‑pane with details drawer), Kanban board (drag‑and‑drop), Calendar (day list).
- Filters: Upcoming, Today, Expired; per‑category views with dynamic counts.
- Lists: create, delete (cascade or move to general); sidebar always shows lists even if all tasks completed.
- UX: Notion‑like layout, animations (add/delete/complete), accessible focus styles, custom dialogs.
- Settings: Day/Night themes, accent color, language (en/zh‑Hant) persisted in localStorage.
- Weather: city search, unit switching (°C/°F), geolocation with IP fallback; proxy by backend.

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
- GET `/api/tasks?category=...&completed=true|false`
- POST `/api/tasks` { title, description?, category?, status?, notes?, subtasks?, dueDate? }
- PUT `/api/tasks/:id` { title?, description?, category?, status?, completed?, notes?, subtasks?, dueDate? }
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
- Dark mode refinements: unified surface color, improved sidebar badges/active row, Kanban column tints for better contrast.
- Inputs readability in dark mode: higher-contrast text/placeholders for inputs/selects.
- Login UX: polished loading overlay with animated spinner and “Signing in…” hint.
- Date validation: task `dueDate` year strictly limited to 4 digits (1000–9999) at both client (HTML min/max) and server (Mongoose validator).
- SPA deploy: `frontend/vercel.json` added for client-side routing rewrites.*** End Patch*** } ?>>
