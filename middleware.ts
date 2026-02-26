import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Appwrite stores session cookies - check for any session cookie
  const cookies = request.cookies.getAll();
  const hasSession = cookies.some((c) => c.name.startsWith('a_session_'));

  const { pathname } = request.nextUrl;
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isApiRoute = pathname.startsWith('/api');
  const isStaticFile = pathname.startsWith('/_next');

  // Skip API routes and static files
  if (isApiRoute || isStaticFile) return NextResponse.next();

  // Redirect authenticated users away from auth pages
  if (hasSession && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Redirect unauthenticated users to login (except auth pages)
  if (!hasSession && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
