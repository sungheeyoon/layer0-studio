import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  // Expose the requested path (incl. query) so server layouts can read it via
  // headers() — used by the auth guard to build /login?next=<original-path>.
  const pathWithQuery = request.nextUrl.pathname + request.nextUrl.search;
  const withPathname = () => {
    const headers = new Headers(request.headers);
    headers.set('x-pathname', pathWithQuery);
    return NextResponse.next({ request: { headers } });
  };

  let supabaseResponse = withPathname();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = withPathname();
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do not add logic between createServerClient and getUser().
  // Any mistake here causes random session loss that is hard to debug.
  await supabase.auth.getUser();

  return supabaseResponse;
}
