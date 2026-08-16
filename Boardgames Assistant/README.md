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

- `app/preguntar` — chat de preguntas/respuestas (reglas + estadisticas via `query_sql`, Gemini elige la herramienta). Manda las ultimas 6 preguntas/respuestas de vuelta al backend en cada turno para mantener contexto (ej. "¿cuando se acaba la partida?" despues de hablar de un juego especifico). Respuestas renderizadas como markdown (`react-markdown`)
- `app/bg-stats` — dashboard: resumen, top juegos, coleccion/gasto, clima, cuándo juegas (con probabilidad por dia, tu vs tu circulo de amigos), top lugares con mapa
- `app/ml` — prediccion de duracion, toggle Normal/Solo (modelos separados, ver `components/screens/ml/ml-screen.tsx`)
- `app/agregar` — subir/confirmar reglamentos nuevos (directo o via buzon de Drive). El campo de juego (`juego-catalogo-selector.tsx`) busca en tu biblioteca de BG Stats y en vivo en BGG (`GET /juegos/bgg-buscar`, con debounce): se elige de una lista con caratula/año, y si el juego ya esta en tu biblioteca se usa su nombre local para que el reglamento quede colgado del mismo juego
- `components/layout` — 3 badges en el header (amigos nuevos con BGG, lugares/fuentes de compra sin normalizar, partidas anonimas sin grupo social) — polling automatico, se resuelven desde ahi sin tocar la base a mano
- `services/api` — unica capa que habla con el backend (nunca se llama a Postgres/Gemini directo desde aqui)

Detalle completo del diseño en `docs/Boardgames_Assistant_PRD.md`.
