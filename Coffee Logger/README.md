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
