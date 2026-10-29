# School Management System

Full-stack app: Express + MongoDB (Atlas) API and Next.js frontend.

## Live

- Frontend: https://xxxx.vercel.app
- API: https://school-api.onrender.com/api/health
  (free tier: first request may take up to a minute)

## Structure

- `backend/` Express 5 + Mongoose API
- `frontend/` Next.js (App Router) + React Hook Form + Zod

## Run locally

1. `cd backend && cp .env.example .env` (fill MONGODB_URI) -> `npm install && npm run dev`
2. `cd frontend && cp .env.example .env.local` -> `npm install && npm run dev`
3. Seed (optional): `npm run seed:teachers && npm run seed:classes && npm run seed:students`

## Environment variables

| Where    | Name                | Purpose                                     |
| -------- | ------------------- | ------------------------------------------- |
| backend  | MONGODB_URI         | Atlas connection string                     |
| backend  | CORS_ORIGIN         | Allowed frontend origin(s), comma separated |
| frontend | NEXT_PUBLIC_API_URL | API base URL                                |
