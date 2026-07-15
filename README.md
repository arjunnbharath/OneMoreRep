# OneMoreRep

Mobile-first fitness and nutrition app. Track workouts, plan your week, log calories, and monitor progress — with per-user cloud sync.

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS 4 · Express · Neon PostgreSQL · Vercel serverless API

---

## Features

| Area | What you get |
|------|----------------|
| **Home** | Workout library, search, filters, calendar, bookmarks |
| **Progress** | Live workout logging (sets/reps/kg), history, PRs, charts |
| **Weekly plan** | Mon–Sun → muscle groups → exercises, start day workouts |
| **Calories** | BMR/TDEE targets, macro tracking, meal logs, custom foods |
| **Profile** | Stats, theme toggle, account settings, change password |
| **Auth** | Sign up / login with JWT, data tied to your account |

Light and dark mode supported throughout.

---

## Quick start

### 1. Environment

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret for signing auth tokens |
| `PORT` | No | Local API port (default `3001`) |
| `VITE_API_URL` | Deploy only | Production API base URL (no trailing slash) |

### 2. Install & run

```bash
npm install
npm run dev
```

| Service | URL |
|---------|-----|
| Web app | http://localhost:5173 |
| API | http://localhost:3001 |

### 3. Build

```bash
npm run build    # TypeScript + Vite production build
npm run lint     # Oxlint
```

---

## Routes

| Path | Description |
|------|-------------|
| `/` | Splash / welcome |
| `/login` · `/signup` | Authentication |
| `/home` | Dashboard |
| `/exercises` · `/exercises/:id` | Exercise guides |
| `/workout/:id` | Workout detail |
| `/tracker` | Progress tracker & weekly plan |
| `/calories` | Calorie & macro tracker |
| `/profile` | Profile & settings |

---

## API

Auth and user data run as Vercel serverless functions in `api/` (production) and Express in `server/` (local dev). Both share `api/lib/`.

### Auth

| Endpoint | Method | Body / headers |
|----------|--------|----------------|
| `/api/auth/register` | POST | `{ name, email, password, avatar? }` |
| `/api/auth/login` | POST | `{ email, password }` |
| `/api/auth/me` | GET | `Authorization: Bearer <token>` |
| `/api/auth/change-password` | POST | `{ currentPassword, newPassword }` + Bearer |
| `/api/auth/delete` | DELETE | Bearer token |

### User data (JSONB sync)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/user-data` | GET | All keys for logged-in user |
| `/api/user-data` | PUT | `{ key, data }` — upsert one key |

**Stored keys:** `tracker_sessions`, `tracker_active`, `nutrition_profile`, `food_logs`, `custom_foods`, `bookmarks`, `workout_plan`

Data is cached in `localStorage` per user and debounced to the database (~700ms).

### Health

`GET /api/health` → `{ ok: true }`

---

## Project structure

```
OneMoreRep/
├── api/                 # Vercel serverless routes + shared lib
├── server/              # Local Express dev server
├── src/
│   ├── components/      # UI (nav, tracker, calories, profile…)
│   ├── context/         # Auth, theme, calorie provider
│   ├── data/            # Exercise guides, foods, mock workouts
│   ├── hooks/           # Workout, calories, plan, bookmarks
│   ├── lib/             # API client, nutrition math, sync
│   ├── pages/           # Route screens
│   └── types/
├── public/              # Videos, manifest, static assets
├── scripts/             # Video prep, DB test utilities
└── flutter_app/         # Native Android + Windows client
```

---

## Deployment (Vercel)

1. Connect the repo to Vercel.
2. Set `DATABASE_URL` and `JWT_SECRET` in project environment variables.
3. Set `VITE_API_URL` to your deployment URL (e.g. `https://your-app.vercel.app`).
4. Deploy — `vercel.json` rewrites SPA routes; `/api/*` hits serverless functions.

---

## Workout videos (optional)

Download and trim Kaggle workout clips into `public/videos/workouts/`:

```bash
# Add KAGGLE_USERNAME + KAGGLE_API_TOKEN to .env (see .env.example)
npm run setup:videos   # Windows: creates venv + runs script
# or
npm run prepare:videos
```

---

## Flutter app

A Dart/Flutter client lives in [`flutter_app/`](flutter_app/) (Android + Windows). It shares the same API.

```bash
cd flutter_app && flutter pub get
flutter run -d windows --dart-define=API_BASE_URL=http://localhost:3001 --dart-define=ASSET_BASE_URL=http://localhost:5173
```

See [`flutter_app/README.md`](flutter_app/README.md) for emulator URLs and release builds.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite + Express API concurrently |
| `npm run dev:client` | Frontend only |
| `npm run dev:server` | API only |
| `npm run prepare:videos` | Fetch & process workout videos |
| `node scripts/test-db.mjs` | Quick Neon connection test |

---

## License

Private project — all rights reserved.
