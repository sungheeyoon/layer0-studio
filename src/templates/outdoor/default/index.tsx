import React from 'react';
import { TemplateRendererProps, TemplateLibrary } from '../../types';
import { outdoorDefaultLibrary } from './library';
import { RenderMultiSite } from '../../renderMultiSite';
import { defaultGlobalStyles, designTokens } from './tokens';
import { TemplateJson } from '@/domain/entities/template.entity';

export const library: TemplateLibrary = outdoorDefaultLibrary;

export const defaultTemplateJson: TemplateJson = {
  mode: 'multi',
  templateKey: 'outdoor-default',
  globalStyles: defaultGlobalStyles,
  shared: { header: [], footer: [] },
  pages: [],
};

export default function OutdoorDefaultTemplate(props: TemplateRendererProps) {
  return (
    <RenderMultiSite
      {...props}
      library={library}
      designTokens={designTokens}
      className="font-[family-name:var(--font-base)] bg-[var(--color-surface)] text-[var(--color-ink)] antialiased"
    />
  );
}
