import { cache } from 'react';
import { createClient } from '@/utils/supabase/server';
import { createListUserSitesUseCase } from '@/lib/di/site-read';

export const getCurrentUserSites = cache(async (userId: string) => {
  const supabase = await createClient();
  const useCase = createListUserSitesUseCase(supabase);
  return useCase.execute(userId);
});
