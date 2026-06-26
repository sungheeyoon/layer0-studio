import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';
import { subdomainFor } from '@/lib/subdomain';

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'localhost:3000';

// Platform paths that must never resolve on a read-only Site subdomain.
// `_next/static` / `_next/image` / images / favicon are already excluded by the
// matcher below, so they pass through untouched.
const PLATFORM_PREFIXES = ['/api', '/_next', '/dashboard', '/admin', '/login', '/preview'];

function isPlatformPath(pathname: string): boolean {
  return PLATFORM_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  const result = subdomainFor(host, ROOT_DOMAIN);
  const { pathname } = request.nextUrl;

  if (result.kind === 'site') {
    // Read-only public origin: no session, internal rewrite to the shared
    // /site/[domain] renderer. Platform paths have no place here → 404.
    if (isPlatformPath(pathname)) {
      return new NextResponse(null, { status: 404 });
    }
    const url = request.nextUrl.clone();
    url.pathname = `/site/${result.label}${pathname === '/' ? '' : pathname}`;
    return NextResponse.rewrite(url);
  }

  // apex / www / localhost / unknown host → normal session refresh. The
  // /site/* path is an internal rewrite target only — not a public entry point.
  if (pathname === '/site' || pathname.startsWith('/site/')) {
    return new NextResponse(null, { status: 404 });
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
