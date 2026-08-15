# 🥤 Soda Stream Logger

Mobile-first PWA for logging home soda-carbonation usage: each pour's shots (Strong/Medium/Light, any combination), bottles prepared, and flavor syrup, plus CO2 tank tracking.

Smaller sibling of [Coffee Logger](../Coffee%20Logger) — same stack and architecture, scoped down to just the essentials.

## Screens

- **New Soda** — bottles prepared, then steppers for each shot intensity (a pour can mix, e.g. 2 medium + 1 strong), optionally add a flavor syrup + ml. Blocked (not silently ignored) if there's no active tank. `ml` is required for any flavor except `always_available` ones — a pour with syrup but no ml would silently break inventory tracking. Captures the real hour's weather (temperature/precipitation, Open-Meteo) at the moment of insert, best-effort — never blocks registering a soda if the request fails/times out.
- **Tanks** — track purchased CO2 cylinders through their lifecycle (pending → active → closed). One **Change Tank** button closes the current tank and activates the next pending one in a single action. Labels (A, B, C...) are assigned automatically by the database; all tanks are the same size so capacity isn't tracked; cost 0 means it came with the machine.
- **Flavors** — one row per syrup purchase (brand, cost, ml, purchase date), same pattern as coffee bags. "Finish" marks it used up and removes it from the New Soda picker until a new purchase is logged. Limon is the one exception — always available, since it's fresh-squeezed with no real cost to track. Each flavor shows remaining ml (`ml purchased − ml used across its preparations`, accounting for `bottles_prepared` when a pour makes more than one bottle).
- **History** — past (closed) cylinders with total liters yielded, most recent first; for the active cylinder, liters so far, a predicted total (average of past cylinders), and its own preparations list.

## Stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · PostgreSQL

## Setup

```bash
pnpm install
cp .env.example .env.local   # fill in your Postgres credentials
```

Production runs in the shared `casa` Postgres database, under its own `soda_stream` schema (not `public`) — set `PGDATABASE=casa` and `PGSCHEMA=soda_stream` in `.env.local`. `PGSCHEMA` sets the connection's `search_path` (both `lib/db.ts` and `scripts/migracion.py`), so every unqualified table name in the migrations and app code lands in the right schema without changing a single query.

Apply the schema (run each file in `db/migrations/` in order against your Postgres, via psql/pgAdmin, or a one-off `node -e "require('pg')..."` script).

```bash
pnpm build
pnpm start
```

## Data model

- `soda_flavors` — one row per flavor purchase: name, brand, cost, ml, purchase date, finished date, plus an `always_available` flag (set on Limon)
- `soda_cylinders` — tank purchase → open → close lifecycle; `label` auto-assigned by a Postgres trigger (A, B, C, ...); `historical_liters` holds pre-tracking-era yield that isn't in `soda_preparations` (see below)
- `soda_preparations` — one row per pour: timestamp, cylinder, shot counts per intensity, bottles prepared, optional flavor + ml used, plus `temp_c`/`precipitacion_mm` (weather at pour time)
- `soda_legacy_consumption` — one-time migration artifact: event-by-event record of pours from before real shot-intensity tracking existed (date/cylinder/flavor/bottle-count only, no shots — inserting fake shots there would violate `soda_preparations`' `at_least_one_shot` constraint and the data's own integrity). Kept for historical yield/analysis, not part of the app's live flow.
- `soda_market_benchmarks` — yearly reference prices by market segment, for cost/savings comparisons in the separate analytics pipeline

No maintenance or waste tracking — this app is intentionally smaller than Coffee Logger.

## Related

The one-off `scripts/migracion.py` (gitignored, not part of the app) migrates real historical data from the source Google Sheet into this schema — see it for the exact business rules (manual-era vs. tracked-era split, flavor/cylinder inference, etc). The separate `Sodastream` repo (Gasificador) is an independent cost/ROI analytics pipeline reading from this same schema — not part of this app.
