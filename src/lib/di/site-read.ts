import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseUserSiteRepositoryImpl } from '@/data/repositories/supabase-user-site.repository.impl';
import { ListUserSitesUseCase } from '@/domain/usecases/user-site/list-user-sites.usecase';
import { GetUserSiteUseCase } from '@/domain/usecases/user-site/get-user-site.usecase';
import { GetPublishedSiteUseCase } from '@/domain/usecases/user-site/get-published-site.usecase';

export const createListUserSitesUseCase = (supabase: SupabaseClient) => {
  const repository = new SupabaseUserSiteRepositoryImpl(supabase);
  return new ListUserSitesUseCase(repository);
};

export const createGetUserSiteUseCase = (supabase: SupabaseClient) => {
  const repository = new SupabaseUserSiteRepositoryImpl(supabase);
  return new GetUserSiteUseCase(repository);
};

export const createGetPublishedSiteUseCase = (supabase: SupabaseClient) => {
  const repository = new SupabaseUserSiteRepositoryImpl(supabase);
  return new GetPublishedSiteUseCase(repository);
};
