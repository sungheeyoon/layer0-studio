import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseUserSiteRepositoryImpl } from '@/data/repositories/supabase-user-site.repository.impl';
import { SiteWriteUseCase } from '@/domain/usecases/user-site/site-write.usecase';
import { LibraryAwareSiteContentValidator } from '@/lib/template/site-content-validator';

const siteContentValidator = new LibraryAwareSiteContentValidator();

export const createSiteWriteUseCase = (supabase: SupabaseClient) => {
  const repository = new SupabaseUserSiteRepositoryImpl(supabase);
  return new SiteWriteUseCase(repository, siteContentValidator);
};
