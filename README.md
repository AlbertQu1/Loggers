# Loggers

A collection of small, focused personal PWAs — mostly for logging day-to-day usage of things around the house, plus a couple of consumption clients for other backend projects — backed by Postgres and built for real-world use (not just demos).

Each app lives in its own folder with its own README, stack, and database.

## Apps

### ☕ [Coffee Logger](./Coffee%20Logger)

Mobile-first PWA for logging coffee consumption: cups prepared, coffee bags, waste, and machine maintenance (cleaning/descaling alerts based on usage). Includes a lightweight benchmark tracker for competitor cafe prices, feeding a separate Python analytics pipeline.

**Stack:** Next.js (App Router) · React · TypeScript · Tailwind CSS · PostgreSQL

### 🥤 [Soda Stream Logger](./Soda%20Stream%20Logger)

Mobile-first PWA for logging soda-carbonation usage: pour intensity, flavor syrups, and CO2 tank tracking with a single "change tank" action. Smaller sibling of Coffee Logger — same architecture, scoped to just the essentials.

**Stack:** Next.js (App Router) · React · TypeScript · Tailwind CSS · PostgreSQL

### 🎲 [Boardgames Assistant](./Boardgames%20Assistant)

Mobile-first PWA for asking board game rules in natural language — a chat client for the [boardgames-assistant](https://github.com/AlbertQu1/boardgames-assistant) RAG backend (PDF/DOCX rulebooks → pgvector → Gemini). Also has BG Stats (play analytics dashboard), ML (game session duration prediction), and Agregar (upload/confirm new rulebooks, searching BGG live).

**Stack:** Next.js (App Router) · React · TypeScript · Tailwind CSS · Python/FastAPI backend

### 🤖 [Personal Assistant](./Personal%20Assistant)

Mobile-first PWA for a personal "second brain" — a chat client for the personal-assistant RAG backend (notes vault, archived photos/media, and structured data from the other apps — vacations, coffee/soda consumption, boardgames — all queryable in natural language), now able to answer relationship/structure questions about your social graph with a Mermaid diagram it generates itself. Also has: a "Diario" tab for writing journal entries directly (light auto-formatting, indexed immediately); and a single unified "Pendientes" inbox covering everything awaiting your review — files uploaded via a watched Drive folder before indexing, fuzzy name matches found in notes against your board-game roster, and birthdays/dates detected in journal entries (nothing auto-saved, always requires confirmation).

**Stack:** Next.js (App Router) · React · TypeScript · Tailwind CSS · Python/FastAPI backend

### 👔 [Stylo](./Guardarropa)

Mobile-first PWA for a personal stylist inspired by the digital closet in *Clueless* — a client for the [Guardaropa](https://github.com/AlbertQu1/Guardaropa) backend. Photograph your clothes and AI cuts them out and tags them (category, colors, formality, weather, occasions); then build outfits from what you already own, rotate pieces you haven't worn in a while, and check whether a store find goes with your wardrobe. Follows the phone's light/dark mode.

**Stack:** Next.js (App Router) · React · TypeScript · Tailwind CSS · Python/FastAPI backend

## Why this exists

These apps replace ad-hoc spreadsheet tracking with purpose-built tools: fast mobile data entry, offline-first sync, and a real relational schema underneath — so the data is actually usable for analysis later, not just logged and forgotten.
