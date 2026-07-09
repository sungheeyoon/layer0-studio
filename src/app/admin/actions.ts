'use server';

import {
  createListUserSitesUseCase,
  createCreateSiteFromTemplateUseCase,
  createDeleteUserSiteUseCase,
  createAdminUpdateSiteUseCase,
} from '@/lib/di/container';
import { ContentModel } from '@/domain/entities/template.entity';
import { revalidatePath } from 'next/cache';
import { withAdmin } from '@/lib/actions/server-action';

export async function listAllSitesAction() {
  return withAdmin(async ({ adminSupabase }) => {
    const useCase = createListUserSitesUseCase(adminSupabase);
    return await useCase.executeAll();
  });
}

export async function createCustomSiteAction(
  userId: string,
  siteName: string,
  siteJson: ContentModel,
  domain?: string,
) {
  return withAdmin(async ({ adminSupabase }) => {
    const useCase = createCreateSiteFromTemplateUseCase(adminSupabase);
    const site = await useCase.executeCustom({
      userId,
      siteName,
      content: siteJson,
      domain,
    });

    revalidatePath('/admin');
    return { success: true as const, site };
  });
}

export async function updateSiteStatusAction(siteId: string, status: 'draft' | 'active' | 'suspended') {
  return withAdmin(async ({ adminSupabase }) => {
    const useCase = createAdminUpdateSiteUseCase(adminSupabase);
    await useCase.updateStatus(siteId, status);

    revalidatePath('/admin');
    return { success: true as const };
  });
}

export async function adminUpdateSiteDomainAction(siteId: string, domain: string) {
  return withAdmin(async ({ adminSupabase }) => {
    const useCase = createAdminUpdateSiteUseCase(adminSupabase);
    await useCase.updateDomain(siteId, domain);

    revalidatePath('/admin');
    return { success: true as const };
  });
}

export async function terminateSiteAction(siteId: string) {
  return withAdmin(async ({ adminSupabase }) => {
    const useCase = createDeleteUserSiteUseCase(adminSupabase);
    await useCase.executeAsAdmin(siteId);

    revalidatePath('/admin');
    return { success: true as const };
  });
}
