'use server';

import { createClient } from '@/utils/supabase/server';
import {
  createListTemplatesUseCase,
  createCreateSiteFromTemplateUseCase,
  createListUserSitesUseCase,
} from '@/lib/di/container';
import { TemplateError } from '@/domain/errors/template.error';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { updateSiteDomainAction } from '../editor/actions';

export async function listActiveTemplatesAction() {
  const supabase = await createClient();
  const useCase = createListTemplatesUseCase(supabase);
  return useCase.executeActive();
}

export async function listCategoriesAction(): Promise<string[]> {
  const supabase = await createClient();
  const useCase = createListTemplatesUseCase(supabase);
  return useCase.executeCategories();
}

export async function listPaginatedTemplatesAction(page: number, limit: number = 6, category?: string | null) {
  const supabase = await createClient();
  const useCase = createListTemplatesUseCase(supabase);
  return useCase.executePaginated(page, limit, category);
}

export async function listMySitesAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const useCase = createListUserSitesUseCase(supabase);
  return useCase.execute(user.id);
}

export async function selectTemplateAction(templateId: string, siteName: string, urlSlug?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'UNAUTHORIZED' };
  }

  try {
    const useCase = createCreateSiteFromTemplateUseCase(supabase);
    const site = await useCase.execute({
      userId: user.id,
      templateId,
      siteName,
    });

    if (urlSlug) {
      const domainResult = await updateSiteDomainAction(site.id, urlSlug);
      // Domain errors here shouldn't stop the project creation, 
      // but maybe we could handle them. For now, we proceed.
    }

    revalidatePath('/templates');
    redirect(`/editor?siteId=${site.id}`);
  } catch (err) {
    if (err instanceof TemplateError) {
      return { error: err.code };
    }
    // redirect throws a special Next.js error, rethrow it
    throw err;
  }
}
