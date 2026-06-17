/**
 * Supabase → domain error-translation adapter (issue #59).
 *
 * Repositories used to hand-roll the translation from Supabase/Postgres errors
 * into domain conditions by string-matching the human-readable message text
 * (`'duplicate key'`, `'Email not confirmed'`, …) and by repeating the
 * `PGRST116`→null check. That is fragile (a wording change silently mis-maps a
 * code), duplicated in every repository, and only verifiable against live
 * Supabase.
 *
 * This module centralizes that recognition into one unit-tested place. It
 * classifies an error into a stable, message-text-independent `kind`; each
 * repository then maps the kind to its own domain error code — because the same
 * DB condition (a unique violation, say) means `TEMPLATE_SLUG_EXISTS` in one
 * table and something else in another, the domain mapping stays per-repository.
 */

/**
 * The shape we read off any Supabase error, whether it originates from PostgREST
 * (data API — carries the Postgres SQLSTATE / PostgREST code in `code`) or from
 * GoTrue (auth — carries an auth code like `email_not_confirmed` in `code`).
 */
interface SupabaseLikeError {
  code?: string | null;
  message?: string | null;
}

/**
 * Stable classification of a Supabase error, decoupled from the volatile
 * message text. Repositories switch on this rather than on `.includes(...)`.
 */
export type SupabaseErrorKind =
  | 'NOT_FOUND' // PostgREST PGRST116 — `.single()` matched no rows
  | 'UNIQUE_VIOLATION' // Postgres SQLSTATE 23505 — duplicate / unique constraint
  | 'EMAIL_NOT_CONFIRMED' // GoTrue: login before email verification
  | 'USER_ALREADY_EXISTS' // GoTrue: signup with an already-registered email
  | 'UNKNOWN';

/** PostgREST code for "`.single()` returned zero rows". */
const PGRST_NOT_FOUND = 'PGRST116';
/** Postgres SQLSTATE for a unique-constraint violation. */
const PG_UNIQUE_VIOLATION = '23505';

function readError(error: unknown): SupabaseLikeError {
  if (error && typeof error === 'object') {
    const e = error as Record<string, unknown>;
    return {
      code: typeof e.code === 'string' ? e.code : null,
      message: typeof e.message === 'string' ? e.message : null,
    };
  }
  return { code: null, message: null };
}

/**
 * Map any Supabase/Postgres error to a stable {@link SupabaseErrorKind}.
 *
 * Prefers the structured `code` (SQLSTATE / PostgREST / GoTrue code) and falls
 * back to message text only where Supabase historically did not populate a code
 * — so older auth responses keep working, but the message match no longer lives
 * scattered across repositories.
 */
export function classifySupabaseError(error: unknown): SupabaseErrorKind {
  const { code, message } = readError(error);

  if (code === PGRST_NOT_FOUND) return 'NOT_FOUND';
  if (code === PG_UNIQUE_VIOLATION) return 'UNIQUE_VIOLATION';

  if (code === 'email_not_confirmed') return 'EMAIL_NOT_CONFIRMED';
  if (code === 'user_already_exists' || code === 'email_exists') {
    return 'USER_ALREADY_EXISTS';
  }

  // Message-text fallbacks for shapes that arrive without a structured code.
  if (message) {
    if (message.includes('Email not confirmed')) return 'EMAIL_NOT_CONFIRMED';
    if (message.includes('duplicate key') || message.includes('unique')) {
      return 'UNIQUE_VIOLATION';
    }
  }

  return 'UNKNOWN';
}

/**
 * Convenience for the pervasive PostgREST `.single()` → null pattern: a missing
 * row is not an error condition the caller cares to distinguish.
 */
export function isNotFoundError(error: unknown): boolean {
  return classifySupabaseError(error) === 'NOT_FOUND';
}
