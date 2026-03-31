import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './src/lib/auth';

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;

  // 1. Define clearly what is private/protected
  const isProtectedRoute = 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/pt') || 
    pathname.startsWith('/client');

  // 2. Handle Public Routes (Root, Login, Unauthorized, API, Static Assets)
  if (!isProtectedRoute) {
    // If user is already logged in and visits Root or Login, redirect to their dashboard
    if ((pathname === '/' || pathname === '/login') && token) {
      const payload = await verifyToken(token);
      if (payload) {
        if (payload.role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', req.url));
        if (payload.role === 'pt') return NextResponse.redirect(new URL('/pt/today', req.url));
        if (payload.role === 'client') return NextResponse.redirect(new URL('/client/home', req.url));
      }
    }
    // Otherwise, just let them see the public page (Landing Page, etc.)
    return NextResponse.next();
  }

  // 3. Handle Protected Routes
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const payload = await verifyToken(token);

  if (!payload) {
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.cookies.delete('token');
    return response;
  }

  // Role based protection for private routes
  if (pathname.startsWith('/admin')) {
    // Allow PTs to view specific client profiles if needed, otherwise strict admin
    if (pathname.startsWith('/admin/clients/') && payload.role === 'pt') {
      // Permission granted
    } else if (payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  if (pathname.startsWith('/pt') && !['pt', 'admin'].includes(payload.role)) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  if (pathname.startsWith('/client') && payload.role !== 'client') {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Broad matcher that excludes known static file patterns
  // This helps ensure /, /login, and other root routes are processed
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|icons|manifest.json|sw.js|.*\\..*).*)'],
};
