import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;

  // Paths that don't need auth
  if (pathname === '/login' || pathname === '/unauthorized' || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    if (pathname === '/login' && token) {
      const payload = await verifyToken(token);
      if (payload) {
        if (payload.role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', req.url));
        if (payload.role === 'pt') return NextResponse.redirect(new URL('/pt/today', req.url));
        if (payload.role === 'client') return NextResponse.redirect(new URL('/client/home', req.url));
      }
    }
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const payload = await verifyToken(token);

  if (!payload) {
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.cookies.delete('token');
    return response;
  }

  // Role based protection
  if (pathname.startsWith('/admin')) {
    // Allow PTs to view client profiles
    if (pathname.startsWith('/admin/clients/') && payload.role === 'pt') {
      // PT allowed
    } else if (payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  if (pathname.startsWith('/pt') && !['pt', 'admin'].includes(payload.role)) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  if (pathname.startsWith('/client') && payload.role !== 'client') {
     // Admin/PT can access /client? Maybe no, client only
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
