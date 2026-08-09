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

The Python backend lives in the separate `boardgames-assistant` repo (`source/api.py`), not inside this app. It exposes `/ask` and (later) `/health`.

The frontend communicates ONLY through REST API endpoints.

Create a dedicated API service layer:

services/

ask.ts

All API URLs must be configurable using environment variables.

---

# Navigation

Bottom Navigation Bar.

Exactly two tabs.

❓ Preguntar

📊 BG Stats

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
