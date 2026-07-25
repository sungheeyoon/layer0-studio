import { cache } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';

// React `cache()` dedupes within a single request: layout + page calling
// getCurrentUser() in the same render only hits Supabase Auth once.
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});

/**
 * True once `app_metadata.deletedAt` is set — the commit-point lock an
 * in-flight Account Erasure sets immediately, before the (possibly slower)
 * storage drain / auth-principal delete steps run (ADR-0014). A session that
 * reads this as true must be treated as unauthenticated everywhere.
 */
export function isAccountErased(user: User): boolean {
  return Boolean(user.app_metadata?.deletedAt);
}
