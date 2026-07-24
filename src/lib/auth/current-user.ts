import { cache } from 'react';
import { createClient } from '@/utils/supabase/server';

// React `cache()` dedupes within a single request: layout + page calling
// getCurrentUser() in the same render only hits Supabase Auth once.
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});
