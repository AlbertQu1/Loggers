# Coffee Logger - Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Create or update `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

Change `http://localhost:3001` to your actual backend API URL.

### 3. Start Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`.

### 4. Open in Browser

- Desktop: http://localhost:3000/new-cup
- Mobile: Access from your phone at `http://<your-ip>:3000`

## Testing Without a Backend

To test the UI without a real backend, you have several options:

### Option A: Mock API in Browser

Use Chrome DevTools to mock responses:

1. Open DevTools (F12)
2. Go to Network tab
3. Right-click → Block URL Pattern
4. Create mock responses in console

### Option B: Local Mock Server

```bash
# Install json-server
npm install -g json-server

# Create db.json with mock data
cat > db.json << 'EOF'
{
  "health": { "status": "connected" },
  "bags": [],
  "cups": [],
  "waste": [],
  "history": []
}
EOF

# Start mock server on port 3001
json-server --port 3001 db.json
```

Then update `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### Option C: Next.js API Routes (Quick Testing)

Create `app/api/[...route]/route.ts` to mock endpoints:

```typescript
export async function POST(request: Request) {
  const path = request.url.split('/api/')[1];
  
  if (path.startsWith('cups')) {
    return Response.json({ 
      success: true, 
      data: { id: 'mock-id', size: 'espresso' } 
    });
  }
  
  return Response.json({ success: false, error: 'Not implemented' });
}
```

## API Response Format

All endpoints should return this format:

```typescript
{
  "success": true,
  "data": { /* response data */ }
}

// or on error:
{
  "success": false,
  "error": "error message"
}
```

## Building for Production

### Build

```bash
pnpm build
```

### Start Production Server

```bash
pnpm start
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Mobile Installation (PWA)

After deploying to production:

1. Open the app in a mobile browser
2. Tap the menu icon (... or ⋮)
3. Select "Install app" or "Add to Home Screen"
4. The app will work offline with the sync queue

## Environment Variables Reference

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | `https://api.example.com` | The REST API base URL |

Note: `NEXT_PUBLIC_*` variables are exposed to the browser. Never put secrets here.

## Development Tips

### Hot Reload
Changes to files automatically reload the browser.

### Console Logs
Search for `[v0]` to find debug statements in browser console.

### TypeScript
Ensure types are correct:
```bash
# Check for type errors
pnpm tsc --noEmit
```

### Tailwind CSS
All styling uses Tailwind utility classes. Tailwind v4 is configured in `app/globals.css`.

### Adding New Pages

1. Create a new directory under `/app` (e.g., `/app/settings`)
2. Create `page.tsx` in that directory
3. Export a default component
4. Automatically routable at `/settings`

### Adding New API Endpoints

1. Create a new file in `/services/api` (e.g., `profile.ts`)
2. Implement typed functions
3. Import in components
4. All calls go through this service layer

## Debugging Offline Sync Queue

Open browser DevTools:

1. **IndexedDB**: Application → Storage → IndexedDB → coffee-logger-db
2. **Sync Queue Items**: Click on `syncQueue` object store
3. **Check Status**: Look for items with `status: 'pending'`
4. **Delete All**: Right-click → Delete Database (if needed)

## Common Issues

### API 404 Errors
- Check `NEXT_PUBLIC_API_BASE_URL` is correct
- Verify your backend is running
- Check CORS headers if backend is on different domain

### Offline Queue Not Syncing
- Check IndexedDB in DevTools
- Verify network is actually online
- Check browser console for errors
- Try manual sync via Health Indicator

### Build Errors
- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && pnpm install`
- Check TypeScript: `pnpm tsc --noEmit`

### PWA Won't Install
- Must be served over HTTPS (or localhost for testing)
- Manifest must be valid JSON
- Check `app/layout.tsx` has proper PWA meta tags

## Next Steps

1. **Connect Your Backend**: Update `.env.local` with your API URL
2. **Test Each Screen**: Register cups, manage bags, record waste
3. **Monitor Sync Queue**: Disable network, make requests, re-enable to test offline
4. **Deploy**: Use Vercel or your hosting platform
5. **Install on Mobile**: Add to home screen for native experience

## Support

For detailed architecture information, see `README.md`.
For PRD requirements, check the original PRD document.

Good luck! ☕
