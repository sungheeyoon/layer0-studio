'use client';

import React, { useState, useEffect } from 'react';
import { ThemeRendererProps } from './types';
import { loadTheme } from './registry';

interface ThemeClientWrapperProps extends Omit<ThemeRendererProps, 'onSectionClick'> {
  themeKey: string;
}

export default function ThemeClientWrapper({ 
  themeKey,
  siteJson, 
  selectedSectionId,
}: ThemeClientWrapperProps) {
  const [ThemeRenderer, setThemeRenderer] = useState<React.ComponentType<ThemeRendererProps> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchTheme = async () => {
      try {
        const themeModule = await loadTheme(themeKey);
        if (mounted) {
          if (themeModule) {
            setThemeRenderer(() => themeModule.default);
          } else {
            setError(`Theme "${themeKey}" not found.`);
          }
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to load theme.');
          console.error(err);
        }
      }
    };
    fetchTheme();
    return () => { mounted = false; };
  }, [themeKey]);

  if (error) {
    return (
      <div className="p-20 text-center text-error font-light tracking-widest uppercase opacity-50">
        {error}
      </div>
    );
  }

  if (!ThemeRenderer) {
    return (
      <div className="p-20 text-center font-light tracking-widest uppercase opacity-30 animate-pulse">
        Loading Theme...
      </div>
    );
  }

  return (
    <ThemeRenderer 
      siteJson={siteJson} 
      selectedSectionId={selectedSectionId} 
    />
  );
}
