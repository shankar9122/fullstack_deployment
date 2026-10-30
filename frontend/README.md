# School Management System: Frontend

Admin dashboard for managing **students, classes and teachers**, built with Next.js (App Router). It talks to the Express + MongoDB API in [`../backend`](../backend).

|              |                                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| **Live app** | https://school-management-system-theta-ten.vercel.app                                                  |
| **API**      | https://school-api-q69s.onrender.com (free tier: the first request after idle can take up to a minute) |

## Table of contents

1. [Tech stack](#tech-stack)
2. [Getting started](#getting-started)
3. [Architecture at a glance](#architecture-at-a-glance)
4. [Folder structure](#folder-structure)
5. [Layer responsibilities](#layer-responsibilities)
6. [How a request flows](#how-a-request-flows)
7. [Forms](#forms)
8. [HTTP client and error handling](#http-client-and-error-handling)
9. [Adding a new feature](#adding-a-new-feature)
10. [Environment variables](#environment-variables)
11. [Deployment](#deployment)
12. [Conventions](#conventions)
13. [Known limitations and roadmap](#known-limitations-and-roadmap)

## Tech stack

| Area          | Choice                                                   |
| ------------- | -------------------------------------------------------- |
| Framework     | Next.js 16 (App Router), React 19                        |
| Language      | TypeScript (`strict`)                                    |
| Styling       | Tailwind CSS                                             |
| Forms         | React Hook Form 7 + Zod 4 (`@hookform/resolvers` 5)      |
| Data fetching | Native `fetch` behind a small typed wrapper (`lib/http`) |
| Linting       | ESLint (Next.js config)                                  |

## Getting started

```bash
cd frontend
cp .env.example .env.local     # then set NEXT_PUBLIC_API_URL
npm install
npm run dev                    # http://localhost:3001
```

The frontend runs on port **3001** because the API uses 3000 locally.

| Command                    | What it does                                                  |
| -------------------------- | ------------------------------------------------------------- |
| `npm run dev`              | Dev server on port 3001                                       |
| `npm run build`            | Production build (Vercel runs this, so run it before pushing) |
| `npm run start -- -p 3001` | Serve the production build locally                            |
| `npm run lint`             | ESLint                                                        |
| `npx tsc --noEmit`         | Type check only                                               |

You need the backend running (or `NEXT_PUBLIC_API_URL` pointing at the deployed API) for any page to show data.

## Architecture at a glance

The app is **layered and feature-based**:

- **Layered**: UI, state, API calls and HTTP plumbing live in separate layers, and each layer only depends on the ones below it.
- **Feature-based**: everything specific to one domain (students, classes, teachers) lives together under `features/`.

```
app  ->  features  ->  components, hooks  ->  services  ->  lib/http  ->  config
                              \_______ types (any layer may import) _______/
```

The rule: **dependencies only point from left to right, never back.** This keeps each layer replaceable and testable:

- `services/` knows nothing about React, so it is reusable and easy to test.
- `components/ui/` knows nothing about students or classes, so it is reusable anywhere.
- A feature never imports from another feature's internals. Anything shared moves to `components/`, `hooks/` or `types/`.

## Folder structure

```
src/
├── app/                          # ROUTING ONLY: thin pages, no logic
│   ├── layout.tsx                # Root layout (Navbar + main container)
│   ├── page.tsx                  # Redirects "/" to "/students"
│   ├── students/
│   │   ├── page.tsx              # /students
│   │   ├── new/page.tsx          # /students/new
│   │   └── [id]/edit/page.tsx    # /students/:id/edit
│   ├── classes/                  # same three routes
│   └── teachers/                 # same three routes
│
├── features/                     # FEATURE UI: one folder per domain
│   ├── students/
│   │   ├── StudentsView.tsx      # List page: filters, table, pagination, delete
│   │   ├── CreateStudentView.tsx
│   │   ├── EditStudentView.tsx
│   │   ├── studentForm.ts        # Zod schema, form types, form<->API mappers
│   │   ├── components/           # StudentForm, StudentFilters, StudentsTable
│   │   └── hooks/                # useStudents (list), useStudent (one)
│   ├── classes/                  # same shape, plus useClassOptions (dropdown data)
│   └── teachers/                 # same shape, plus useTeacherOptions (dropdown data)
│
├── components/                   # REUSABLE UI: knows nothing about the domain
│   ├── ui/                       # Alert, Button, FormField, Input, Select,
│   │                             # SelectField, TextField
│   ├── layout/                   # Navbar
│   └── shared/                   # PaginationControls, ServerErrorAlert
│
├── hooks/                        # GENERIC HOOKS: useDebounce, useFormSubmit
├── services/                     # API CALLS: student/class/teacher .service.ts
├── types/                        # INTERFACES: api.ts, student.ts, class.ts, teacher.ts
├── lib/
│   └── http/                     # fetch wrapper (client.ts) + ApiError (errors.ts)
└── config/
    └── env.ts                    # Reads and validates environment variables
```

Import alias: `@/` maps to `src/` (for example `@/services/student.service`).

## Layer responsibilities

| Layer                           | Owns                                                                            | Must not                                 |
| ------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------- |
| `app/`                          | Routes, page metadata, mounting a feature view                                  | Contain logic, fetch data or hold state  |
| `features/<name>/*View.tsx`     | Page-level state (search, page, selected class), composing hooks and components | Call `fetch` directly                    |
| `features/<name>/components/`   | Presentational pieces for that feature                                          | Know how data is fetched                 |
| `features/<name>/hooks/`        | Loading, error and data state for that feature; cancelling stale requests       | Build URLs or parse raw responses        |
| `features/<name>/<name>Form.ts` | Zod schema, form value types, mapping between form values and API payloads      | Render anything                          |
| `components/ui/`                | Styled, accessible primitives                                                   | Know about students, classes or teachers |
| `components/shared/`            | Reusable composites (pagination, error alert)                                   | Fetch data                               |
| `hooks/`                        | Generic behaviour (debounce, submit state)                                      | Depend on a feature                      |
| `services/`                     | One function per API operation; maps backend response shape to frontend shape   | Import React                             |
| `lib/http/`                     | URL building, JSON, headers, status checks, error normalisation                 | Know about any endpoint                  |
| `config/`                       | Environment access in one place                                                 | Anything else                            |
| `types/`                        | Interfaces shared across layers                                                 | Contain runtime code                     |

## How a request flows

Example: typing "sharma" in the students search box.

```
StudentFilters (input)
  -> StudentsView         holds `search` state, passes it through useDebounce (400 ms)
  -> useStudents          effect runs with an AbortController (cancels the previous request)
  -> studentService.list  calls http.get('/students', { params })
  -> http client          builds URL, calls fetch, checks res.ok, throws ApiError on failure
  -> Express API          GET /api/students?search=sharma&page=1&limit=10
```

The response travels back up. `studentService` converts the backend shape `{ students, pagination }` into the frontend shape `{ items, pagination }`, so if the backend renames a key, only the service changes.

## Forms

All forms use **React Hook Form + Zod**:

- The **Zod schema** is the single source of truth. The form's TypeScript type is `z.infer<typeof schema>`.
- Form values are **all strings**, because HTML inputs only return strings. A mapper (`toStudentInput`, `toClassInput`, `toTeacherInput`) converts them to the typed API payload (`Number(rollNumber)`, empty email to `undefined`, empty class teacher to `null`).
- Optional fields use `""` as "empty" instead of `.optional()`, which avoids Zod/resolver edge cases with empty strings.
- **Client validation is for user experience only.** The backend validates everything again, and its errors (including `409 duplicate`) are shown above the form via `ServerErrorAlert`.
- `useFormSubmit` wraps the submit handler: it stores server errors and keeps the button disabled after success while the redirect happens, which prevents double submits.
- **Edit forms render only after all their data has loaded** (the record and any dropdown options). React Hook Form reads `defaultValues` once, and a `<select>` does not pick up its value if its options arrive later.

Field primitives: `TextField` and `SelectField` wrap `FormField` (label and error message) and add `aria-invalid` / `aria-describedby`. `register()` passes `ref` straight through because React 19 treats `ref` as a normal prop.

## HTTP client and error handling

`lib/http/client.ts` is the only place that calls `fetch`:

- Builds URLs from `NEXT_PUBLIC_API_URL`, skips empty query params, and sets JSON headers.
- **`fetch` does not reject on 4xx/5xx**, so the client checks `res.ok` and throws an `ApiError` (with `status` and optional `details` from the backend's `errors` array).
- Network failures and CORS blocks surface as a single readable `ApiError` ("Cannot reach the server...").
- `AbortError` is re-thrown untouched, and hooks use `isAbortError` to ignore it.
- This is also the single place to add an `Authorization` header when authentication is introduced.

Hooks use `AbortController` so that fast typing never lets a slow, older response overwrite a newer one.

## Adding a new feature

Example: a `subjects` resource. Follow the layers from the bottom up:

1. **Type**: `types/subject.ts` (entity, list query and input interfaces).
2. **Service**: `services/subject.service.ts` (`list`, `getById`, `create`, `update`, `remove`).
3. **Hook**: `features/subjects/hooks/useSubjects.ts` (state, loading, error, `AbortController`).
4. **Form logic**: `features/subjects/subjectForm.ts` (Zod schema, empty values, mappers).
5. **Components**: `SubjectsTable`, `SubjectForm` under `features/subjects/components/`.
6. **Views**: `SubjectsView`, `CreateSubjectView`, `EditSubjectView`.
7. **Pages**: thin files under `app/subjects/` that only render the views.
8. **Navigation**: add a link in `components/layout/Navbar.tsx`.

If a step feels like it needs to import "upwards", the code is probably in the wrong layer.

## Environment variables

| Name                  | Where                                                      | Purpose                                       |
| --------------------- | ---------------------------------------------------------- | --------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | `.env.local` (local), Vercel project settings (production) | Base URL of the API, without a trailing slash |

- Variables prefixed `NEXT_PUBLIC_` are **inlined into the browser bundle at build time**. Never put secrets in them.
- Changing one on Vercel requires a **redeploy**; saving the value is not enough.
- `.env.local` is git-ignored. `.env.example` is committed as a template.

## Deployment

Deployed on **Vercel** from the monorepo.

| Setting              | Value                                                                  |
| -------------------- | ---------------------------------------------------------------------- |
| Root Directory       | `frontend`                                                             |
| Framework preset     | Next.js (auto-detected)                                                |
| Environment variable | `NEXT_PUBLIC_API_URL` = the Render API URL (`https://...onrender.com`) |

Checklist:

- Run `npm run build` locally first. Vercel runs the same command, and TypeScript or ESLint errors fail the build.
- The backend's `CORS_ORIGIN` must contain the exact Vercel origin (scheme and host, **no trailing slash**). Vercel preview deployments have different URLs and are not allowed unless added to `CORS_ORIGIN`.
- **Cache Components is turned off** in `next.config.ts`. This app fetches data in the browser, and with the feature enabled every dynamic route (`[id]/edit`) must wrap `await params` in `<Suspense>` or the build fails.
- Pushing to `main` redeploys automatically.

## Conventions

- **Naming**: components `PascalCase.tsx`; hooks `useThing.ts`; services `thing.service.ts`; form logic `thingForm.ts`.
- **Plural vs singular hooks**: `useStudents` loads a list (with filters and pagination), `useStudent` loads one record. Double-check auto-imports; the names are one letter apart.
- **Client components** (`'use client'`) are the `*View.tsx` files and anything using state or effects. Pages in `app/` stay server components so they can export `metadata`.
- **Imports** use the `@/` alias and always flow downwards through the layers.
- **Comments** are written in English and explain _why_, not _what_.
- No secrets in the repo. `.env*` files are git-ignored except `.env.example`.

## Known limitations and roadmap

- **No authentication yet.** Anyone with the URL can create, edit and delete records. Login (JWT), roles and protected routes are the next phase.
- Data fetching uses custom hooks. A library such as TanStack Query could replace `hooks/` later without touching components or services.
- No automated tests yet.
- The API runs on a free Render instance, so the first request after idle is slow.
- Planned: student photo upload, report pages (students per class, gender distribution, teacher workload, average age) that use the API's `/api/reports/*` endpoints.
