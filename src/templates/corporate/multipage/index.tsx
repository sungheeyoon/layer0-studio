import React from 'react';
import { TemplateRendererProps, TemplateLibrary } from '../../types';
import { corporateMultipageLibrary } from './library';
import { RenderMultiSite } from '../../renderMultiSite';
import { defaultGlobalStyles } from './tokens';
import { TemplateJson } from '@/domain/entities/template.entity';

export const library: TemplateLibrary = corporateMultipageLibrary;

export const defaultTemplateJson: TemplateJson = {
  mode: 'multi',
  templateKey: 'corporate-multipage',
  globalStyles: defaultGlobalStyles,
  shared: { header: [], footer: [] },
  pages: [],
};

export default function CorporateMultipageTemplate(props: TemplateRendererProps) {
  return <RenderMultiSite {...props} library={library} />;
}
