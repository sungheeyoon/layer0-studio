'use server';

import { createClient, createAdminClient } from '@/utils/supabase/server';
import {
  createListTemplatesUseCase,
  createGetTemplateUseCase,
  createCreateTemplateUseCase,
  createUpdateTemplateUseCase,
  createDeleteTemplateUseCase,
} from '@/lib/di/container';
import { TemplateJson } from '@/domain/entities/template.entity';
import { TemplateError } from '@/domain/errors/template.error';
import { revalidatePath } from 'next/cache';

async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || user.app_metadata?.role !== 'admin') {
    return null;
  }
  return user;
}

// --- Thumbnail Upload --------------------------------------------------------

export async function uploadThumbnailAction(formData: FormData) {
  const user = await checkAdmin();
  if (!user) return { error: 'FORBIDDEN' };

  const file = formData.get('file') as File;
  if (!file || file.size === 0) return { error: 'NO_FILE' };

  const ext = file.name.split('.').pop() ?? 'jpg';
  const fileName = `${crypto.randomUUID()}.${ext}`;

  const adminSupabase = await createAdminClient();
  const { error: uploadError } = await adminSupabase.storage
    .from('template-thumbnails')
    .upload(fileName, file, { contentType: file.type, upsert: false });

  if (uploadError) return { error: uploadError.message };

  const { data } = adminSupabase.storage
    .from('template-thumbnails')
    .getPublicUrl(fileName);

  return { url: data.publicUrl };
}

export async function listTemplatesAction() {
  // listTemplates can be public or auth, but if it's in admin/templates/actions, it's likely for admin view.
  // Still, let's keep it restricted to admin if it's under admin folder.
  const user = await checkAdmin();
  if (!user) return { error: 'FORBIDDEN' };

  const adminSupabase = await createAdminClient();
  const useCase = createListTemplatesUseCase(adminSupabase);
  return useCase.execute();
}

export async function getTemplateAction(id: string) {
  const user = await checkAdmin();
  if (!user) return { error: 'FORBIDDEN' };

  const adminSupabase = await createAdminClient();
  const useCase = createGetTemplateUseCase(adminSupabase);
  return useCase.execute(id);
}

export async function createTemplateAction(formData: FormData) {
  const user = await checkAdmin();
  if (!user) return { error: 'FORBIDDEN' };

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

  try {
    const adminSupabase = await createAdminClient();
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
    return { success: true, template };
  } catch (err) {
    if (err instanceof TemplateError) {
      return { error: err.code };
    }
    return { error: 'UNKNOWN' };
  }
}

export async function updateTemplateAction(formData: FormData) {
  const user = await checkAdmin();
  if (!user) return { error: 'FORBIDDEN' };

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

  try {
    const adminSupabase = await createAdminClient();
    const useCase = createUpdateTemplateUseCase(adminSupabase);
    const template = await useCase.execute(id, updateData);

    revalidatePath('/admin/templates');
    return { success: true, template };
  } catch (err) {
    if (err instanceof TemplateError) {
      return { error: err.code };
    }
    return { error: 'UNKNOWN' };
  }
}

export async function deleteTemplateAction(id: string) {
  const user = await checkAdmin();
  if (!user) return { error: 'FORBIDDEN' };

  try {
    const adminSupabase = await createAdminClient();
    const useCase = createDeleteTemplateUseCase(adminSupabase);
    await useCase.execute(id);

    revalidatePath('/admin/templates');
    return { success: true };
  } catch (err) {
    if (err instanceof TemplateError) {
      return { error: err.code };
    }
    return { error: 'UNKNOWN' };
  }
}

export async function archiveTemplateAction(id: string) {
  const user = await checkAdmin();
  if (!user) return { error: 'FORBIDDEN' };

  try {
    const adminSupabase = await createAdminClient();
    const useCase = createUpdateTemplateUseCase(adminSupabase);
    await useCase.execute(id, { status: 'archived' });

    revalidatePath('/admin/templates');
    return { success: true };
  } catch (err) {
    if (err instanceof TemplateError) {
      return { error: err.code };
    }
    return { error: 'UNKNOWN' };
  }
}

export async function revertToDraftAction(id: string) {
  const user = await checkAdmin();
  if (!user) return { error: 'FORBIDDEN' };

  try {
    const adminSupabase = await createAdminClient();
    const useCase = createUpdateTemplateUseCase(adminSupabase);
    await useCase.execute(id, { status: 'draft' });

    revalidatePath('/admin/templates');
    return { success: true };
  } catch (err) {
    if (err instanceof TemplateError) {
      return { error: err.code };
    }
    return { error: 'UNKNOWN' };
  }
}

