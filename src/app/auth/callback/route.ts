import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { safeNextPath } from '@/lib/auth/safe-next';

// OAuth (PKCE) callback. Mirrors the inline pattern of /auth/confirm:
// the auth SDK is called directly in the route handler, not via the domain layer.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // User cancelled the consent screen — not an error, return silently.
  if (error === 'access_denied') {
    return NextResponse.redirect(new URL('/login', origin));
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError) {
      const next = safeNextPath(searchParams.get('next'));
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  return NextResponse.redirect(new URL('/login?error=oauth_failed', origin));
}
