# School Management System: Backend API

REST API for managing **teachers, classes and students**, built with Express 5, Mongoose and MongoDB Atlas. The Next.js client lives in [`../frontend`](../frontend).

|              |                                                       |
| ------------ | ----------------------------------------------------- |
| **Live API** | https://school-api-q69s.onrender.com/api/health       |
| **Frontend** | https://school-management-system-theta-ten.vercel.app |

> Hosted on Render's free tier: the first request after 15 minutes of inactivity can take up to a minute while the instance wakes up.

## Table of contents

1. [Tech stack](#tech-stack)
2. [Getting started](#getting-started)
3. [Architecture](#architecture)
4. [Folder structure](#folder-structure)
5. [Data model](#data-model)
6. [API reference](#api-reference)
7. [Query features](#query-features)
8. [Reports (aggregation)](#reports-aggregation)
9. [Responses and error handling](#responses-and-error-handling)
10. [Security notes](#security-notes)
11. [Environment variables](#environment-variables)
12. [Seeding](#seeding)
13. [Deployment](#deployment)
14. [Adding a new resource](#adding-a-new-resource)
15. [Known limitations and roadmap](#known-limitations-and-roadmap)

## Tech stack

| Area      | Choice                                                                  |
| --------- | ----------------------------------------------------------------------- |
| Runtime   | Node.js 20.6+ (22 LTS recommended; `--env-file` needs 20.6+)            |
| Framework | Express 5 (async errors reach the error handler automatically)          |
| Database  | MongoDB Atlas via Mongoose                                              |
| Modules   | ES Modules (`"type": "module"`, local imports need the `.js` extension) |
| Other     | `cors`                                                                  |

## Getting started

```bash
cd backend
cp .env.example .env           # fill in MONGODB_URI
npm install
npm run dev                    # http://localhost:3000
```

Check it works: `curl http://localhost:3000/api/health`

| Script                  | What it does                                               |
| ----------------------- | ---------------------------------------------------------- |
| `npm run dev`           | Starts with `--watch` (auto-restart) and loads `.env`      |
| `npm start`             | Production start (env vars come from the host, not a file) |
| `npm run seed:teachers` | Resets and fills the `teachers` collection                 |
| `npm run seed:classes`  | Resets and fills `classes` (needs teachers first)          |
| `npm run seed:students` | Resets and fills `students` (needs classes first)          |

## Architecture

A classic layered Express structure. Each layer has one job:

```
Request
  -> app.js            JSON parsing, CORS, mounts routers
  -> routes/           URL + method -> controller, attaches middleware
  -> middleware/       Reusable checks (e.g. valid ObjectId in the URL)
  -> controllers/      Validation of input, business rules, queries
  -> models/           Mongoose schemas, schema-level validation, indexes
  -> MongoDB Atlas
Response  <-  global error handler (maps every error to a JSON response)
```

Design principles:

- **Controllers are thin orchestration**, and anything reusable (pagination, regex escaping, errors) lives in `utils/`.
- **The schema validates data; the controller validates requests.** Mongoose rules (required, enum, match) protect the database. Controllers additionally validate query params and enforce relationships MongoDB cannot (see [business rules](#business-rules)).
- **One error format.** Controllers throw (`AppError` or a Mongoose error) and a single global handler turns it into JSON.
- **`app.js` and `server.js` are separate.** `app.js` builds the Express app (easy to test), and `server.js` connects to the database and starts listening.

## Folder structure

```
backend/
├── .env.example
├── package.json
└── src/
    ├── server.js                  # Connects to MongoDB, then calls app.listen
    ├── app.js                     # Express app: middleware, routes, 404, error handler
    ├── config/
    │   └── db.js                  # Mongoose connection
    ├── models/
    │   ├── Teacher.js
    │   ├── Class.js
    │   └── Student.js
    ├── controllers/
    │   ├── teacher.controller.js
    │   ├── class.controller.js
    │   ├── student.controller.js
    │   └── report.controller.js   # Aggregation pipelines
    ├── routes/
    │   ├── teacher.routes.js
    │   ├── class.routes.js
    │   ├── student.routes.js
    │   └── report.routes.js
    ├── middleware/
    │   └── validateObjectId.js    # Rejects malformed :id with 400
    ├── utils/
    │   ├── AppError.js            # Error with an HTTP status code
    │   ├── pagination.js          # parsePagination + buildPagination (MAX_LIMIT = 100)
    │   └── escapeRegex.js         # Escapes user text before building a $regex
    └── seed/
        ├── seedTeachers.js
        ├── seedClasses.js
        └── seedStudents.js
```

## Data model

```mermaid
erDiagram
    TEACHER ||--o{ CLASS : "is class teacher of"
    CLASS ||--o{ STUDENT : "enrols"

    TEACHER {
        ObjectId _id
        string name
        string email UK
        string phone
        string subject
    }
    CLASS {
        ObjectId _id
        string name "1 to 12"
        string section "A to F"
        string academicYear "2025-26"
        ObjectId classTeacher FK
    }
    STUDENT {
        ObjectId _id
        string name
        number rollNumber
        string email UK
        date dob
        string gender
        string guardianName
        string guardianPhone
        ObjectId class FK
    }
```

All collections have `createdAt` and `updatedAt` (`timestamps: true`). References are stored as ObjectIds and expanded with `populate()` when returned.

### Validation rules

| Field                   | Rule                                                         |
| ----------------------- | ------------------------------------------------------------ |
| Teacher `name`          | Required, 2 to 100 characters, trimmed                       |
| Teacher `email`         | Required, unique, lowercased, valid format                   |
| Teacher `phone`         | Optional, 10-digit Indian mobile (starts with 6-9)           |
| Teacher `subject`       | Required                                                     |
| Class `name`            | One of `"1"` to `"12"`                                       |
| Class `section`         | One letter `A` to `F` (uppercased)                           |
| Class `academicYear`    | Format `YYYY-YY`, for example `2025-26`                      |
| Class `classTeacher`    | Optional reference to a Teacher                              |
| Student `name`          | Required, 2 to 100 characters                                |
| Student `rollNumber`    | Whole number, 1 or more                                      |
| Student `email`         | Optional, unique among students that have one (sparse index) |
| Student `dob`           | Required, not in the future                                  |
| Student `gender`        | Optional: `male`, `female` or `other`                        |
| Student `guardianName`  | Required                                                     |
| Student `guardianPhone` | Required, 10-digit Indian mobile                             |
| Student `class`         | Required reference to a Class                                |

### Indexes

| Collection | Index                                    | Purpose                                                              |
| ---------- | ---------------------------------------- | -------------------------------------------------------------------- |
| teachers   | `email` unique                           | No duplicate teachers                                                |
| classes    | `{ name, section, academicYear }` unique | One "10-A" per academic year                                         |
| students   | `{ class, rollNumber }` unique           | Unique roll number within a class; also speeds up filtering by class |
| students   | `email` unique + sparse                  | Unique when present; students without an email do not collide        |

### Business rules

MongoDB has no foreign-key constraints, so the controllers enforce these:

- Creating or updating a class with a `classTeacher` that does not exist returns `404`.
- Creating or updating a student with a `class` that does not exist returns `404`.
- **A teacher who is a class teacher cannot be deleted** (`409`, the message names the classes).
- **A class that still has students cannot be deleted** (`409`).
- Updates run with `runValidators: true` and return the new document (`new: true`).
- Only whitelisted fields are accepted from request bodies (`pickAllowed`).

## API reference

Base path: `/api`. JSON in, JSON out.

### Health

| Method | Path          | Description                                     |
| ------ | ------------- | ----------------------------------------------- |
| GET    | `/api/health` | Liveness check, used by the host's health check |

### Teachers

| Method | Path                | Description                                              |
| ------ | ------------------- | -------------------------------------------------------- |
| GET    | `/api/teachers`     | List. Query: `search` (name or subject), `page`, `limit` |
| POST   | `/api/teachers`     | Create                                                   |
| GET    | `/api/teachers/:id` | Get one                                                  |
| PATCH  | `/api/teachers/:id` | Update (partial)                                         |
| DELETE | `/api/teachers/:id` | Delete (blocked while the teacher is a class teacher)    |

### Classes

| Method | Path               | Description                                                                                 |
| ------ | ------------------ | ------------------------------------------------------------------------------------------- |
| GET    | `/api/classes`     | List. Query: `name` (`1`-`12`), `academicYear`, `page`, `limit`. Class teacher is populated |
| POST   | `/api/classes`     | Create (`classTeacher` optional)                                                            |
| GET    | `/api/classes/:id` | Get one                                                                                     |
| PATCH  | `/api/classes/:id` | Update (send `"classTeacher": null` to remove the teacher)                                  |
| DELETE | `/api/classes/:id` | Delete (blocked while students are enrolled)                                                |

### Students

| Method | Path                | Description                                                                                       |
| ------ | ------------------- | ------------------------------------------------------------------------------------------------- |
| GET    | `/api/students`     | List. Query: `search` (name or email), `class` (id), `gender`, `sortBy`, `order`, `page`, `limit` |
| POST   | `/api/students`     | Create                                                                                            |
| GET    | `/api/students/:id` | Get one (class populated)                                                                         |
| PATCH  | `/api/students/:id` | Update (partial)                                                                                  |
| DELETE | `/api/students/:id` | Delete                                                                                            |

### Reports

| Method | Path                                               | Description                                                                     |
| ------ | -------------------------------------------------- | ------------------------------------------------------------------------------- |
| GET    | `/api/reports/students-per-class?academicYear=`    | Per class: total students and male/female/other counts, plus class teacher name |
| GET    | `/api/reports/gender-distribution?class=`          | Gender counts overall, or for one class                                         |
| GET    | `/api/reports/teacher-classes?academicYear=`       | Per teacher: number of classes and the class list (teachers with none show `0`) |
| GET    | `/api/reports/average-age-per-class?academicYear=` | Per class: student count and average age in years (`null` for an empty class)   |

### Example

```bash
# Create a teacher
curl -X POST http://localhost:3000/api/teachers \
  -H "Content-Type: application/json" \
  -d '{"name":"Anita Sharma","email":"anita@school.com","phone":"9876543210","subject":"Maths"}'

# Students of one class, sorted by roll number, 3 per page
curl "http://localhost:3000/api/students?class=<CLASS_ID>&sortBy=rollNumber&order=asc&limit=3"
```

## Query features

- **Pagination**: `page` (default 1) and `limit` (default 10, **capped at 100**). Responses include `pagination: { page, limit, total, totalPages, hasNextPage, hasPreviousPage }`. `total` counts documents matching the filters, not the whole collection.
- **Search**: case-insensitive substring match. User text is passed through `escapeRegex` first, so characters like `.`, `(` or `*` are matched literally and cannot break the query.
- **Filtering**: every filter value is validated (type, allowed values, ObjectId format) and invalid input returns `400`.
- **Sorting**: `sortBy` and `order` must be in a whitelist (students: `name`, `rollNumber`, `dob`, `createdAt`). `_id` is always added as the final tie-breaker so pages never repeat or skip rows.
- **Numeric class order**: class lists use a collation with `numericOrdering`, so `"10"` sorts after `"9"`.

## Reports (aggregation)

The reports use Mongo aggregation pipelines (`$match`, `$lookup`, `$project`, `$sort`):

- **Class-first pipelines** (students-per-class, average-age) start from `Class` and `$lookup` the students, so a class with no students still appears with `0` and `null`. Starting from `Student` would silently drop empty classes (an inner join).
- **Counts by gender** use `$size` with `$filter` over the joined students array.
- **Average age** divides the millisecond difference between `$$NOW` and `dob` by one year. This avoids `$dateDiff` with `unit: "year"`, which counts calendar-year boundaries and overstates age.
- In `aggregate()`, Mongoose does not cast strings to ObjectIds, so IDs from query strings are converted with `new mongoose.Types.ObjectId(...)` first.
- `$lookup` uses real collection names (`students`, `classes`, `teachers`), not model names.

## Responses and error handling

### Success shapes

| Case                  | Shape                                                                                          |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| List                  | `{ "<plural>": [...], "pagination": { ... } }` (for example `students`, `classes`, `teachers`) |
| One / create / update | `{ "<singular>": { ... } }` (note: the class endpoints use the key `class`)                    |
| Delete                | `{ "message": "...", "<singular>": { ...deleted document } }`                                  |
| Reports               | `{ "count": n, "report": [...] }` or `{ "total": n, "distribution": [...] }`                   |

### Error shape

```json
{ "message": "Validation failed", "errors": ["Name is required", "Invalid email address"] }
```

`errors` is present only for validation failures. Everything else is `{ "message": "..." }`.

### Error mapping (global handler in `app.js`)

| Source                                    | Status         | Message                                                      |
| ----------------------------------------- | -------------- | ------------------------------------------------------------ |
| Mongoose `ValidationError`                | 400            | `Validation failed` + `errors[]`                             |
| Duplicate key (code `11000`) on one field | 409            | `<field> already exists`                                     |
| Duplicate on a compound index             | 409            | `A record with this combination already exists`              |
| Mongoose `CastError`                      | 400            | `Invalid <path>`                                             |
| Malformed JSON body                       | 400            | `Invalid JSON`                                               |
| `AppError(message, status)`               | its own status | its own message                                              |
| Unknown route                             | 404            | `Route not found`                                            |
| Anything unexpected                       | 500            | `Internal server error` (details are logged, never returned) |

Because the app is on Express 5, a rejected promise inside an `async` controller goes to this handler automatically, so controllers do not need `try/catch`.

## Security notes

Implemented:

- **Mass-assignment protection**: only whitelisted body fields are used (`pickAllowed`).
- **NoSQL injection guard**: query params that must be strings are type-checked, so objects such as `?class[$ne]=x` are rejected.
- **Regex injection / ReDoS guard**: search input is escaped before use.
- **Sort whitelisting**: user input never becomes a field name directly.
- **CORS allow-list**: only origins listed in `CORS_ORIGIN` are accepted (no `*`).
- **Parameterised data access** through Mongoose, with request `limit` capped at 100.
- Secrets live only in environment variables and `.env` is git-ignored.
- Internal error details are logged server-side and never sent to the client.

**Not implemented yet** (see roadmap): authentication and authorisation, rate limiting, security headers (`helmet`), request body size policy beyond Express defaults. CORS only restricts browsers, so until authentication exists the API is effectively public.

## Environment variables

| Name          | Required                        | Example                                                                                 | Purpose                                                                    |
| ------------- | ------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `PORT`        | No (host sets it in production) | `3000`                                                                                  | Port to listen on                                                          |
| `MONGODB_URI` | Yes                             | `mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/school?retryWrites=true&w=majority` | Atlas connection string; the database name is the path segment (`school`)  |
| `CORS_ORIGIN` | Yes in production               | `https://your-app.vercel.app`                                                           | Allowed browser origin(s), comma-separated, exact match, no trailing slash |
| `NODE_ENV`    | Production                      | `production`                                                                            | Set by the host                                                            |

Use a **separate database name per environment** (`school` for development, `school_prod` for production) so seeding or testing never touches live data.

## Seeding

```bash
npm run seed:teachers && npm run seed:classes && npm run seed:students
```

Order matters: classes reference teachers (looked up by email), and students reference classes.

> **Warning:** seed scripts call `deleteMany({})` first, so they **wipe the target collection**. Always check which database `MONGODB_URI` points at before running them.

To seed another database without editing `.env`, set the variable in the shell (a shell value takes priority over `--env-file`):

```bash
MONGODB_URI='mongodb+srv://...mongodb.net/school_prod?retryWrites=true&w=majority' npm run seed:teachers
```

## Deployment

**API on Render, database on MongoDB Atlas.**

| Setting (Render web service) | Value                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------- |
| Root Directory               | `backend`                                                                                   |
| Build Command                | `npm install`                                                                               |
| Start Command                | `npm start`                                                                                 |
| Health Check Path            | `/api/health`                                                                               |
| Environment                  | `MONGODB_URI` (production database), `CORS_ORIGIN` (frontend origin), `NODE_ENV=production` |

Notes and gotchas:

- **Atlas network access**: Render's free instances do not have a fixed IP. Add the CIDR ranges from the service's **Connect -> Outbound** tab to Atlas **Network Access**. If Atlas ever shows `MongooseServerSelectionError`, re-check that these ranges are still current and **Active**.
- The server only starts listening **after** the database connects. If the connection fails, Render reports "No open ports detected", so look at the logs for the real error.
- Pin the Node version with `engines` in `package.json`; an open range like `>=20` makes Render pick the newest release.
- **Cold starts** on the free tier make the first request slow.
- Import paths are case-sensitive on Linux (`Class.js` is not `class.js`), so a typo that works on macOS fails on Render.
- Pushing to `main` redeploys automatically.

## Adding a new resource

Example: `subjects`.

1. **Model**: `models/Subject.js` with validation messages, `timestamps: true` and any indexes.
2. **Controller**: `controllers/subject.controller.js` with `create`, `get all`, `get one`, `update`, `delete`. Reuse `pickAllowed`, `parsePagination`, `escapeRegex` and `AppError`.
3. **Routes**: `routes/subject.routes.js`, with `validateObjectId()` on every `/:id` route.
4. **Mount** it in `app.js` **before** the 404 handler: `app.use('/api/subjects', subjectRoutes)`.
5. **Guards**: if other collections reference it, add "cannot delete while in use" checks (`409`).
6. **Seed script** (optional) plus an npm script.
7. Update this README's API reference.

## Known limitations and roadmap

- **No authentication or authorisation yet.** Next: register and login with bcrypt and JWT, roles (admin / teacher), protected routes.
- Planned security work: `helmet`, rate limiting, request size limits, and query sanitisation middleware.
- Planned: student photo upload (multer).
- Planned: a NestJS port of this API (modules, DTO validation with pipes, guards).
- The delete guards are check-then-delete, so a race between two simultaneous requests could still leave a dangling reference. A transaction or soft delete would close that gap.
- No automated tests yet.
