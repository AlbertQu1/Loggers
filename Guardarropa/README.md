# Stylo

Mobile-first PWA for a personal stylist inspired by the digital closet in *Clueless*: photograph your clothes, let AI cut them out and tag them, then build outfits from what you already own, rotate pieces you haven't worn in a while, and check whether something you saw in a store goes with your wardrobe.

Client for the [Guardaropa](https://github.com/AlbertQu1/Guardaropa) FastAPI backend (background removal, Gemini tagging, pgvector similarity). Folder and services keep the internal name `guardarropa`.

## Screens

- **Clóset** — your wardrobe as a photo grid, filterable by category (tops, bottoms, shoes, jackets, accessories). Tap a piece to see how often you've worn it, edit its tags, or remove it. Pieces unworn for 60+ days are flagged.
- **Agregar** (center **+** button) — take a photo or pick one from the gallery; the backend removes the background and suggests category, colors, formality, weather and occasions. Nothing is saved until you confirm or correct the tags.
- **Outfit** — *coming soon:* pick a base piece and swipe through matching shirts, shoes, etc., or ask for an outfit in plain language.
- **Tienda** — *coming soon:* photograph something in a store and see what it goes with and whether you already own something similar.
- **Olvidadas** — *coming soon:* pieces you haven't worn lately, with outfit ideas to bring them back.

Follows the phone's light/dark mode automatically.

## Stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · Python/FastAPI backend

## Setup

```bash
pnpm install
cp .env.example .env.local   # NEXT_PUBLIC_API_BASE_URL → the stylo backend
pnpm build
pnpm start
```
