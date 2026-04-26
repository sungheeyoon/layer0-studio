import { cache } from 'react';
import { createClient } from '@/utils/supabase/server';
import { createListUserSitesUseCase } from '@/lib/di/container';

// React `cache()` dedupes within a single request: layout + page calling
// getCurrentUser() in the same render only hits Supabase Auth once.
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});

export const getCurrentUserSites = cache(async (userId: string) => {
  const supabase = await createClient();
  const useCase = createListUserSitesUseCase(supabase);
  return useCase.execute(userId);
});
