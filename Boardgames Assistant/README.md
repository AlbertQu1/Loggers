# Boardgames Assistant

App de consulta (PWA) para el proyecto [boardgames-assistant](../../proyectos/boardgames-assistant) — pregunta reglas de tus juegos de mesa en lenguaje natural.

No calcula nada por su cuenta: solo manda la pregunta al backend Python (`source/api.py`, FastAPI) y muestra la respuesta.

**Stack:** Next.js (App Router) · React · TypeScript · Tailwind CSS · PWA

## Setup

```bash
pnpm install
cp .env.example .env.local  # ajusta NEXT_PUBLIC_API_BASE_URL si el backend no esta en localhost:8000
pnpm dev
```

Necesita el backend corriendo aparte (`uvicorn source.api:app --host 0.0.0.0 --port 8000` en el repo `boardgames-assistant`).

## Estructura

- `app/preguntar` — pantalla principal, chat de preguntas/respuestas
- `app/bg-stats` — placeholder, reservado para Fase 2
- `services/api` — unica capa que habla con el backend (nunca se llama a Postgres/Gemini directo desde aqui)

Detalle completo del diseño en `docs/Boardgames_Assistant_PRD.md`.
