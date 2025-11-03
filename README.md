## Prompt2Site  [ Generate Website with AI ]

Generate, edit, and explore website designs with AI. Export code instantly.

### Tech Stack
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Clerk Authentication
- Drizzle ORM + Neon PostgreSQL
 - OpenRouter (AI streaming proxy)

### Features
- Email-based auth with Clerk (sign-in/up modals at `/sign-in` and `/sign-up`)
- Automatic user record creation on first sign-in (`/api/users`)
- Protected routes via Clerk middleware
- Project creation flow from the homepage (POST `/api/projects`)
- Reusable UI components in `components/ui`

---

## Getting Started

### 1) Prerequisites
- Node.js 18+ and npm
- A Clerk application (publishable and secret keys)
- A Neon (or any Postgres) database URL

### 2) Install dependencies
```bash
npm install
```

### 3) Environment variables
Create a `.env.local` file at the project root and add:
```
DATABASE_URL=postgres://... # Neon connection string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# AI / OpenRouter (required for AI features)
OPENROUTER_API_KEY=sk-or-v1_...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=meta-llama/llama-4-scout:free
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4) Database
Generate and run migrations with Drizzle:
```bash
npm run db:generate
npm run db:migrate
```
Optional: Drizzle Studio
```bash
npm run db:studio
```

### 5) Run the app
```bash
npm run dev
```
Open http://localhost:3000 (or whichever port the dev server reports; it may fall back to 3001 if 3000 is in use).

---

## Scripts
- `npm run dev` — Start Next.js dev server
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run db:generate` — Generate Drizzle migrations
- `npm run db:migrate` — Apply migrations
- `npm run db:studio` — Drizzle Studio
- `npm run type-check` — TypeScript check

---

## Project Structure (high level)
```
app/
	layout.tsx           # Root layout with ClerkProvider + Provider
	page.tsx             # Home page (Header, Hero)
	_components/         # Header, Hero, etc.
	api/
		users/route.ts     # Creates/returns user in DB after sign-in
		projects/route.ts  # Creates new project from prompt
components/ui/         # shadcn/ui primitives
config/                # Drizzle db + schema
lib/, hooks/           # Utilities and hooks
public/                # Static assets
```

---

## Auth Flow
1. User signs in with Clerk (`/sign-in` or `/sign-up`).
2. The `Provider` component calls `/api/users` to upsert a DB user.
3. `UserDetailContext` provides `userDetail` throughout the app.

Note: Clerk sign-in modal won’t open when a user is already signed in for single-session apps (you’ll see a dev-only notice). Render sign-in UI only for logged-out users.

## AI / Streaming notes

- The app proxies AI requests via `POST /api/ai-model` which forwards to an OpenRouter-compatible endpoint.
- The proxy expects a JSON body: `{ messages: Array<{ role: "system"|"user"|"assistant", content: string }> }`.
- The server uses streaming (SSE-style) and forwards assistant text chunks to the browser. If OpenRouter returns non-2xx, the proxy forwards the upstream status and body to help debugging.
- Common causes of 500s:
	- Missing/invalid `OPENROUTER_API_KEY`
	- Invalid/unsupported model in `OPENROUTER_MODEL`
	- Payload issues (ensure `messages` is a non-empty array with valid `role` and `content`)
	- Rate limits or account issues on the provider side

Tips:
- Set `NEXT_PUBLIC_APP_URL` to your dev origin (for `HTTP-Referer`).
- Use a known-good model alias to start (for example `qwen/qwen2.5-coder:latest` or change via `OPENROUTER_MODEL`).

---

## API Endpoints (overview)
- `POST /api/users` — Create or return user. Response `{ user: { id, name, email, credits, ... } }`.
- `POST /api/projects` — Create a project from a prompt. Expects `{ projectId, frameId, messages }`.

---

## Troubleshooting
- Clerk modal doesn’t open in dev when already signed in: this is expected for single-session apps; conditionally render the modal button only for logged-out users.
- Drizzle insert returns unexpected data: use `.returning()` and consume the first row.
- “use client” warnings: keep heavy components server-side and isolate auth/UI state into small client components.
- `/api/ai-model` returning 500 or stream parse errors:
	- Check the response body in DevTools → Network → Response for the upstream message (the route forwards it).
	- Verify `OPENROUTER_API_KEY` and `OPENROUTER_MODEL` in your `.env.local`.
	- Ensure `messages` is non-empty and not excessively large while testing.
	- If you see JSON parse errors in server logs, the SSE parser may have encountered partial chunks; the route includes buffering logic to handle this, but upstream fragmentation can still cause noisy logs — check provider stability.
