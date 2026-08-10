'use client';

import { useEffect, useState } from 'react';
import { ContentModel, allBlocks } from '@/domain/entities/template.entity';
import { templateMap } from '@/templates/_generated';
import { TemplateLibrary } from '@/templates/types';
import { Badge } from '@/components/ui/badge';

interface CompositionPreviewProps {
  content: ContentModel;
}

export default function CompositionPreview({ content }: CompositionPreviewProps) {
  const [library, setLibrary] = useState<TemplateLibrary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const templateKey = content.templateKey;
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
  }, [content.templateKey]);

  // Flat list of every Block (Single root Blocks; Multi Chrome + Page Blocks).
  const blocks = allBlocks(content);
  if (blocks.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-muted-foreground">블록 구성</h4>
        {loading && <span className="animate-pulse text-xs text-muted-foreground">메타데이터 불러오는 중...</span>}
      </div>

      <div className="space-y-2">
        {blocks.map((block, index) => {
          const entry = library?.[block.type];
          const meta = entry?.meta;

          return (
            <div
              key={block.id}
              className="flex items-start gap-4 rounded-md border border-border bg-card p-3 transition-colors hover:border-foreground/30"
            >
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-muted font-mono text-xs text-muted-foreground">
                {String(index + 1).padStart(2, '0')}
              </div>

              <div className="min-w-0 flex-grow">
                <div className="mb-1 flex items-center gap-2">
                  <span className="truncate text-sm font-medium">
                    {meta?.label || block.type}
                  </span>
                  {meta?.category && (
                    <Badge variant="outline" className="text-[10px]">
                      {meta.category}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <code className="font-mono">ID: {block.id}</code>
                  <span className="text-border">|</span>
                  <code className="font-mono">KEY: {block.type}</code>
                </div>

                {/* Data Fields Summary */}
                {meta?.fieldsSchema && (
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t border-border pt-2">
                    {Object.entries(meta.fieldsSchema).map(([key, schema]) => (
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
                <span className={`h-1.5 w-1.5 rounded-full ${block.visible ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
              </div>
            </div>
          );
        })}
      </div>

      {!library && !loading && (
        <p className="text-xs italic text-muted-foreground">
          이 템플릿에 대한 메타데이터 라이브러리를 사용할 수 없습니다. 레거시 슬롯 검증을 사용합니다.
        </p>
      )}
    </div>
  );
}
