'use server';

import { createClient } from '@/utils/supabase/server';
import {
  createListTemplatesUseCase,
  createCreateSiteFromTemplateUseCase,
  createListUserSitesUseCase,
  createSiteWriteUseCase,
  createDeleteUserSiteUseCase,
} from '@/lib/di/container';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { withUser } from '@/lib/actions/server-action';

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
  return withUser(async (user, supabase) => {
    const useCase = createCreateSiteFromTemplateUseCase(supabase);
    const site = await useCase.execute({
      userId: user.id,
      templateId,
      siteName,
    });

    if (urlSlug) {
      try {
        const siteWrite = createSiteWriteUseCase(supabase);
        await siteWrite.setDomain(site.id, user.id, urlSlug, site.updatedAt);
      } catch (domainErr) {
        // Roll back the just-created site, then let withUser map the cause.
        const deleteUseCase = createDeleteUserSiteUseCase(supabase);
        await deleteUseCase.execute(site.id, user.id);
        throw domainErr;
      }
    }

    revalidatePath('/templates');
    redirect(`/dashboard/editor?siteId=${site.id}`);
  });
}
