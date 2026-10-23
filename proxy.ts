import { NextRequest, NextResponse } from 'next/server'
import { SITE_ALIASES, SITE_INDEXABLE, SITE_URL } from './src/lib/site-config'

export function proxy(request: NextRequest) {
  if (!SITE_INDEXABLE) return NextResponse.next()

  const requestHost = request.nextUrl.hostname.toLowerCase()
  const canonicalHost = SITE_URL.hostname.toLowerCase()
  if (SITE_ALIASES.includes(requestHost as (typeof SITE_ALIASES)[number]) && requestHost !== canonicalHost) {
    const destination = request.nextUrl.clone()
    destination.protocol = SITE_URL.protocol
    destination.host = SITE_URL.host
    return NextResponse.redirect(destination, 308)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
