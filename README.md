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
- **Google / Apple** — social sign-in on login and signup pages
- Protected routes (`/home`, `/tracker`, etc.) require login

### Google Sign-In setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create an **OAuth 2.0 Client ID** (Web application)
3. Add **Authorized JavaScript origins**:
   - `http://localhost:5173`
   - `https://your-app.vercel.app`
4. Add to `.env` and Vercel:
   - `GOOGLE_CLIENT_ID`
   - `VITE_GOOGLE_CLIENT_ID` (same value)

### Apple Sign-In setup

1. Go to [Apple Developer](https://developer.apple.com/account/resources/identifiers/list/serviceId)
2. Create a **Services ID** and enable Sign in with Apple
3. Add your domain and return URL (`https://your-app.vercel.app`)
4. Add to `.env` and Vercel:
   - `APPLE_CLIENT_ID` (Services ID, e.g. `com.yourapp.web`)
   - `VITE_APPLE_CLIENT_ID` (same value)

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
| `/api/auth/google` | POST | `{ credential }` — Google ID token |
| `/api/auth/apple` | POST | `{ idToken, user? }` — Apple identity token |
| `/api/auth/config` | GET | Public OAuth client IDs |
| `/api/auth/me` | GET | Bearer token — current user |

## Responsive layout

- **Mobile:** Bottom navigation bar, vertical card stack
- **Desktop:** Left sidebar navigation, multi-column workout grid, split-screen workout detail
