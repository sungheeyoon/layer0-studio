import React from 'react';
import { TemplateRendererProps, TemplateLibrary } from '../../types';
import { medicalClinicLibrary } from './library';
import { RenderMultiSite } from '../../renderMultiSite';
import { defaultGlobalStyles, designTokens } from './tokens';
import { ContentModel } from '@/domain/entities/template.entity';

export const library: TemplateLibrary = medicalClinicLibrary;

export const defaultContent: ContentModel = {
  mode: 'multi',
  templateKey: 'medical-clinic',
  globalStyles: defaultGlobalStyles,
  chrome: { header: [], footer: [] },
  pages: [],
};

export default function MedicalClinicTemplate(props: TemplateRendererProps) {
  return (
    <RenderMultiSite
      {...props}
      library={library}
      designTokens={designTokens}
      className="font-[family-name:var(--font-base)] bg-[var(--color-surface)] text-[var(--color-ink)] antialiased"
    />
  );
}
