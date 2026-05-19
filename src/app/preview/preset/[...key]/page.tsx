import { notFound } from 'next/navigation';
import { presetMap, templateMap } from '@/templates/_generated';
import TemplateClientWrapper from '@/templates/TemplateClientWrapper';
import { deriveTemplateJsonFromPreset } from '@/lib/template/preset';
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

  // post-β: presetMap key == templateKey == preset.slug
  const templateKey = presetKey;
  const templateLoader = templateMap[templateKey as keyof typeof templateMap];
  const templateModule = templateLoader ? await templateLoader() : null;

  let templateJson;
  try {
    templateJson = deriveTemplateJsonFromPreset(preset, templateModule);
  } catch (err) {
    console.error(`[PresetPreviewPage] Failed to derive templateJson:`, err);
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
      />
    </main>
  );
}

