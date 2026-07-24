import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseTemplateRepositoryImpl } from '@/data/repositories/supabase-template.repository.impl';
import { SupabaseUserSiteRepositoryImpl } from '@/data/repositories/supabase-user-site.repository.impl';
import { CreateSiteFromTemplateUseCase } from '@/domain/usecases/user-site/create-site-from-template.usecase';
import { DeleteUserSiteUseCase } from '@/domain/usecases/user-site/delete-user-site.usecase';
import { AdminUpdateSiteUseCase } from '@/domain/usecases/user-site/admin-update-site.usecase';

export const createCreateSiteFromTemplateUseCase = (supabase: SupabaseClient) => {
  const templateRepo = new SupabaseTemplateRepositoryImpl(supabase);
  const userSiteRepo = new SupabaseUserSiteRepositoryImpl(supabase);
  return new CreateSiteFromTemplateUseCase(templateRepo, userSiteRepo);
};

export const createDeleteUserSiteUseCase = (supabase: SupabaseClient) => {
  const repository = new SupabaseUserSiteRepositoryImpl(supabase);
  return new DeleteUserSiteUseCase(repository);
};

export const createAdminUpdateSiteUseCase = (supabase: SupabaseClient) => {
  const repository = new SupabaseUserSiteRepositoryImpl(supabase);
  return new AdminUpdateSiteUseCase(repository);
};
