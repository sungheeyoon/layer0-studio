import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { createGetTemplateUseCase } from '@/lib/di/template-read';
import { isMultiContent } from '@/domain/entities/template.entity';
import { globalStylesToThemeVars } from '@/lib/template/design-tokens';
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

  const { content } = template;
  const slugPath = (slug ?? []).join('/');

  // Mirror the public site: empty slug = home (first page); unknown / hidden
  // page → 404. Single templates have no sub-paths.
  let activePageId: string | undefined;
  if (isMultiContent(content)) {
    const { pages } = content;
    const activePage = slugPath === '' ? pages[0] : pages.find((p) => p.slug === slugPath);
    if (!activePage || !activePage.visible) notFound();
    activePageId = activePage.id;
  } else if (slugPath !== '') {
    notFound();
  }

  const themeVariables = globalStylesToThemeVars(content.globalStyles) as React.CSSProperties;

  return (
    <main
      className="min-h-screen"
      style={themeVariables}
    >
      <TemplateClientWrapper
        templateKey={content.templateKey || 'corporate-default'}
        content={content}
        selectedSectionId={null}
        activePageId={activePageId}
        basePath={`/preview/${id}`}
      />
    </main>
  );
}
