import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // static files (favicon, images, etc.)
  ) {
    return NextResponse.next();
  }

  let correctedPath = pathname;
  let needsRedirect = false;

  // Lowercase enforcement
  if (correctedPath !== correctedPath.toLowerCase()) {
    correctedPath = correctedPath.toLowerCase();
    needsRedirect = true;
  }

  // Trailing slash removal (except root)
  if (correctedPath.length > 1 && correctedPath.endsWith('/')) {
    correctedPath = correctedPath.replace(/\/+$/, '');
    needsRedirect = true;
  }

  if (needsRedirect) {
    const url = request.nextUrl.clone();
    url.pathname = correctedPath;
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
