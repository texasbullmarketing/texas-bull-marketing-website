import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Ensure the marketing homepage (public/index.html) is served at /
// even when app/page.tsx exists. beforeFiles rewrites alone can be
// inconsistent across Next versions; middleware makes it reliable.
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/') {
    return NextResponse.rewrite(new URL('/index.html', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: '/',
}
