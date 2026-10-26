# ☕ Coffee Logger PWA

A production-quality Progressive Web App for capturing coffee events and sending them to a backend REST API. This is a mobile client for entering coffee data only—no analytics, calculations, or business logic.

## Overview

Coffee Logger is designed as a lightweight data entry client with a clean separation of concerns:

- **UI**: Fast, minimal, premium mobile-first interface
- **Services**: All API communication happens through a dedicated service layer
- **Offline Support**: Emergency sync queue using IndexedDB for resilience
- **No Authentication**: Authentication will be added later
- **No Database**: The app connects to a REST API backend only

## Architecture

### Folder Structure

```
/app                          # Next.js App Router pages
  /layout.tsx                # Root layout with PWA shell
  /page.tsx                  # Root redirects to /new-cup
  /new-cup/page.tsx          # Cup registration screen
  /bags/page.tsx             # Coffee bag management
  /waste/page.tsx            # Waste recording
  /history/page.tsx          # Activity timeline

/components
  /layout                     # Layout components
    bottom-nav.tsx           # Tab navigation
    health-indicator.tsx     # Connection status
  /screens                    # Feature screens
    /new-cup/cup-form.tsx
    /bags/bags-list.tsx
    /bags/create-bag-modal.tsx
    /waste/waste-form.tsx
    /history/history-list.tsx
  /common
    toast-notifications.tsx  # Toast system

/services                     # API service layer
  /api
    health.ts               # Health check endpoint
    cups.ts                 # Cup registration
    bags.ts                 # Coffee bag operations
    waste.ts                # Waste recording
    history.ts              # Activity history
  sync-queue.ts             # Offline sync management

/hooks                        # Custom React hooks
  use-health-check.ts       # Health status polling
  use-sync-queue.ts         # Sync queue management
  use-api.ts                # Generic API wrapper

/lib
  storage.ts                # IndexedDB operations
  utils.ts                  # Utilities

/types                        # TypeScript types
  index.ts                  # Shared types

/public
  manifest.json             # PWA manifest
```

### Clean Architecture Principles

All API requests go through the service layer (`/services/api/*`). Components never make HTTP calls directly:

```typescript
// ❌ DON'T do this in components:
const response = await fetch('/api/cups');

// ✅ DO this instead:
import { registerCup } from '@/services/api/cups';
const cup = await registerCup(payload);
```

This keeps the app maintainable—changing the backend endpoints requires only modifying `/services`.

## API Integration

### Environment Variables

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-api.example.com
```

### API Service Pattern

Each endpoint gets its own service file with typed requests/responses:

```typescript
// services/api/cups.ts
export async function registerCup(payload: CreateCupPayload): Promise<Cup> {
  // Implementation with timeout and error handling
}
```

### Endpoints

- `GET /health` - Health check
- `GET /bags` - List all bags
- `POST /bags` - Create new bag
- `PATCH /bags/:id/open` - Open bag for use
- `PATCH /bags/:id/finish` - Close current bag
- `POST /cups` - Register cup of coffee
- `POST /waste` - Record waste event
- `GET /history` - Fetch activity timeline
- `GET /cafeteria-benchmarks` / `POST /cafeteria-benchmarks` - Price benchmark entries (`cafeteriaName`, `city`, `price`, optional `latitude`/`longitude` captured via the browser's Geolocation API on the Benchmark tab — requires a secure context, see Access below)
- `GET /bag-predictions/latest` - Most recent ML prediction (total cups / cycle days) for the active bag, shown by the Bags page's prediction banner

## Offline Support

### Sync Queue

When the API is unreachable, failed requests are stored in IndexedDB:

1. User makes request
2. API call fails
3. Request enqueued to local storage with "pending" status
4. Toast shows "Queued for sync"
5. When connectivity returns, auto-retry
6. User can also trigger manual "Sync Now"

The sync queue is an **emergency failsafe only**—PostgreSQL is the single source of truth.

**Manual retry:** the "N pending" badge in the health indicator is itself a button — tapping it calls `syncPendingItems()` on demand, instead of waiting for the browser's `online` event (which never fires if the failure was server-side, not a real network drop).

**Timestamps survive retries:** the New Cup form captures `prepared_timestamp` at tap time and sends it in both the direct request and the queued one. `POST /api/cups` stores that value (falling back to `now()` only if it's missing, unparseable or in the future), so a cup that syncs hours later keeps its real preparation time instead of the retry time.

### Implementation

```typescript
// Automatic retry on connectivity restoration
setupConnectivityListener(() => syncPendingItems());

// Manual sync
const { succeeded, failed } = await syncPendingItems();
```

## UI/UX

### Design Philosophy

- **Fast**: Instant response to user actions
- **Minimal**: Only essential UI elements
- **Premium**: Material Design 3 aesthetics (rounded corners, soft shadows)
- **Mobile-first**: One-handed use, large touch targets
- **Native feeling**: No unnecessary animations or dialogs

### Health Status

Always visible in the header:
- 🟢 Connected - API reachable
- 🔴 Offline - No connectivity
- Shows pending sync count if items queued

### Screens

1. **New Cup** (Default)
   - Quick coffee registration in <5 seconds
   - Size selection (8 sizes: espresso to 16oz)
   - Options: cold, with milk, ground coffee
   - Success toast confirmation

2. **Bags**
   - Current active bag with finish button
   - Available bags to open (only one active at a time)
   - Closed bags archive
   - FAB to create new bag
   - Gifts: checking "This is a gift" sets price to 0 and the location to **Regalo** (the Purchase City selector is hidden). The API enforces the same rule both ways (`is_gift` ⇔ location `Regalo`), and the bookkeeping locations `Anual`/`Regalo` never appear in the city dropdown

3. **Waste**
   - Select affected bag
   - Enter grams wasted
   - Optional reason & notes
   - Dropdown reasons: spilled, stale, over-extracted, etc.

4. **History**
   - Chronological activity feed
   - Optional filters (ground coffee, cold, with milk)
   - Icons for different event types
   - Timestamps
   - **Layered cup icons**: each cup's icon is built additively from its attributes instead of a single fixed ☕, so the type is readable at a glance: base (☕ coffee / 🥛 no-coffee milk-only), + 🧊 if cold, + 🥛 if hot with milk, + 🍸 if it has alcohol, + one icon per flavor (🍫 Chocolate, 🍵 Matcha, 🥜 Mazapan, 🪻 Lavender, 🫖 Chai, ⭐ for anything else incl. custom `other_flavor`). Logic in `history-list.tsx`'s `getEntryIcon()`; flavor names come from `GET /history`'s `flavorNames` array (added alongside the existing `contains_flavor` boolean).

5. **Machine Care → Benchmark** (tab inside the Care/Maintenance screen, `components/screens/waste/waste-form.tsx`)
   - Log a cafeteria's double espresso price (name, city, price)
   - "📍 Use my location" captures lat/lng via the browser Geolocation API and stores it with the entry — only works over HTTPS/localhost (see Access below)
   - Shows the running average price for the current year

## Bag Yield Prediction (ML)

The Bags page shows a banner (`components/layout/prediction-banner.tsx`) with an estimate of the active bag's total cups and remaining days, e.g. "🤖 De la casa: el modelo predice ~48 tazas en ~34 días."

- **Model**: reuses the existing Lasso/Ridge/ElasticNet/KNN pipeline from the separate `coffee-consumption-analytics` repo (picks the best model per leave-one-out MAE), trained on all closed bags. Features: bag weight, opening month, average temperature/precipitation during the cycle (Open-Meteo), vacation days overlapping the cycle, recent/cycle average cup size, and — if a coffee name repeats ≥3 times in the history — a dummy variable for that specific coffee (otherwise bucketed as "OTROS").
- **Trigger**: `scripts/predict_active_bag.py` (not committed to git, same convention as `scripts/sync_from_sheets_landing.py`) runs after every real cup registration (`POST /cups`, fire-and-forget via `triggerBagPrediction()` in `app/api/cups/route.ts`) — not on a fixed schedule, since coffee isn't made every day and a timer would either lag or refresh for nothing. It writes a new row to `bag_predictions` each time.
- **Data note**: `bag_predictions.prediction_date`/`created_at` lost their DB defaults during the `test` → `casa.coffee_analytics` schema cutover (same incident class as the `prepared_timestamp` bug below) — restored in migration `0011`.

## Known Gaps / Roadmap

Recurring incident (fixed twice now, migrations `0010`/`0011`): columns that depend on a DB-level `DEFAULT` (`prepared_timestamp`, `bag_predictions.prediction_date`/`created_at`) silently lost that default during the schema cutover, causing inserts to fail into the offline sync queue instead of erroring loudly. If a future insert fails mysteriously, check for a missing column default first.

Reconciling failed/missing entries by hand (via `psql`) is not sustainable long-term. Next build priorities, in order:

1. **Editable timestamp on the New Cup form** — today `cup-form.tsx` always sends `new Date().toISOString()` (tap time); there's no way to log something that already happened without either backdating via `psql` or waiting for the next cup to nudge the clock. Add a date/time field defaulting to "now".
2. **Surface pending/failed sync-queue items with detail in History** — `history-list.tsx` only reads confirmed DB rows via `GET /history`; IndexedDB's `pending`/`failed` items are invisible there, only a count.
3. **Edit/delete on History entries** — currently fully read-only.

## Access

The dev/systemd process binds `127.0.0.1:3010`. Two ways to reach it:

- **Plain HTTP via Caddy**: `http://<tailscale-ip>:3000` (`/etc/caddy/Caddyfile` reverse-proxies `:3000` → `127.0.0.1:3010`). Fine for most screens, but the browser will refuse Geolocation on this origin (insecure context).
- **HTTPS via Tailscale Serve**: `https://albertqu.tailfca842.ts.net:8443` (`sudo tailscale serve --bg --https=8443 http://127.0.0.1:3010`, requires "HTTPS Certificates" enabled at [login.tailscale.com/admin/dns](https://login.tailscale.com/admin/dns)). Use this one for the Benchmark tab's location capture.

## Development

### Install Dependencies

```bash
pnpm install
```

### Start Dev Server

```bash
pnpm dev
```

Open [http://localhost:3000/new-cup](http://localhost:3000/new-cup) in your browser.

### Build for Production

```bash
pnpm build
pnpm start
```

### Key Technologies

- **Next.js 16** with App Router
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **shadcn/ui** component library
- **Lucide React** for icons
- **idb** for IndexedDB wrapper
- **next-pwa** for PWA support (configured manually)

## PWA Features

The app is installable on mobile:

- **Manifest**: `/public/manifest.json`
- **Icons**: Placeholder icons in `/public`
- **Service Worker**: Configured via next-pwa
- **Offline**: Sync queue provides limited offline functionality
- **Add to Home Screen**: Native app experience on iOS/Android

To generate real icons:
```bash
# Generate 192x192, 512x512, and maskable icons
# Place in /public/icon-*.png
```

## Testing

### Manual Testing Checklist

- [ ] New Cup: Register different sizes and options
- [ ] Bags: Create, open, and finish bags
- [ ] Waste: Record waste with reasons
- [ ] History: View timeline and test filters
- [ ] Offline: Disable network, verify sync queue, re-enable and check retry
- [ ] Health: Check connection status displays correctly
- [ ] Mobile: Test on actual device or mobile browser

### Mocking the Backend

For development, you can mock API responses:

```bash
# Option 1: Use a local mock server
# Option 2: Mock fetch in browser DevTools
# Option 3: Set up json-server with dummy data
```

## Performance

- ✅ No heavy state libraries (just React hooks)
- ✅ Lazy loaded screens via App Router
- ✅ Health check on app mount (30s interval)
- ✅ Debounced sync queue operations
- ✅ Minimal bundle size

## Future Enhancements

- [ ] Authentication (Better Auth / Supabase Auth)
- [ ] Real backend integration
- [ ] Push notifications for sync status
- [ ] Statistics dashboard (backend-side only)
- [ ] Export data functionality
- [ ] Dark mode toggle (already supported via CSS)
- [ ] Multiple user accounts
- [ ] Collaborative bag sharing

## File Modification Guide

To adapt the app to your backend:

1. **Update API URLs**: Modify `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
2. **Update request/response types**: Edit `/types/index.ts`
3. **Update API services**: Modify `/services/api/*.ts` files
4. **Update endpoint methods**: Change method/path in service calls

All other code (UI, hooks, components) remains unchanged when switching backends.

## Troubleshooting

### API calls return 404
- Check `NEXT_PUBLIC_API_BASE_URL` environment variable
- Ensure backend is running and endpoints exist

### Offline queue doesn't sync
- Check browser DevTools > Application > IndexedDB
- Verify network connectivity
- Check browser console for errors

### PWA won't install
- Serve over HTTPS (required for PWA in production)
- Ensure manifest.json is valid
- Check manifest MIME type is `application/manifest+json`

## License

This project is part of your Coffee Analytics ecosystem. All rights reserved.
