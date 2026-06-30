# OneMoreRep

A mobile-first fitness web app with a clean black-and-white UI. Built with React, TypeScript, Vite, Tailwind CSS, Express, and Neon PostgreSQL.

## Getting started

1. Copy `.env.example` to `.env` and add your Neon database URL and JWT secret.

2. Install and run:

```bash
npm install
npm run dev
```

This starts the frontend at [http://localhost:5173](http://localhost:5173) and the API at [http://localhost:3001](http://localhost:3001).

## Auth

- **Sign up** at `/signup` — creates a user in Neon PostgreSQL
- **Login** at `/login` — returns a JWT stored in localStorage
- Protected routes (`/home`, `/tracker`, etc.) require login

## Pages

| Route | Description |
|-------|-------------|
| `/` | Splash / onboarding screen |
| `/login` | Login with email & password |
| `/signup` | Create account |
| `/home` | Dashboard with muscle categories and workouts |
| `/workout/:id` | Workout detail with exercise list |
| `/tracker` | Log exercises, sets, and reps |

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | `{ name, email, password }` |
| `/api/auth/login` | POST | `{ email, password }` |
| `/api/auth/me` | GET | Bearer token — current user |

## Responsive layout

- **Mobile:** Bottom navigation bar, vertical card stack
- **Desktop:** Left sidebar navigation, multi-column workout grid, split-screen workout detail
