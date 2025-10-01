# CheckMyDashboard — Full (i18n + Login + Prisma + Analyze)

## Features
- Global ENG/KO toggle (header, stored in localStorage)
- Login / Register / Logout with JWT cookie
- Prisma (Postgres) User model
- Protected `/dashboard` via middleware
- `/api/analyze` uses OpenAI (image + text) and requires login
- Streaming responses, helpful error messages

## Env (.env.local or Vercel Project → Env Vars)
Required:
- OPENAI_API_KEY=sk-...
- DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
- JWT_SECRET=very-long-random-string

Optional:
- POSTGRES_URL_NON_POOLING=postgresql://user:pass@host/db?sslmode=require
- OPENAI_MODEL=gpt-4o  (default: gpt-4o-mini)

## Setup
```
npm i
npm run prisma:push
npm run dev
```
Open http://localhost:3000

## Vercel
- Framework Preset: Next.js
- Build Command: (empty) or `next build` (this package runs `prisma generate` automatically)
- Output Directory: empty
- Env Vars: see above
- After deploy:
  - GET /api/ping → 200
  - /login → register → redirect to /dashboard
  - /dashboard → upload & analyze
