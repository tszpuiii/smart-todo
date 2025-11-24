# Smart To-Do List – Project Report (Individual)

Author: [Your Name]  
Team: Individual (no groupmate)  
Tech Stack: React (Vite), Node.js/Express, MongoDB (Mongoose), JWT, OpenWeatherMap

## 1. Overview
A full‑stack to‑do web application with a Notion‑like interface. Users can register, log in and manage tasks with categories, due dates and statuses. The app supports List/Board/Calendar views, i18n (English/Traditional Chinese), Day/Night themes, accent colors and a weather page with city search and geolocation fallback.

Goals:
- Provide a modern, responsive task manager experience.
- Demonstrate full‑stack integration (frontend + backend + database).
- Cover course topics: UI/UX, REST APIs, authentication, persistence, and client‑side enhancements.

## 2. Requirements Fit
- Client side: Implemented with React; multiple pages: Home, Tasks, Weather, Settings, Login, Register.
- Server side: Implemented with Node.js/Express; handles auth, task/list CRUD, weather proxy, MongoDB persistence.
- Functionality: End‑to‑end task management (CRUD, filters, drag‑and‑drop, calendar), i18n, themes, weather.
- Demonstration: The app runs locally and can be deployed to cloud (Render/Vercel).
- No runtime errors: Verified locally; includes error handling on API and geolocation.

## 3. System Architecture
High level:
- Frontend (Vite + React)
  - Routing: `react-router-dom`
  - Contexts:
    - `AuthContext`: login/register, token, user state
    - `ThemeContext`: theme (light/dark), accent color; persisted to `localStorage`
    - `LocaleContext`: language (en/zh‑Hant), translation dictionary; persisted to `localStorage`
  - Core pages/components:
    - `Home`: summary cards, progress, quick chips, recent tasks, add task
    - `Tasks`: list/table/board/calendar views, details drawer, command palette
    - `Weather`: city/coordinate search, units, geolocation + IP fallback
    - `Settings`: theme, accent, language
    - `Sidebar`: navigation, dynamic counts, lists
    - Reusable UI: `TaskForm`, `TaskItem`, `TaskRow`, `ConfirmDialog`, `Calendar`
- Backend (Express)
  - Middleware: CORS, JSON body parsing, `auth` (JWT verify)
  - Routes:
    - `auth`: register, login
    - `tasks`: CRUD, toggle, reorder, delete by category
    - `lists`: CRUD, delete with cascade or move to `general`
    - `weather`: proxy to OpenWeatherMap with compatibility handling
  - Database (MongoDB via Mongoose)
    - `User`: { name, email, passwordHash, createdAt }
    - `Task`: { user, title, description, category, status, completed, dueDate, notes, subtasks[], order, createdAt, updatedAt }
    - `List`: { user, name, createdAt }

Data flow examples:
1) Auth: client → `/api/auth/register|login` → JWT → client stores token → subsequent calls with `Authorization: Bearer`.
2) Tasks: client → `/api/tasks` (CRUD) → MongoDB; `tasks:changed` event refreshes sidebar counts.
3) Weather: client → `/api/weather?city=...|lat/lon=...` → server proxy → OpenWeatherMap → sanitized response to client.

## 4. Database Design
User
```
name: string
email: string (unique)
passwordHash: string
createdAt: Date
```
List
```
user: ObjectId (User)
name: string
createdAt: Date
```
Task
```
user: ObjectId (User)
title: string
description?: string
category?: string (default 'general')
status?: 'todo'|'doing'|'done' (default 'todo')
completed?: boolean (default false)
dueDate?: Date
notes?: string
subtasks?: [{ title: string, completed: boolean }]
order?: number
createdAt: Date
updatedAt: Date
```

## 5. Application Logic
- Filters:
  - Today: tasks due today (incomplete in sidebar counts)
  - Upcoming: due today or future, or without due date (incomplete in sidebar counts)
  - Expired: due date < today and not completed
- Date validation: `dueDate` year is validated on server (Mongoose) to be 4 digits (1000–9999); client inputs also restrict `min="1000-01-01"` and `max="9999-12-31"`.
- Category counts: sidebar shows all categories (including when all tasks completed), counts only incomplete tasks.
- Board DnD: changes task `status`; persisted via `update`.
- Reorder: list view supports ordering via POST `/api/tasks/reorder`.
- Delete list: `DELETE /api/lists/:id?cascade=true` deletes tasks; without cascade, moves tasks to `general`.
- i18n: `LocaleContext` + translation dictionary; dates/times localized in Weather view.
- Weather:
  - City search & unit (metric/imperial)
  - Geolocation with IP fallback (ipapi.co)
  - Default: Hong Kong

## 6. Security
- JWT for all authenticated APIs (tasks/lists/weather).
- CORS controlled in backend.
- Passwords hashed (bcrypt via Mongoose model hook).

## 7. Mobility / Location
- Responsive layout with CSS grid/flex and media queries.
- Location-based weather using browser Geolocation API; IP fallback when permission denied.

## 8. Testing Strategy and Results
Manual test checklist (key items):
1) Auth: register → login → invalid credentials handling – OK  
2) Tasks CRUD: create/edit/delete/toggle – OK  
3) Filters: Today/Upcoming/Expired – OK  
4) Categories: create list, switch category, delete (cascade/move) – OK  
5) Board: drag card to other status – OK  
6) Calendar: select day shows tasks, add task for selected date – OK  
7) Sidebar: counts update on `tasks:changed`, lists persist even when all tasks completed – OK  
8) Weather: city search, units toggle, use my location with fallback – OK  
9) i18n: switch language; titles/labels/dates localized – OK  
10) Themes/Accent: switch and persist – OK  

No runtime errors observed in local end‑to‑end tests.

## 9. User Manual
1) Start backend (PORT 5050) and frontend (5173).  
2) Register or log in.  
3) Home page：查看摘要卡與進度條、最近更新、快速進入 Today/Upcoming/Expired。  
4) Tasks：使用 List/Board/Calendar 管理與檢視任務；可於工具列篩選分類與完成狀態。  
5) Details：點選列右側箭頭開啟抽屜編輯；儲存自動關閉。  
6) Lists：側欄新增清單；在任務頁工具列刪除清單（可選擇級聯刪除或移轉到 general）。  
7) Settings：切換日/夜間、Accent 色彩、語言。  
8) Weather：輸入城市或使用定位；切換 °C/°F。  

## 10. Deployment Plan
- Backend: Render
  - Build: `npm install`
  - Start: `npm run dev` or production `node src/server.js`
  - Env: `PORT`, `MONGO_URI`, `JWT_SECRET`, `OPENWEATHER_API_KEY`
- Frontend: Vercel
  - Build: `npm run build`
  - Output: `dist`
  - API base: the app uses relative `/api`; deploy behind the same domain/reverse proxy or configure rewrites.

## 11. Roles
Individual project – all tasks (frontend, backend, database, testing, documentation) completed by the author.

## 12. Build & Run
See `README.md` for step‑by‑step setup, environment variables, and scripts.

## 13. Known Issues & Future Work
- Add E2E tests (Playwright/Cypress).
- Offline mode and background sync.
- Task reminders/notifications.
- File attachments for tasks.

## 15. Recent Enhancements
- Dark theme improvements (unified surface color, readable badges/inputs, Kanban tints).
- Login loading overlay redesigned with animated spinner and status hint.
- Strict 4‑digit year validation for task `dueDate` (server + client).
- Added `vercel.json` for SPA rewrites when deploying to Vercel.*** End Patch
## 14. Appendix – API Summary
Auth
- `POST /api/auth/register`, `POST /api/auth/login`

Tasks
- `GET /api/tasks`, `POST /api/tasks`, `PUT /api/tasks/:id`, `PATCH /api/tasks/:id/toggle`
- `POST /api/tasks/reorder`, `DELETE /api/tasks/:id`
- `DELETE /api/tasks/category/:categoryName`

Lists
- `GET /api/lists`, `POST /api/lists`, `DELETE /api/lists/:id?cascade=true|false`

Weather
- `GET /api/weather?city=...&units=metric|imperial&lang=en|zh_tw`
- `GET /api/weather?lat=...&lon=...&units=...&lang=...`


