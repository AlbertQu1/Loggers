# Personal Assistant

App de consulta (PWA) para el proyecto [personal-assistant](../../proyectos/personal-assistant) — el "segundo cerebro" personal: notas del vault, fotos/archivos multimedia archivados, y datos estructurados de las demas apps (vacaciones, consumo de cafe/soda, juegos de mesa), todo preguntable en lenguaje natural.

No calcula nada por su cuenta: solo manda la pregunta al backend Python (`source/api.py`, FastAPI) y muestra la respuesta.

**Stack:** Next.js (App Router) · React · TypeScript · Tailwind CSS · PWA

## Setup

```bash
pnpm install
cp .env.example .env.local  # ajusta NEXT_PUBLIC_API_BASE_URL si el backend no esta en localhost:8002
pnpm dev
```

Necesita el backend corriendo aparte (`uvicorn source.api:app --host 0.0.0.0 --port 8002` en el repo `personal-assistant`), y a su vez el [servicio de embeddings compartido](../../proyectos/embeddings-service) (puerto 8001).

## Estructura

- `app/preguntar` — chat de preguntas/respuestas. El backend elige entre tres herramientas segun la pregunta: `search_notes` (un hecho puntual en una nota indexada), `query_casa_sql` (estadisticas estructuradas: vacaciones, consumo, juegos de mesa — **no** incluye Coffee Logger, que vive en una base `test` separada sin acceso), `query_graph` (cruces entre varias notas/eventos, ej. "a que eventos ha ido X"). El system prompt incluye la fecha de hoy en cada request para resolver referencias relativas ("ayer", "manana"). Manda las ultimas 6 preguntas/respuestas de vuelta en cada turno para mantener contexto de la conversacion. Fuentes citadas siempre, expandibles. Respuestas renderizadas como markdown (`react-markdown`).
- `app/diario` — captura directa de entradas de diario sin pasar por SilverBullet: el texto se guarda con formato ligero (encabezado con fecha en español + parrafos) y se indexa de inmediato.
- `app/pendientes` — archivos descargados de la carpeta "Wiki Inbox" de Drive (via n8n) esperando clasificacion: eliges `doc_type` (trabajo, escuela, receta, manual, diario, concierto, viaje, otro), y para `concierto`/`viaje` pides venue+artista o destino para que el backend archive el archivo original en la carpeta correspondiente. Badge de conteo en la barra inferior.
- `app/personas` — buzon de nombres mencionados en notas con un candidato plausible en tu roster de jugadores (fuzzy match, `pg_trgm`) esperando confirmar/descartar. Badge de conteo en la barra inferior.
- `components/layout` — nav inferior + indicador de salud del backend (poll cada 30s)
- `services/api` — unica capa que habla con el backend (nunca se llama a Postgres/Gemini directo desde aqui)

## Notas de diseño

- Documentos de texto (pdf/docx/txt/md) indexados: solo se conserva el texto extraido, el archivo original se descarta.
- Multimedia (fotos, video/audio a futuro): el archivo original se conserva, archivado en `archivos/<tipo>/...` dentro del vault — nunca se borra.
- El vault tambien se alimenta directo (sin pasar por esta app) desde [SilverBullet](http://localhost:8080) para notas tipo diario, re-indexado automatico cada 10 min via `vaultreindex.timer`.
