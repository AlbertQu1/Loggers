# Loggers

A collection of personal home-appliance tracking apps — small, focused PWAs for logging day-to-day usage of things around the house, backed by Postgres and built for real-world use (not just demos).

Each app lives in its own folder with its own README, stack, and database.

## Apps

### ☕ [Coffee Logger](./Coffee%20Logger)

Mobile-first PWA for logging coffee consumption: cups prepared, coffee bags, waste, and machine maintenance (cleaning/descaling alerts based on usage). Includes a lightweight benchmark tracker for competitor cafe prices, feeding a separate Python analytics pipeline.

**Stack:** Next.js (App Router) · React · TypeScript · Tailwind CSS · PostgreSQL

### 🥤 [Soda Stream Logger](./Soda%20Stream%20Logger)

Mobile-first PWA for logging soda-carbonation usage: pour intensity, flavor syrups, and CO2 tank tracking with a single "change tank" action. Smaller sibling of Coffee Logger — same architecture, scoped to just the essentials.

**Stack:** Next.js (App Router) · React · TypeScript · Tailwind CSS · PostgreSQL

## Why this exists

These apps replace ad-hoc spreadsheet tracking with purpose-built tools: fast mobile data entry, offline-first sync, and a real relational schema underneath — so the data is actually usable for analysis later, not just logged and forgotten.
