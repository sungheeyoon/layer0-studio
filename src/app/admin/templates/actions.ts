'use server';

import {
  createListTemplatesUseCase,
  createGetTemplateUseCase,
  createCreateTemplateUseCase,
  createUpdateTemplateUseCase,
  createDeleteTemplateUseCase,
} from '@/lib/di/container';
import { TemplateJson } from '@/domain/entities/template.entity';
import { revalidatePath } from 'next/cache';
import { syncTemplates } from '@/lib/template/sync';
import { withAdmin } from '@/lib/actions/server-action';

// --- Thumbnail Upload --------------------------------------------------------

export async function uploadThumbnailAction(formData: FormData) {
  return withAdmin(async ({ adminSupabase }) => {
    const file = formData.get('file') as File;
    if (!file || file.size === 0) return { error: 'NO_FILE' };

    const ext = file.name.split('.').pop() ?? 'jpg';
    const fileName = `${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await adminSupabase.storage
      .from('template-thumbnails')
      .upload(fileName, file, { contentType: file.type, upsert: false });

    if (uploadError) return { error: uploadError.message };

    const { data } = adminSupabase.storage
      .from('template-thumbnails')
      .getPublicUrl(fileName);

    return { url: data.publicUrl };
  });
}

export async function listTemplatesAction() {
  return withAdmin(async ({ adminSupabase }) => {
    const useCase = createListTemplatesUseCase(adminSupabase);
    return useCase.execute();
  });
}

export async function getTemplateAction(id: string) {
  return withAdmin(async ({ adminSupabase }) => {
    const useCase = createGetTemplateUseCase(adminSupabase);
    return useCase.execute(id);
  });
}

export async function createTemplateAction(formData: FormData) {
  return withAdmin(async ({ user, adminSupabase }) => {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const slug = formData.get('slug') as string;
    const category = formData.get('category') as string;
    const status = (formData.get('status') as string) || 'draft';
    const thumbnailUrl = formData.get('thumbnailUrl') as string;
    const templateJsonStr = formData.get('templateJson') as string;

    // Parse JSON
    let templateJson: TemplateJson;
    try {
      templateJson = JSON.parse(templateJsonStr);
    } catch {
      return { error: 'INVALID_TEMPLATE_JSON' };
    }

    const useCase = createCreateTemplateUseCase(adminSupabase);
    const template = await useCase.execute({
      name,
      description: description || null,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      category: category || 'general',
      status: status as 'draft' | 'active' | 'archived',
      thumbnailUrl: thumbnailUrl || null,
      templateJson,
      version: '1.0.0',
      createdBy: user.id,
    });

    revalidatePath('/admin/templates');
    return { success: true as const, template };
  });
}

export async function updateTemplateAction(formData: FormData) {
  return withAdmin(async ({ adminSupabase }) => {
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const slug = formData.get('slug') as string;
    const category = formData.get('category') as string;
    const status = formData.get('status') as string;
    const thumbnailUrl = formData.get('thumbnailUrl') as string;
    const templateJsonStr = formData.get('templateJson') as string;

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (description !== null) updateData.description = description;
    if (slug) updateData.slug = slug;
    if (category) updateData.category = category;
    if (status) updateData.status = status;
    if (thumbnailUrl !== null) updateData.thumbnailUrl = thumbnailUrl;

    if (templateJsonStr) {
      try {
        updateData.templateJson = JSON.parse(templateJsonStr);
      } catch {
        return { error: 'INVALID_TEMPLATE_JSON' };
      }
    }

    const useCase = createUpdateTemplateUseCase(adminSupabase);
    const template = await useCase.execute(id, updateData);

    revalidatePath('/admin/templates');
    return { success: true as const, template };
  });
}

export async function deleteTemplateAction(id: string) {
  return withAdmin(async ({ adminSupabase }) => {
    const useCase = createDeleteTemplateUseCase(adminSupabase);
    await useCase.execute(id);

    revalidatePath('/admin/templates');
    return { success: true as const };
  });
}

export async function archiveTemplateAction(id: string) {
  return withAdmin(async ({ adminSupabase }) => {
    const useCase = createUpdateTemplateUseCase(adminSupabase);
    await useCase.execute(id, { status: 'archived' });

    revalidatePath('/admin/templates');
    return { success: true as const };
  });
}

export async function revertToDraftAction(id: string) {
  return withAdmin(async ({ adminSupabase }) => {
    const useCase = createUpdateTemplateUseCase(adminSupabase);
    await useCase.execute(id, { status: 'draft' });

    revalidatePath('/admin/templates');
    return { success: true as const };
  });
}

export async function syncTemplatesAction(dryRun: boolean) {
  return withAdmin(async ({ user, adminSupabase }) => {
    // For real apply, check canPublishTemplates (separate from the admin role).
    if (!dryRun && user.app_metadata?.canPublishTemplates !== true) {
      return { error: 'UNAUTHORIZED_TO_APPLY_SYNC' };
    }

    // syncTemplates surfaces its own failure messages verbatim to the admin UI,
    // so keep a local catch rather than collapsing them to a domain code.
    try {
      const summary = await syncTemplates(adminSupabase, {
        dryRun,
        performedBy: user.id,
      });

      if (!dryRun) {
        revalidatePath('/admin/templates');
      }

      return { success: true as const, summary };
    } catch (err: unknown) {
      console.error('syncTemplatesAction error:', err);
      return { error: err instanceof Error ? err.message : 'UNKNOWN' };
    }
  });
}

