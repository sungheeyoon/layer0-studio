'use client';

import { Template } from '@/domain/entities/template.entity';
import { UserSite } from '@/domain/entities/user-site.entity';
import { selectTemplateAction } from '@/app/(dashboard)/templates/actions';
import { useState } from 'react';

interface DynamicTemplateGridProps {
  templates: Template[];
  mySites: UserSite[];
}

export default function DynamicTemplateGrid({ templates, mySites }: DynamicTemplateGridProps) {
  const [selectingId, setSelectingId] = useState<string | null>(null);

  const handleSelect = async (templateId: string, templateName: string) => {
    setSelectingId(templateId);
    try {
      const siteName = prompt('Enter a name for your new site:', `My ${templateName} Site`);
      if (!siteName) {
        setSelectingId(null);
        return;
      }
      await selectTemplateAction(templateId, siteName);
    } catch {
      // redirect will throw — this is expected
    }
    setSelectingId(null);
  };

  // If no templates from DB, show a message
  if (templates.length === 0 && mySites.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="font-['Inter'] font-light text-sm text-on-surface-variant">
          No templates available yet.
        </p>
      </div>
    );
  }

  // Grid layout: first template gets 8-col, rest get 4-col alternating
  const gridItems = templates.map((template, i) => {
    const isWide = i === 0 || (i > 0 && i % 3 === 0);
    const colSpan = isWide ? 'col-span-12 md:col-span-8' : 'col-span-12 md:col-span-4';
    const aspectClass = isWide ? 'aspect-video' : 'aspect-square';

    return (
      <div key={template.id} className={`${colSpan} bg-surface p-12`}>
        <div className={`${aspectClass} bg-surface-container-highest mb-8 overflow-hidden`}>
          {template.thumbnailUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={template.name}
              className="w-full h-full object-cover"
              src={template.thumbnailUrl}
            />
          )}
        </div>
        <div className="flex justify-between items-start">
          <div>
            <span className="font-['Inter'] font-medium text-[0.6875rem] uppercase tracking-[0.1em] text-tertiary mb-2 block">
              {String(i + 1).padStart(2, '0')} / {template.category}
            </span>
            <h2 className="font-['Inter'] font-light text-2xl tracking-wider uppercase">{template.name}</h2>
            {template.description && (
              <div className="mt-4 pt-4 border-t border-outline-variant/30">
                <p className="font-['Inter'] font-light text-[0.875rem] leading-relaxed text-on-surface-variant">
                  {template.description}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => handleSelect(template.id, template.name)}
            disabled={selectingId === template.id}
            className="border border-outline px-6 py-2 font-['Inter'] font-light text-[0.6875rem] uppercase tracking-[0.1em] hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
          >
            {selectingId === template.id ? 'Creating...' : 'Select'}
          </button>
        </div>
      </div>
    );
  });

  return (
    <>
      {/* My Sites Section */}
      {mySites.length > 0 && (
        <div className="mb-16">
          <h3 className="font-['Inter'] font-medium text-[0.6875rem] uppercase tracking-[0.1em] text-on-surface mb-8">
            My Sites ({mySites.length})
          </h3>
          <div className="grid grid-cols-12 gap-px bg-outline-variant border border-outline-variant mb-8">
            {mySites.map((site) => (
              <div key={site.id} className="col-span-12 md:col-span-4 bg-surface p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-['Inter'] font-light text-lg tracking-wider">{site.siteName}</h4>
                    <span className={`text-[9px] font-medium px-1.5 py-0.5 uppercase tracking-widest mt-2 inline-block ${
                      site.status === 'active'
                        ? 'bg-neutral-800 text-white'
                        : 'border border-neutral-300 text-neutral-400'
                    }`}>
                      {site.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/editor?siteId=${site.id}`}
                    className="border border-outline px-6 py-2 font-['Inter'] font-light text-[0.6875rem] uppercase tracking-[0.1em] hover:bg-primary hover:text-white transition-colors inline-block"
                  >
                    Edit
                  </a>
                  {site.status === 'active' && site.domain && (
                    <a
                      href={`/site/${site.domain}`}
                      target="_blank"
                      className="border border-green-500 text-green-600 px-6 py-2 font-['Inter'] font-light text-[0.6875rem] uppercase tracking-[0.1em] hover:bg-green-500 hover:text-white transition-colors inline-block"
                    >
                      View
                    </a>
                  )}
                  {site.status === 'active' && !site.domain && (
                    <span className="text-[9px] uppercase tracking-widest text-amber-500 self-center">
                      No domain
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Templates */}
      <div className="grid grid-cols-12 gap-px bg-outline-variant border border-outline-variant">
        {gridItems}
      </div>
    </>
  );
}
