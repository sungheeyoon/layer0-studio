import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseTemplateRepositoryImpl } from '@/data/repositories/supabase-template.repository.impl';
import { DeleteTemplateUseCase } from '@/domain/usecases/template/delete-template.usecase';

export const createDeleteTemplateUseCase = (supabase: SupabaseClient) => {
  const repository = new SupabaseTemplateRepositoryImpl(supabase);
  return new DeleteTemplateUseCase(repository);
};
