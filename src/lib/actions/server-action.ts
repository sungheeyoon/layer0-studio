import type { User } from '@supabase/supabase-js';
import { unstable_rethrow } from 'next/navigation';
import { createClient, createAdminClient } from '@/utils/supabase/server';
import { TemplateError } from '@/domain/errors/template.error';
import { AuthError } from '@/domain/errors/auth.error';
import { AssetValidationError } from '@/domain/entities/asset.entity';

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;
type SupabaseAdminClient = Awaited<ReturnType<typeof createAdminClient>>;

/**
 * The uniform failure shape every Server Action returns. Success results carry
 * their own `{ success: true, ... }` payload; failures are always `{ error }`,
 * where `error` is a stable domain code the client maps to a message via
 * `src/lib/errors/messages.ts`. Callers discriminate with `'error' in result`.
 */
export type ActionError = { error: string };

export type ActionResult<T> = T | ActionError;

/**
 * The single place the action layer turns a thrown error into a client code.
 * Built on the domain error types (and #59's adapter, which is what produces
 * those domain errors in the data layer), so action and data layers agree on
 * the vocabulary. New error types or request-logging get added here once.
 *
 * Next.js control-flow signals (`redirect()` / `notFound()`) are re-thrown
 * untouched via `unstable_rethrow` so wrapping an action that redirects keeps
 * working.
 */
export function toActionError(err: unknown): ActionError {
  unstable_rethrow(err);

  if (err instanceof TemplateError) {
    if (err.issues?.length) {
      console.warn(
        '[action] %s: %s',
        err.code,
        err.issues.map((i) => `[${i.code}] ${i.path ?? ''}`).join(', '),
      );
    }
    return { error: err.code };
  }
  if (err instanceof AuthError) {
    return { error: err.code };
  }
  if (err instanceof AssetValidationError) {
    return { error: err.message };
  }

  console.error('[action] unexpected error:', err);
  return { error: 'UNKNOWN' };
}

/**
 * Runs `handler` and funnels any throw through {@link toActionError}. The base
 * seam for actions that don't need an authenticated user (e.g. login/signup,
 * which establish the session rather than assume one).
 */
export async function withAction<T>(handler: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return await handler();
  } catch (err) {
    return toActionError(err);
  }
}

/**
 * Resolves the current user, short-circuiting with `{ error: 'UNAUTHORIZED' }`
 * when there is none, then runs `handler` through the shared error mapping.
 */
export async function withUser<T>(
  handler: (user: User, supabase: SupabaseServerClient) => Promise<T>,
): Promise<ActionResult<T>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'UNAUTHORIZED' };
  try {
    return await handler(user, supabase);
  } catch (err) {
    return toActionError(err);
  }
}

/**
 * Resolves the current user and requires the `admin` role, short-circuiting
 * with `{ error: 'FORBIDDEN' }` otherwise. Hands the handler a service-role
 * client (`adminSupabase`) since admin actions bypass RLS by design.
 */
export async function withAdmin<T>(
  handler: (ctx: { user: User; adminSupabase: SupabaseAdminClient }) => Promise<T>,
): Promise<ActionResult<T>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== 'admin') {
    return { error: 'FORBIDDEN' };
  }
  const adminSupabase = await createAdminClient();
  try {
    return await handler({ user, adminSupabase });
  } catch (err) {
    return toActionError(err);
  }
}
