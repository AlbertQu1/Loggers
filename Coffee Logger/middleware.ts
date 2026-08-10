import { NextRequest, NextResponse } from 'next/server'

// Tailscale's CGNAT range (100.64.0.0/10), distinct from the home LAN
// (192.168.0.0/24). Requests arriving through this range are coming from
// outside the house, where logging a cup doesn't make sense.
function isFromTailscale(ip: string): boolean {
  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some(Number.isNaN)) return false
  return parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isApi = pathname.startsWith('/api/cups')
  const isPage = pathname.startsWith('/new-cup')

  if (!isApi && !isPage) {
    return NextResponse.next()
  }

  const forwardedFor = request.headers.get('x-forwarded-for')
  const ip = forwardedFor?.split(',')[0]?.trim()

  if (ip && isFromTailscale(ip)) {
    if (isApi) {
      return NextResponse.json(
        { success: false, error: 'Cup logging is disabled away from home' },
        { status: 403 }
      )
    }
    return NextResponse.redirect(new URL('/bags', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/new-cup/:path*', '/api/cups/:path*'],
}
