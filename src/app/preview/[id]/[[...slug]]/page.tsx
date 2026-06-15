import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { createGetTemplateUseCase } from '@/lib/di/container';
import { isMultiTemplate } from '@/domain/entities/template.entity';
import type { Metadata } from 'next';
import React from 'react';
import TemplateClientWrapper from '@/templates/TemplateClientWrapper';

interface Props {
  params: Promise<{ id: string; slug?: string[] }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const useCase = createGetTemplateUseCase(supabase);

  try {
    const template = await useCase.execute(id);
    return {
      title: `${template.name} - Preview`,
      description: template.description || 'Template Preview',
    };
  } catch {
    return { title: 'Template Not Found' };
  }
}

export default async function TemplatePreviewPage({ params }: Props) {
  const { id, slug } = await params;
  const supabase = await createClient();
  const useCase = createGetTemplateUseCase(supabase);

  let template;
  try {
    template = await useCase.execute(id);
  } catch (error) {
    console.error('[TemplatePreviewPage]', error);
    notFound();
  }

  const { templateJson } = template;
  const slugPath = (slug ?? []).join('/');

  // Mirror the public site: empty slug = home (first page); unknown / hidden
  // page → 404. Single templates have no sub-paths.
  let activePageId: string | undefined;
  if (isMultiTemplate(templateJson)) {
    const { pages } = templateJson;
    const activePage = slugPath === '' ? pages[0] : pages.find((p) => p.slug === slugPath);
    if (!activePage || !activePage.visible) notFound();
    activePageId = activePage.id;
  } else if (slugPath !== '') {
    notFound();
  }

  const themeVariables = {
    '--theme-primary': templateJson.globalStyles.primaryColor,
    '--theme-secondary': templateJson.globalStyles.secondaryColor,
    '--theme-font-family': templateJson.globalStyles.fontFamily,
    '--theme-font-size': templateJson.globalStyles.fontSize,
  } as React.CSSProperties;

  return (
    <main
      className="min-h-screen"
      style={themeVariables}
    >
      <TemplateClientWrapper
        templateKey={templateJson.templateKey || 'corporate-default'}
        siteJson={templateJson}
        selectedSectionId={null}
        activePageId={activePageId}
        basePath={`/preview/${id}`}
      />
    </main>
  );
}
