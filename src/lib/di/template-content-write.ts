import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseTemplateRepositoryImpl } from '@/data/repositories/supabase-template.repository.impl';
import { CreateTemplateUseCase } from '@/domain/usecases/template/create-template.usecase';
import { UpdateTemplateUseCase } from '@/domain/usecases/template/update-template.usecase';
import { LibraryAwareSiteContentValidator } from '@/lib/template/site-content-validator';

const siteContentValidator = new LibraryAwareSiteContentValidator();

export const createCreateTemplateUseCase = (supabase: SupabaseClient) => {
  const repository = new SupabaseTemplateRepositoryImpl(supabase);
  return new CreateTemplateUseCase(repository, siteContentValidator);
};

export const createUpdateTemplateUseCase = (supabase: SupabaseClient) => {
  const repository = new SupabaseTemplateRepositoryImpl(supabase);
  return new UpdateTemplateUseCase(repository, siteContentValidator);
};
