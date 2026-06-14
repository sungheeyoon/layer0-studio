'use client';

import { useEffect, useState } from 'react';
import { TemplateJson, allSections } from '@/domain/entities/template.entity';
import { templateMap } from '@/templates/_generated';
import { TemplateLibrary } from '@/templates/types';

interface CompositionPreviewProps {
  templateJson: TemplateJson;
}

export default function CompositionPreview({ templateJson }: CompositionPreviewProps) {
  const [library, setLibrary] = useState<TemplateLibrary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const templateKey = templateJson.templateKey;
    if (templateMap[templateKey]) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);
      templateMap[templateKey]()
        .then((mod) => {
          setLibrary(mod.library || null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLibrary(null);
    }
  }, [templateJson.templateKey]);

  // Flat list of every section (Single: sections[]; Multi: shared + pages).
  const sections = allSections(templateJson);
  if (sections.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-[10px] font-medium uppercase tracking-widest text-neutral-500">
          Section Composition
        </h4>
        {loading && <span className="text-[9px] animate-pulse text-neutral-400">Loading Metadata...</span>}
      </div>

      <div className="space-y-2">
        {sections.map((section, index) => {
          const entry = library?.[section.type];
          const meta = entry?.meta;

          return (
            <div 
              key={section.id}
              className="group flex items-start gap-4 p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white transition-colors"
            >
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-[10px] font-mono text-neutral-400">
                {String(index + 1).padStart(2, '0')}
              </div>
              
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-medium truncate">
                    {meta?.label || section.type}
                  </span>
                  {meta?.category && (
                    <span className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-[8px] uppercase tracking-tighter text-neutral-500 rounded">
                      {meta.category}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <code className="text-[9px] text-neutral-400 font-mono">
                    ID: {section.id}
                  </code>
                  <span className="text-neutral-300 dark:text-neutral-700">|</span>
                  <code className="text-[9px] text-neutral-400 font-mono">
                    KEY: {section.type}
                  </code>
                </div>

                {/* Data Fields Summary */}
                {meta?.dataSchema && (
                  <div className="mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap gap-x-3 gap-y-1">
                    {Object.entries(meta.dataSchema).map(([key, schema]) => (
                      <div key={key} className="flex items-center gap-1">
                        <span className="text-[9px] text-neutral-500">{key}</span>
                        <span className="text-[8px] text-neutral-300 font-mono">[{schema.type}{schema.required ? '*' : ''}]</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Indicator */}
              <div className="flex-shrink-0 flex items-center h-6">
                <div className={`w-1 h-1 rounded-full ${section.visible ? 'bg-[#7d000c]' : 'bg-neutral-300'}`} />
              </div>
            </div>
          );
        })}
      </div>

      {!library && !loading && (
        <p className="text-[9px] text-neutral-400 italic">
          Metadata library not available for this theme. Using legacy slot validation.
        </p>
      )}
    </div>
  );
}
