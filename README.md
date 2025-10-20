## Prompt2Site — AI Website Generator

Generate, edit, and explore website designs with AI. Export code instantly.

### Tech Stack
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Clerk Authentication
- Drizzle ORM + Neon PostgreSQL

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
Open http://localhost:3000.

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

---

## API Endpoints (overview)
- `POST /api/users` — Create or return user. Response `{ user: { id, name, email, credits, ... } }`.
- `POST /api/projects` — Create a project from a prompt. Expects `{ projectId, frameId, messages }`.

---

## Troubleshooting
- Clerk modal doesn’t open in dev when already signed in: this is expected for single-session apps; conditionally render the modal button only for logged-out users.
- Drizzle insert returns unexpected data: use `.returning()` and consume the first row.
- “use client” warnings: keep heavy components server-side and isolate auth/UI state into small client components.

---

## License
MIT
