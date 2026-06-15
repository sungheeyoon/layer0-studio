'use client';

import React, { useState, useEffect } from 'react';
import { TemplateRendererProps } from './types';
import { loadTemplate } from './registry';

interface TemplateClientWrapperProps extends Omit<TemplateRendererProps, 'onSectionClick'> {
  templateKey: string;
}

export default function TemplateClientWrapper({
  templateKey,
  siteJson,
  selectedSectionId,
  activePageId,
  basePath,
}: TemplateClientWrapperProps) {
  const [TemplateRenderer, setTemplateRenderer] = useState<React.ComponentType<TemplateRendererProps> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchTemplate = async () => {
      try {
        const templateModule = await loadTemplate(templateKey);
        if (mounted) {
          if (templateModule) {
            setTemplateRenderer(() => templateModule.default);
          } else {
            setError(`Template "${templateKey}" not found.`);
          }
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to load template.');
          console.error(err);
        }
      }
    };
    fetchTemplate();
    return () => { mounted = false; };
  }, [templateKey]);

  if (error) {
    return (
      <div className="p-20 text-center text-error font-light tracking-widest uppercase opacity-50">
        {error}
      </div>
    );
  }

  if (!TemplateRenderer) {
    return (
      <div className="p-20 text-center font-light tracking-widest uppercase opacity-30 animate-pulse">
        Loading Template...
      </div>
    );
  }

  return (
    <TemplateRenderer
      siteJson={siteJson}
      selectedSectionId={selectedSectionId}
      activePageId={activePageId}
      basePath={basePath}
    />
  );
}
