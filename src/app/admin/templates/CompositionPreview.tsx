'use client';

import { useEffect, useState } from 'react';
import { TemplateJson, allSections } from '@/domain/entities/template.entity';
import { templateMap } from '@/templates/_generated';
import { TemplateLibrary } from '@/templates/types';
import { Badge } from '@/components/ui/badge';

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
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-muted-foreground">Section composition</h4>
        {loading && <span className="animate-pulse text-xs text-muted-foreground">Loading metadata...</span>}
      </div>

      <div className="space-y-2">
        {sections.map((section, index) => {
          const entry = library?.[section.type];
          const meta = entry?.meta;

          return (
            <div
              key={section.id}
              className="flex items-start gap-4 rounded-md border border-border bg-card p-3 transition-colors hover:border-foreground/30"
            >
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-muted font-mono text-xs text-muted-foreground">
                {String(index + 1).padStart(2, '0')}
              </div>

              <div className="min-w-0 flex-grow">
                <div className="mb-1 flex items-center gap-2">
                  <span className="truncate text-sm font-medium">
                    {meta?.label || section.type}
                  </span>
                  {meta?.category && (
                    <Badge variant="outline" className="text-[10px]">
                      {meta.category}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <code className="font-mono">ID: {section.id}</code>
                  <span className="text-border">|</span>
                  <code className="font-mono">KEY: {section.type}</code>
                </div>

                {/* Data Fields Summary */}
                {meta?.dataSchema && (
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t border-border pt-2">
                    {Object.entries(meta.dataSchema).map(([key, schema]) => (
                      <div key={key} className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">{key}</span>
                        <span className="font-mono text-[10px] text-muted-foreground/70">[{schema.type}{schema.required ? '*' : ''}]</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Visibility Indicator */}
              <div className="flex h-6 flex-shrink-0 items-center">
                <span className={`h-1.5 w-1.5 rounded-full ${section.visible ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
              </div>
            </div>
          );
        })}
      </div>

      {!library && !loading && (
        <p className="text-xs italic text-muted-foreground">
          Metadata library not available for this template. Using legacy slot validation.
        </p>
      )}
    </div>
  );
}
