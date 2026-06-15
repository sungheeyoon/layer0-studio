import { notFound } from 'next/navigation';
import { presetMap } from '@/templates/_generated';
import { isMultiTemplate } from '@/domain/entities/template.entity';
import TemplateClientWrapper from '@/templates/TemplateClientWrapper';
import React from 'react';

interface Props {
  params: Promise<{ key: string[] }>;
}

export default async function PresetPreviewPage({ params }: Props) {
  const { key } = await params;

  // templateKeys are single-segment (`<category>-<leaf>`); anything after is a
  // Multi page slug, e.g. /preview/preset/corporate-multipage/about.
  const presetKey = key[0];
  const slugPath = key.slice(1).join('/');

  const loader = presetMap[presetKey as keyof typeof presetMap];
  if (!loader) {
    console.error(`[PresetPreviewPage] Preset not found: ${presetKey}`);
    notFound();
  }

  const preset = (await loader()).default;

  // post-β: presetMap key == templateKey == preset.slug.
  // The Preset carries the full templateJson verbatim (code is source of truth).
  const templateJson = preset.templateJson;

  // Resolve the active page (Multi) from the slug — same rules as the public
  // site: empty slug = home (first page); unknown / non-routable → 404.
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
        templateKey={templateJson.templateKey}
        siteJson={templateJson}
        selectedSectionId={null}
        activePageId={activePageId}
        basePath={`/preview/preset/${presetKey}`}
      />
    </main>
  );
}
