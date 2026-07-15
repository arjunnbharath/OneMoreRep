# OneMoreRep — Flutter app (Android + Windows)

Cross-platform Dart/Flutter client for OneMoreRep. It uses the same backend API as the web app (`/api/auth/*`).

## Prerequisites

1. [Flutter SDK](https://docs.flutter.dev/get-started/install) (stable)
2. Android Studio / Android SDK (for Android builds)
3. Visual Studio 2022 with **Desktop development with C++** (for Windows builds)
4. Backend running locally (`npm run dev` in repo root) or deployed on Vercel

## Setup

```bash
cd flutter_app
flutter pub get
```

Sync workout data from the web app (run from repo root when workouts change):

```bash
npx tsx -e "import { workouts, heroImage, motivationImage, homeFilters } from './src/data/mockData.ts'; import { writeFileSync, mkdirSync } from 'fs'; mkdirSync('flutter_app/assets',{recursive:true}); writeFileSync('flutter_app/assets/workouts.json', JSON.stringify({workouts, heroImage, motivationImage, homeFilters}));"
copy public\workout-videos-manifest.json flutter_app\assets\
```

## Run

**Windows (desktop):**

```bash
flutter run -d windows ^
  --dart-define=API_BASE_URL=http://localhost:3001 ^
  --dart-define=ASSET_BASE_URL=http://localhost:5173
```

**Android emulator** (API host is `10.0.2.2`, not `localhost`):

```bash
flutter run -d android ^
  --dart-define=API_BASE_URL=http://10.0.2.2:3001 ^
  --dart-define=ASSET_BASE_URL=http://10.0.2.2:5173
```

**Production** (replace with your Vercel URL):

```bash
flutter run -d windows ^
  --dart-define=API_BASE_URL=https://your-app.vercel.app ^
  --dart-define=ASSET_BASE_URL=https://your-app.vercel.app
```

Workout demo videos are streamed from `ASSET_BASE_URL` (the web deployment that hosts `/videos/workouts/*.mp4`).

## Build release

```bash
flutter build windows --dart-define=API_BASE_URL=https://your-app.vercel.app --dart-define=ASSET_BASE_URL=https://your-app.vercel.app
flutter build apk --dart-define=API_BASE_URL=https://your-app.vercel.app --dart-define=ASSET_BASE_URL=https://your-app.vercel.app
```

## Features

- Login / signup with profile selfie (camera on Android, gallery on Windows)
- Home dashboard with filters, search, and workout grid
- Floating island bottom navigation (monochrome Apple Fitness style)
- Workout detail with autoplay exercise videos
- Workout tracker with local session storage
- Profile with dark/light theme toggle
- Same JWT auth as the React web app

## Project layout

```
lib/
  config/       # API_BASE_URL, ASSET_BASE_URL
  data/         # workouts + video manifest
  models/
  screens/
  services/     # auth, theme, tracker, API
  shell/        # bottom nav shell
  widgets/
assets/         # workouts.json, video manifest
```
