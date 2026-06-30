# OneMoreRep

A mobile-first fitness web app with a clean black-and-white UI. Built with React, TypeScript, Vite, and Tailwind CSS.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Splash / onboarding screen |
| `/login` | Login (UI only — no backend yet) |
| `/home` | Dashboard with categories and workouts |
| `/workout/:id` | Workout detail with exercise list |

## Responsive layout

- **Mobile:** Bottom navigation bar, vertical card stack
- **Desktop:** Left sidebar navigation, multi-column workout grid, split-screen workout detail

## Next steps

- Connect authentication to your database
- Wire up social login (Google / Apple)
- Replace mock data in `src/data/mockData.ts` with API calls
