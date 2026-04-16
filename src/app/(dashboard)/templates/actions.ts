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

export async function listActiveTemplatesAction() {
  const supabase = await createClient();
  const useCase = createListTemplatesUseCase(supabase);
  return useCase.executeActive();
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

export async function selectTemplateAction(templateId: string, siteName: string) {
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

    revalidatePath('/templates');
    redirect(`/editor?siteId=${site.id}`);
  } catch (err) {
    if (err instanceof TemplateError) {
      return { error: err.code };
    }
    // redirect throws a special Next.js error — rethrow it
    throw err;
  }
}
