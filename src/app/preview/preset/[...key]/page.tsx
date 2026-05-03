import { notFound } from 'next/navigation';
import { presetMap, themeMap } from '@/themes/_generated';
import ThemeClientWrapper from '@/themes/ThemeClientWrapper';
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
  
  // Load theme module to provide base configuration if needed
  const themeKey = preset.composition ? preset.themeKey : preset.templateJson?.themeKey;
  const themeLoader = themeKey ? themeMap[themeKey as keyof typeof themeMap] : null;
  const themeModule = themeLoader ? await themeLoader() : null;

  let templateJson;
  try {
    templateJson = deriveTemplateJsonFromPreset(preset, themeModule);
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
      <ThemeClientWrapper
        themeKey={templateJson.themeKey}
        siteJson={templateJson}
        selectedSectionId={null}
      />
    </main>
  );
}

