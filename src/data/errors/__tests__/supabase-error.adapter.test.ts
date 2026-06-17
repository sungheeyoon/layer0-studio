import { describe, it, expect } from 'vitest';
import {
  classifySupabaseError,
  isNotFoundError,
  type SupabaseErrorKind,
} from '../supabase-error.adapter';

// Representative error shapes, mirroring what the live clients return.
// PostgREST (`@supabase/postgrest-js`) errors carry the Postgres SQLSTATE or a
// PostgREST code in `code`; GoTrue (`@supabase/auth-js`) errors carry an auth
// code like `email_not_confirmed` in `code`.
const postgrestError = (code: string, message = 'pg error') => ({
  message,
  details: '',
  hint: '',
  code,
});
const authError = (code: string | undefined, message: string) => ({
  message,
  status: 400,
  code,
  __isAuthError: true,
});

describe('classifySupabaseError', () => {
  it('classifies a PostgREST PGRST116 (no rows) as NOT_FOUND', () => {
    expect(
      classifySupabaseError(
        postgrestError('PGRST116', 'JSON object requested, multiple (or no) rows returned'),
      ),
    ).toBe('NOT_FOUND');
  });

  it('classifies a Postgres 23505 unique violation as UNIQUE_VIOLATION', () => {
    expect(
      classifySupabaseError(
        postgrestError('23505', 'duplicate key value violates unique constraint "templates_slug_key"'),
      ),
    ).toBe('UNIQUE_VIOLATION');
  });

  it('classifies an email_not_confirmed auth error by code', () => {
    expect(
      classifySupabaseError(authError('email_not_confirmed', 'Email not confirmed')),
    ).toBe('EMAIL_NOT_CONFIRMED');
  });

  it('classifies user_already_exists / email_exists auth errors as USER_ALREADY_EXISTS', () => {
    expect(classifySupabaseError(authError('user_already_exists', 'User already registered'))).toBe(
      'USER_ALREADY_EXISTS',
    );
    expect(classifySupabaseError(authError('email_exists', 'Email already registered'))).toBe(
      'USER_ALREADY_EXISTS',
    );
  });

  it('falls back to message text when no structured code is present', () => {
    // Older GoTrue responses surfaced this only in the message.
    expect(classifySupabaseError(authError(undefined, 'Email not confirmed'))).toBe(
      'EMAIL_NOT_CONFIRMED',
    );
    expect(
      classifySupabaseError({ message: 'duplicate key value violates unique constraint' }),
    ).toBe('UNIQUE_VIOLATION');
    expect(classifySupabaseError({ message: 'value must be unique' })).toBe('UNIQUE_VIOLATION');
  });

  it('returns UNKNOWN for unrecognized, empty, and non-object errors', () => {
    const unknownCases: unknown[] = [
      postgrestError('42501', 'permission denied'),
      authError('invalid_credentials', 'Invalid login credentials'),
      { message: 'something unexpected happened' },
      {},
      null,
      undefined,
      'a bare string',
    ];
    for (const e of unknownCases) {
      expect<SupabaseErrorKind>(classifySupabaseError(e)).toBe('UNKNOWN');
    }
  });
});

describe('isNotFoundError', () => {
  it('is true only for the PGRST116 not-found case', () => {
    expect(isNotFoundError(postgrestError('PGRST116'))).toBe(true);
    expect(isNotFoundError(postgrestError('23505'))).toBe(false);
    expect(isNotFoundError(null)).toBe(false);
  });
});
