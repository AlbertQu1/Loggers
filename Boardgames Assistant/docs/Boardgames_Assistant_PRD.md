# Boardgames Assistant

## Project Goal

Build a mobile-first Progressive Web App (PWA) called Boardgames Assistant.

It is the consumption client for the Boardgames RAG + Stats ecosystem.

The app is responsible ONLY for asking questions and displaying answers.

The app must never do embedding, chunking, vector search, or LLM calls itself.

Those happen in a Python backend, connected to PostgreSQL (pgvector) and the Gemini API.

The application should feel like a polished native mobile application.

---

# Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Progressive Web App
- Mobile First
- Responsive
- Dark Mode
- Light Mode

Organize the project cleanly, matching the other apps in this repo (Coffee Logger, Soda Stream Logger).

Suggested folders:

/components

/services

/types

/lib

/hooks

Do not mix UI with API calls.

---

# Backend Architecture

The application MUST NOT connect to PostgreSQL directly.

The application MUST NOT run embeddings or call the Gemini API directly.

Architecture:

Boardgames Assistant (this app)

↓

REST API (Python, FastAPI)

↓

pgvector search + Gemini tool-use loop

↓

PostgreSQL (`boardgames` schema, `casa` db)

The Python backend lives in the separate `boardgames-assistant` repo (`source/api.py`), not inside this app. It exposes `/ask`, `/health`, `/juegos`, `/bgstats/sync`, and (new, see Screen 3) `/juegos/bgg-lookup` + `/reglamentos/subir`.

`/ask` now has two tools available to Gemini, not one: `search_rulebooks` (RAG over indexed rulebooks) and `query_sql` (read-only SQL against `bgstats.*` — plays, players, locations, stats). Gemini picks the right one per question; the app doesn't need to know which was used, only render `respuesta` + `fuentes` (fuentes will be empty when `query_sql` was used, since there's no rulebook chunk to cite).

The frontend communicates ONLY through REST API endpoints.

Create a dedicated API service layer:

services/

ask.ts

All API URLs must be configurable using environment variables.

---

# Navigation

Bottom Navigation Bar.

Three tabs (was two — added "Agregar" 2026-08-09, see Screen 3).

❓ Preguntar

📊 BG Stats

➕ Agregar

---

# Screen 1 — Preguntar

This is the default screen.

Purpose: ask a rules question and get an answer, in under a normal chat exchange.

Top section

Optional game filter — dropdown of games that currently have indexed content (populated from the backend, not hardcoded).

If no game selected, search is across everything indexed.

Chat area

Scrollable list of question/answer turns, most recent at the bottom.

Each answer shows:

The synthesized answer text (from Gemini).

A collapsible "Fuentes" section listing which rulebook chunks were used (juego, source_pdf, idioma) — transparency on where the answer came from.

Input

Text input pinned to the bottom.

Send button.

While waiting for a response, show a loading state (e.g. "Buscando en el reglamento...").

Error handling

If the backend is unreachable or returns an error, show a toast:

"No se pudo conectar con el asistente. Intenta de nuevo."

Never crash the chat view — failed questions stay visible so the user can retry.

---

# Screen 2 — BG Stats

Placeholder screen for now.

Display:

"Próximamente"

"Aquí vas a poder ver estadísticas de tus partidas (BG Stats)."

No functionality yet. Reserved navigation slot for Fase 2.

---

# Screen 3 — Agregar (added 2026-08-09)

Purpose: index a new rulebook (PDF/DOCX) from the phone, without SSH — replaces the manual `scp` + terminal command workflow used until now.

Two entry paths into this screen, both end at the same form:

1. **Direct upload** — pick a file from the device right now, fill the form, submit immediately.
2. **Async inbox (added later, same day)** — upload the file to a Google Drive folder ("Reglamentos") from anywhere/any device, no form filled at that moment. An n8n workflow (Drive Trigger → filter `.pdf`/`.docx` → Download → write to `pdfs_prueba/pendientes/` → move original to a "Procesados" Drive subfolder) lands the file on the server unattended. This screen then shows those waiting files so the form can be filled in later, from any device — decouples "get the file onto the server" from "tell the system what it is." Deliberately no push/email notification for this — just a passive badge, checked next time the app is opened.

Top section — Pendientes (only shown if count > 0)

List of filenames currently in `pdfs_prueba/pendientes/` (from `GET /reglamentos/pendientes`), each tappable. Tapping one selects it as the active item for the form below — the file picker section is replaced by a read-only chip showing the filename (with an X to deselect and go back to normal upload mode). Submitting in this mode calls `POST /reglamentos/confirmar` (`archivo_nombre` instead of a file) rather than `/subir`.

The bottom nav's "Agregar" tab icon shows a small red badge with this same count, polled every 60s — visible from any screen, not just this one.

Second section — BGG link (optional, best-effort)

Text input: paste a BGG game URL (e.g. `boardgamegeek.com/boardgame/224517/...`).

Button "Buscar". Calls `GET /juegos/bgg-lookup?url=...`.

**Important constraint, not a bug**: this does NOT call the live BGG API. BGG's XML API now requires a registered + approved application (registration submitted 2026-08-09, pending — approval can take a week or more per BGG's policy). Until approved, lookup only checks our own `bgstats.juegos` table (populated from BG Stats exports, which already carries `bgg_id`/`bgg_nombre` for every game Alberto already owns/has played) by extracting the numeric ID from the pasted URL.

- If found (game already in the BG Stats library): auto-fill the "Juego" field below, still editable.
- If not found (genuinely new game, not yet played/synced): show "No encontrado en tu biblioteca — escribe el nombre manualmente" and leave "Juego" empty for manual entry. This is expected and common, not an error state — most NEW rulebook additions will hit this path, since by definition a brand-new game hasn't been played/synced yet.

Once the BGG application is approved, this same field can start hitting the real API as a fallback when the local lookup misses — no redesign needed, just swap the backend implementation behind `/juegos/bgg-lookup`.

Form fields

- **Juego** (text, required) — game name. Auto-filled if BGG lookup above found a local match; otherwise typed manually. Must match BGG's exact name for consistency with existing indexed data (same convention used via SSH so far).
- **Idioma** (dropdown: es / en, default es).
- **Tipo de documento** (dropdown: reglamento / errata / faq, default reglamento).
- **Es expansion de...** (optional dropdown, searchable — same base-game list as the `JuegoSelector` component on the Preguntar screen). If set, sent as `juego_base`.
- **Archivo** — file picker (accepts `.pdf`/`.docx`) in direct-upload mode; a read-only filename chip in pendientes mode (see above).

Submit button: "Indexar reglamento"

- While processing, show a loading state — indexing can take from a few seconds (normal PDF) up to a couple minutes (OCR fallback for image-heavy PDFs, or long rulebooks). Don't imply this is instant.
- On success: toast "✓ Indexado: N chunks", clear the form, refresh both the juegos list and the pendientes list/badge.
- On error: toast with the backend's error message, keep the form filled so the user doesn't have to redo it.

Calls `POST /reglamentos/subir` (multipart/form-data: `archivo`, `juego`, `idioma`, `doc_type`, `juego_base?`) in direct-upload mode, or `POST /reglamentos/confirmar` (`archivo_nombre`, `juego`, `idioma`, `doc_type`, `juego_base?`) in pendientes mode.

---

# Frontend Responsibilities

The frontend ONLY sends questions and displays answers.

Never calculate:

Embeddings

Similarity search

Which chunks are relevant

LLM prompting/synthesis

Those belong to the Python backend.

---

# Expected REST Endpoints

GET /health

POST /ask
- body: `{ pregunta: string, juego?: string }`
- response: `{ respuesta: string, fuentes: [{ juego, source_pdf, idioma, chunk_index }] }`

GET /juegos
- response: list of distinct `juego` values currently indexed, to populate the filter dropdown.

GET /juegos/bgg-lookup?url=...
- response: `{ encontrado: boolean, nombre?: string }` — looks up the BGG ID parsed from the URL against `bgstats.juegos` (local data only, see Screen 3 for why).

POST /reglamentos/subir (multipart/form-data)
- fields: `archivo` (file), `juego` (string), `idioma` (string), `doc_type` (string), `juego_base` (string, optional)
- response: `{ chunks: number }`

GET /reglamentos/pendientes
- response: `string[]` — filenames currently in the async inbox, awaiting the form.

POST /reglamentos/confirmar (multipart/form-data)
- fields: `archivo_nombre` (string, must match a file already in the inbox), `juego`, `idioma`, `doc_type`, `juego_base` (optional)
- response: `{ chunks: number }`

---

# Error Handling

Every API call should:

Handle loading state

Handle timeout

Handle API error

Use toast notifications.

No offline queue needed (unlike Coffee Logger) — this app is read-only/query-only, there's nothing to queue for later sync.

---

# Final Goal

The result should look like a premium mobile chat application that could be installed on an iPhone or Android device as a PWA.

The code should be production-ready, modular, maintainable, and consistent with the conventions already established in Coffee Logger and Soda Stream Logger within this monorepo.

Prioritize UX over visual complexity.

Fast, simple, mobile-first.
