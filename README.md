# master-me

A platform that helps people master new programming language skills.

This is the REST API, built with Express 5, TypeScript, Postgres, and Better Auth.

## Stack

| | |
|---|---|
| Runtime | Node >= 22 (ESM) |
| Framework | Express 5 |
| Database | Postgres + [Drizzle ORM](https://orm.drizzle.team) |
| Auth | [Better Auth](https://better-auth.com) — magic link |
| Email | [Resend](https://resend.com) |
| Validation | [Zod](https://zod.dev) |

## Setup

**1. Install dependencies**

```bash
npm install
```

**2. Create your env file**

```bash
cp .env.example .env
```

Then fill in the values — see [Environment](#environment) below. The app validates
every variable at startup and exits with a readable message if one is missing.

**3. Create the database**

```bash
createdb master-me
```

**4. Run migrations**

```bash
npm run db:migrate
```

**5. Start the dev server**

```bash
npm run dev
```

The API runs on `http://localhost:3001`.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with auto-reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled build |
| `npm run typecheck` | Type check without emitting |
| `npm run db:generate` | Generate a migration from schema changes |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:studio` | Open Drizzle Studio |

## Environment

| Variable | Description |
|---|---|
| `PORT` | Port this API listens on (default `3000`) |
| `NODE_ENV` | `development` \| `test` \| `production` |
| `CLIENT_URL` | Frontend origin — used for CORS and as a trusted auth origin |
| `DATABASE_URL` | Postgres connection string |
| `BETTER_AUTH_SECRET` | Min 32 chars — generate with `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | This API's own origin, where auth routes are mounted |
| `RESEND_API_KEY` | From https://resend.com/api-keys |
| `EMAIL_FROM` | Sender address for magic link emails |

## API

| Endpoint | |
|---|---|
| `GET /health` | Liveness check — does not touch the database |
| `POST /api/auth/sign-in/magic-link` | Request a magic link (`{ "email": "..." }`) |
| `GET /api/auth/magic-link/verify` | Follow the emailed link — sets a session cookie |
| `GET /api/auth/get-session` | Current session for the request's cookie |

Better Auth mounts additional routes under `/api/auth/*` — see its docs for the full list.

Errors are always JSON: `{ "message": "..." }`. Client errors keep their status
(400, 404, 413, ...); anything unexpected is logged server-side and returned as a
generic 500.

## Project structure

```
src/
├── app.ts                    # Express app — no listen(), so tests can import it
├── server.ts                 # Entrypoint: listen()
├── config/env.ts             # Zod-validated environment, parsed once at boot
├── db/
│   ├── index.ts              # Drizzle client
│   └── schema/               # One file per table, re-exported from index.ts
├── lib/
│   ├── auth.ts               # Better Auth config
│   └── email.ts              # Resend wrapper
└── middleware/
    ├── error-handler.ts      # Terminal error handler — registered last
    └── not-found.ts          # 404 as JSON
```

`app.ts` deliberately does not call `listen()`. That keeps it importable by tests
(`supertest(app)`) with no server binding a port.

## Gotchas

Things that will cost you an hour if you forget them:

- **The auth handler must stay above `express.json()`** in `app.ts`. Better Auth
  reads the raw request body; if the JSON parser consumes the stream first,
  sign-in fails in ways the errors don't explain.
- **Express 5 needs `/api/auth/*splat`**, not `/api/auth/*`. A bare wildcard throws
  a path-to-regexp error at startup. Tutorials written for Express 4 have the old form.
- **Relative imports need a `.js` extension** even though the files are `.ts` —
  that's how NodeNext ESM resolution works.
- **Magic links always go through Resend**, including in development — they are
  never printed to the console. To sign in locally you need a real inbox.
- **Resend won't send to fake domains** like `example.com`; those fail with a 422.
  Until you verify a sending domain you can only deliver to `delivered@resend.dev`
  or the address on your own Resend account.
