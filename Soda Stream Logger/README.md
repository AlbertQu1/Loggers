# 🥤 Soda Stream Logger

Mobile-first PWA for logging home soda-carbonation usage: each pour's shots (Strong/Medium/Light, any combination), bottles prepared, and flavor syrup, plus CO2 tank tracking.

Smaller sibling of [Coffee Logger](../Coffee%20Logger) — same stack and architecture, scoped down to just the essentials.

## Screens

- **New Soda** — bottles prepared, then steppers for each shot intensity (a pour can mix, e.g. 2 medium + 1 strong), optionally add a flavor syrup + ml. Blocked (not silently ignored) if there's no active tank.
- **Tanks** — track purchased CO2 cylinders through their lifecycle (pending → active → closed). One **Change Tank** button closes the current tank and activates the next pending one in a single action. Labels (A, B, C...) are assigned automatically by the database; all tanks are the same size so capacity isn't tracked; cost 0 means it came with the machine.
- **Flavors** — one row per syrup purchase (brand, cost, ml, purchase date), same pattern as coffee bags. "Finish" marks it used up and removes it from the New Soda picker until a new purchase is logged. Limon is the one exception — always available, since it's fresh-squeezed with no real cost to track.

## Stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · PostgreSQL

## Setup

```bash
pnpm install
cp .env.example .env.local   # fill in your Postgres credentials
```

Apply the schema (run each file in `db/migrations/` in order against your Postgres, via psql/pgAdmin, or a one-off `node -e "require('pg')..."` script).

```bash
pnpm build
pnpm start
```

## Data model

- `soda_flavors` — one row per flavor purchase: name, brand, cost, ml, purchase date, finished date, plus an `always_available` flag (set on Limon)
- `soda_cylinders` — tank purchase → open → close lifecycle; `label` auto-assigned by a Postgres trigger (A, B, C, ...)
- `soda_preparations` — one row per pour: timestamp, cylinder, shot counts per intensity, bottles prepared, optional flavor + ml used

No maintenance or waste tracking — this app is intentionally smaller than Coffee Logger.
