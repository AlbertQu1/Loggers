# Stylo

Mobile-first PWA for a personal stylist inspired by the digital closet in *Clueless*: photograph your clothes, let AI cut them out and tag them, then build outfits from what you already own, rotate pieces you haven't worn in a while, and check whether something you saw in a store goes with your wardrobe.

Client for the [Guardaropa](https://github.com/AlbertQu1/Guardaropa) FastAPI backend (background removal, Gemini tagging, pgvector similarity). Folder and services keep the internal name `guardarropa`.

## Screens

- **Clóset** — your wardrobe as a photo grid, filterable by category. Tap a piece to see how often you've worn it, edit its tags, start an outfit from it, or record its **care**: snap the inside label and Stylo reads the fabric composition and the ISO laundry symbols (you can correct them by tapping the matching symbol). No label, or the AI can't read it? Pick the fabric and Stylo fills in that fabric's typical care, marked as an estimate. Pieces unworn for 60+ days are flagged.
- **Agregar** (center **+** button) — take a photo or pick one from the gallery; the backend removes the background and suggests category, colors, formality, weather and occasions. Nothing is saved until you confirm or correct the tags.
- **Outfit** — pick a base piece and swipe through ranked options for each slot (top, bottom, shoes, layer, accessory), with a live preview of the look and the reason behind each suggestion. Pin what you like and the rest is re-suggested. Bags and backpacks are never suggested on their own; tap "Agregar bolsa o mochila" when you want one. "Me lo puse hoy" logs the outfit as worn, which feeds rotation.
- **Lavandería** (from Clóset) — select what you're about to wash and get it split into compatible loads (whites/lights, darks, colors, delicates, hand wash, dry clean) with max temperature and per-piece warnings. Includes a **care guide**: what each laundry symbol means, how to wash each fabric, and household items like sheets, towels and curtains.
- **Salidas** (from Clóset) — when a piece leaves your closet you say why (gifted, donated, sold, worn out, doesn't fit…). Its history is kept here, with how much you wore it, and you can bring it back.
- **Olvidadas** — pieces you haven't worn in 60+ days and pieces you've never worn; tap one to build an outfit around it.
- **Tienda** — *coming soon:* photograph something in a store and see what it goes with and whether you already own something similar.

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
