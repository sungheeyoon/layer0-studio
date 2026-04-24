'use client';

import { Template } from '@/domain/entities/template.entity';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { listPaginatedTemplatesAction } from '@/app/dashboard/templates/actions';

interface PublicTemplateGridProps {
  templates: Template[];
  categories: string[];
  initialTotal: number;
}

export default function PublicTemplateGrid({ templates: initialTemplates, categories, initialTotal }: PublicTemplateGridProps) {
  const router = useRouter();
  const [selectingId, setSelectingId] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const [currentTemplates, setCurrentTemplates] = useState(initialTemplates);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(initialTotal);
  
  const limit = 9;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleSelect = (templateId: string) => {
    setSelectingId(templateId);
    router.push(`/projects/create?templateId=${templateId}`);
  };

  const handlePreview = (templateId: string) => {
    window.open(`/preview/${templateId}`, '_blank');
  };

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    setPage(1);
    startTransition(async () => {
      const { data, total: newTotal } = await listPaginatedTemplatesAction(1, limit, category);
      setCurrentTemplates(data);
      setTotal(newTotal);
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    startTransition(async () => {
      const { data, total: newTotal } = await listPaginatedTemplatesAction(newPage, limit, selectedCategory);
      setCurrentTemplates(data);
      setTotal(newTotal);
    });
  };

  return (
    <main className="pt-32 pb-24 px-10 min-h-screen blueprint-grid">
      {/* Header Section */}
      <header className="grid grid-cols-12 mb-20">
        <div className="col-span-12 md:col-start-2 md:col-span-10">
          <div className="flex items-baseline gap-4 mb-2">
            <span className="w-1 h-1 bg-tertiary"></span>
            <span className="font-['Inter'] font-medium text-[11px] tracking-[0.2em] uppercase text-secondary">System v.4.0</span>
          </div>
          <h1 className="text-[5rem] md:text-[7rem] font-thin leading-none tracking-tight mb-6 text-primary">Templates</h1>
          <p className="text-xl font-light tracking-wide text-secondary max-w-xl">Start with a template. Customize later.</p>
        </div>
      </header>

      {/* Filter Bar */}
      <section className="grid grid-cols-12 mb-16">
        <div className="col-span-12 md:col-start-2 md:col-span-10 flex gap-12 border-b border-outline-variant/20 pb-4">
          <button 
            onClick={() => handleCategoryChange(null)}
            className={`font-medium text-[11px] tracking-[0.15em] uppercase transition-all pb-4 -mb-[18px] ${!selectedCategory ? 'text-primary border-b-2 border-primary' : 'text-secondary hover:text-primary'}`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`font-medium text-[11px] tracking-[0.15em] uppercase transition-all pb-4 -mb-[18px] ${selectedCategory === cat ? 'text-primary border-b-2 border-primary' : 'text-secondary hover:text-primary'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Template Grid */}
      <section className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-20 gap-x-12 px-0 md:px-16 ${isPending ? 'opacity-50' : ''} transition-opacity`}>
        {currentTemplates.map((template, index) => (
          <article 
            key={template.id} 
            className={`group cursor-crosshair ${index % 3 === 0 && index !== 0 ? 'lg:mt-0' : ''}`}
          >
            <div className="relative bg-surface-container aspect-video mb-6 overflow-hidden border border-outline-variant/10">
              {template.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  alt={template.name} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105" 
                  src={template.thumbnailUrl}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-neutral-200">
                   <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono">Blueprint_Missing</span>
                </div>
              )}
              
              {/* Hover Actions */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
                <div className="flex flex-col gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <button 
                    onClick={() => handleSelect(template.id)}
                    disabled={selectingId === template.id}
                    className="w-full bg-primary text-white font-medium text-[11px] tracking-[0.1em] uppercase py-4 hover:bg-neutral-800 transition-colors disabled:opacity-50"
                  >
                    {selectingId === template.id ? 'Initializing...' : 'Use Template'}
                  </button>
                  <button 
                    onClick={() => handlePreview(template.id)}
                    className="w-full border border-white text-white font-medium text-[11px] tracking-[0.1em] uppercase py-4 hover:bg-white hover:text-black transition-colors"
                  >
                    Preview
                  </button>
                </div>
              </div>
              
              {/* Status Indicator */}
              <div className="absolute top-6 right-6 flex items-center gap-2 bg-white px-3 py-1 shadow-sm">
                <span className="w-1 h-1 bg-tertiary"></span>
                <span className="text-[9px] font-medium tracking-widest uppercase text-black">
                  {template.category || 'Standard'}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-medium tracking-[0.1em] uppercase text-primary">{template.name}</h3>
              <p className="text-xs font-light text-secondary tracking-tight">{template.description || 'Precision layout module.'}</p>
            </div>
          </article>
        ))}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-24 flex justify-center gap-8 items-center border-t border-outline-variant/20 pt-12">
           <button 
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || isPending}
            className="text-[10px] tracking-[0.2em] uppercase text-secondary hover:text-primary disabled:opacity-30"
          >
            Prev
          </button>
          <span className="text-[10px] tracking-[0.2em] uppercase font-medium">
            {String(page).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
          </span>
          <button 
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages || isPending}
            className="text-[10px] tracking-[0.2em] uppercase text-secondary hover:text-primary disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}

      {/* CTA Section */}
      <section className="mt-32 border-t border-outline-variant/30 pt-20 grid grid-cols-12">
        <div className="col-span-12 md:col-start-4 md:col-span-6 text-center">
          <span className="font-['Inter'] font-medium text-[11px] tracking-[0.2em] uppercase text-tertiary mb-4 block">Custom Inquiry</span>
          <h2 className="text-4xl font-thin tracking-tight mb-8 text-primary">Can't find the right blueprint?</h2>
          <button className="border border-primary text-primary font-medium text-[11px] tracking-[0.2em] uppercase px-12 py-5 hover:bg-primary hover:text-white transition-all duration-300">
            Contact Engineering
          </button>
        </div>
      </section>
    </main>
  );
}
