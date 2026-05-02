import { notFound } from 'next/navigation';
import { presetMap } from '@/themes/_generated';
import ThemeClientWrapper from '@/themes/ThemeClientWrapper';
import React from 'react';

interface Props {
  params: Promise<{ key: string[] }>;
}

export default async function PresetPreviewPage({ params }: Props) {
  const { key } = await params;
  const presetKey = key.join('/');
  
  const loader = presetMap[presetKey as keyof typeof presetMap];
  if (!loader) {
    console.error(`[PresetPreviewPage] Preset not found: ${presetKey}`);
    notFound();
  }

  const preset = (await loader()).default;
  const { templateJson } = preset;

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
      <ThemeClientWrapper
        themeKey={templateJson.themeKey || 'corporate'}
        siteJson={templateJson}
        selectedSectionId={null}
      />
    </main>
  );
}
