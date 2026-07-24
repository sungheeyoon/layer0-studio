import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseTemplateRepositoryImpl } from '@/data/repositories/supabase-template.repository.impl';
import { ListTemplatesUseCase } from '@/domain/usecases/template/list-templates.usecase';
import { GetTemplateUseCase } from '@/domain/usecases/template/get-template.usecase';

export const createListTemplatesUseCase = (supabase: SupabaseClient) => {
  const repository = new SupabaseTemplateRepositoryImpl(supabase);
  return new ListTemplatesUseCase(repository);
};

export const createGetTemplateUseCase = (supabase: SupabaseClient) => {
  const repository = new SupabaseTemplateRepositoryImpl(supabase);
  return new GetTemplateUseCase(repository);
};
