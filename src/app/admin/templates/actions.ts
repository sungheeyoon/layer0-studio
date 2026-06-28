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
import type { User } from '@supabase/supabase-js';

// ADR-0012 §5: changing a template's live `status` (publish / takedown /
// archive) is the genuine human decision and is gated by `canPublishTemplates`
// — separate from the admin role (ADR-0006). Registration is automated now, so
// this capability no longer guards "Apply Sync"; it guards the live toggles.
const PUBLISH_GUARD_ERROR = 'UNAUTHORIZED_TO_PUBLISH';

function lacksPublishRight(user: User): boolean {
  return user.app_metadata?.canPublishTemplates !== true;
}

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

    // Creating a directly-public template is a publish decision (ADR-0012 §5);
    // a `draft` create stays open to any admin.
    if (status === 'active' && lacksPublishRight(user)) {
      return { error: PUBLISH_GUARD_ERROR };
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
  return withAdmin(async ({ user, adminSupabase }) => {
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

    // Publishing (→active) and explicit takedown (→archived) are the gated
    // decisions (ADR-0012 §5). Saving as `draft` (content edit / hide) stays
    // open to any admin — it can never expose unfinished work to users.
    if ((status === 'active' || status === 'archived') && lacksPublishRight(user)) {
      return { error: PUBLISH_GUARD_ERROR };
    }

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
  return withAdmin(async ({ user, adminSupabase }) => {
    if (lacksPublishRight(user)) return { error: PUBLISH_GUARD_ERROR };
    const useCase = createUpdateTemplateUseCase(adminSupabase);
    await useCase.execute(id, { status: 'archived' });

    revalidatePath('/admin/templates');
    return { success: true as const };
  });
}

export async function activateTemplateAction(id: string) {
  return withAdmin(async ({ user, adminSupabase }) => {
    if (lacksPublishRight(user)) return { error: PUBLISH_GUARD_ERROR };
    const useCase = createUpdateTemplateUseCase(adminSupabase);
    await useCase.execute(id, { status: 'active' });

    revalidatePath('/admin/templates');
    return { success: true as const };
  });
}

export async function revertToDraftAction(id: string) {
  return withAdmin(async ({ user, adminSupabase }) => {
    if (lacksPublishRight(user)) return { error: PUBLISH_GUARD_ERROR };
    const useCase = createUpdateTemplateUseCase(adminSupabase);
    await useCase.execute(id, { status: 'draft' });

    revalidatePath('/admin/templates');
    return { success: true as const };
  });
}

export async function syncTemplatesAction(dryRun: boolean) {
  return withAdmin(async ({ user, adminSupabase }) => {
    // Registration is automated post-deploy now (ADR-0012); this manual sync is
    // the emergency "force re-register" escape hatch (e.g. the webhook failed).
    // Still gated by canPublishTemplates for any real apply.
    if (!dryRun && lacksPublishRight(user)) {
      return { error: PUBLISH_GUARD_ERROR };
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

