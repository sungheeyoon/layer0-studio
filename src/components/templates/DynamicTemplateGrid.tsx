'use client';

import { Template } from '@/domain/entities/template.entity';
import { UserSite } from '@/domain/entities/user-site.entity';
import { useState, useTransition, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { listPaginatedTemplatesAction } from '@/app/dashboard/templates/actions';

interface DynamicTemplateGridProps {
  templates: Template[];
  mySites: UserSite[];
  categories: string[];
  initialTotal: number;
}

export default function DynamicTemplateGrid({ templates: initialTemplates, mySites, categories, initialTotal }: DynamicTemplateGridProps) {
  const router = useRouter();
  const [selectingId, setSelectingId] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const [currentTemplates, setCurrentTemplates] = useState(initialTemplates);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(initialTotal);

  const limit = 6;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (templateId: string) => {
    setSelectingId(templateId);
    router.push(`/dashboard/projects/create?templateId=${templateId}`);
  };


  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
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

  // If no templates from DB, show a message
  if (initialTemplates.length === 0 && mySites.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="font-['Inter'] font-light text-sm text-on-surface-variant">
          No templates available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 w-full h-full">
      {/* Header Actions */}
      <div className="flex justify-between items-end mb-16">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-thin tracking-tight text-black dark:text-white mb-4 uppercase">Node_Library</h1>
          <p className="text-xs font-light text-neutral-500 tracking-wide leading-relaxed max-w-md">
            Precision-engineered layout modules for rapid architectural deployment.
            Select a base node to initialize environment variables.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="relative group" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`h-10 px-6 border border-outline flex items-center gap-4 text-[10px] font-medium tracking-widest uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all ${isPending ? 'opacity-50' : ''} text-black dark:text-white`}
              disabled={isPending}
            >
              {selectedCategory ? `CATEGORY: ${selectedCategory}` : 'Filter_Category'}
              <span className="material-symbols-outlined !text-[14px]">expand_more</span>
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full mt-2 w-full min-w-[200px] right-0 bg-white dark:bg-zinc-900 border border-black dark:border-white shadow-xl z-50">
                <button
                  onClick={() => handleCategoryChange(null)}
                  className={`w-full text-left px-4 py-3 text-[10px] font-medium tracking-widest uppercase hover:bg-neutral-100 dark:hover:bg-zinc-800 transition-colors ${!selectedCategory ? 'text-black dark:text-white' : 'text-neutral-500'}`}
                >
                  ALL_CATEGORIES
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`w-full text-left px-4 py-3 text-[10px] font-medium tracking-widest uppercase hover:bg-neutral-100 dark:hover:bg-zinc-800 transition-colors border-t border-neutral-100 dark:border-zinc-800 ${selectedCategory === cat ? 'text-black dark:text-white' : 'text-neutral-500'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 ${isPending ? 'opacity-50 pointer-events-none' : ''} transition-opacity duration-300`}>
        {currentTemplates.map((template, i) => (
          <div key={template.id} className="group border-b border-transparent hover:border-black dark:hover:border-white transition-colors pb-8">
            <div className="aspect-[16/10] bg-surface-container-high relative mb-6 overflow-hidden">
              {template.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={template.thumbnailUrl}
                  alt={template.name}
                  className="w-full h-full object-cover grayscale opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-neutral-200 dark:bg-zinc-800">
                  <span className="text-neutral-400 text-xs tracking-widest uppercase">No Image</span>
                </div>
              )}
              <div className="absolute top-4 left-4 bg-white dark:bg-zinc-900 px-2 py-1 text-[9px] font-bold tracking-widest uppercase text-black dark:text-white">
                NODE_{String(i + 1).padStart(2, '0')}
              </div>
            </div>

            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-medium tracking-widest uppercase text-black dark:text-white">{template.name}</h3>
              <div className="w-1.5 h-1.5 bg-tertiary"></div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-[9px] border border-outline-variant px-2 py-0.5 text-neutral-500 font-light tracking-tighter uppercase">{template.category || 'General'}</span>
              <span className="text-[9px] border border-outline-variant px-2 py-0.5 text-neutral-500 font-light tracking-tighter uppercase">Template</span>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-neutral-200 dark:border-zinc-800 pt-4">
              <div>
                <div className="text-[8px] text-neutral-400 tracking-widest uppercase mb-1">Page_Count</div>
                <div className="text-xs font-light tracking-widest text-black dark:text-white">{template.templateJson?.pages?.[0]?.sections?.length ?? 0}_UNITS</div>
              </div>
              <div>
                <div className="text-[8px] text-neutral-400 tracking-widest uppercase mb-1">Responsive_Status</div>
                <div className="text-xs font-light tracking-widest text-black dark:text-white">OPTIMIZED</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                onClick={() => handleSelect(template.id)}
                disabled={selectingId === template.id}
                className="h-9 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black text-[9px] font-light tracking-[0.2em] uppercase hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50"
              >
                {selectingId === template.id ? 'INITIALIZING...' : 'SELECT'}
              </button>
              <a
                href={`/preview/${template.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 border border-black dark:border-white bg-transparent text-black dark:text-white text-[9px] font-light tracking-[0.2em] uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors flex items-center justify-center"
              >
                PREVIEW
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Pagination/Status */}
      <div className="mt-24 pt-8 border-t border-neutral-200 dark:border-zinc-800 flex justify-between items-center text-[10px] tracking-[0.2em] uppercase font-light text-neutral-400">
        <div className="flex gap-8">
          <span>Active_Nodes: {total}</span>
          <span>System_Load: 12%</span>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || isPending}
            className="hover:text-black dark:hover:text-white transition-colors disabled:opacity-50"
          >
            PREV_MODULE
          </button>
          <span className="text-black dark:text-white">
            PAGE_{String(page).padStart(2, '0')}_OF_{String(totalPages).padStart(2, '0')}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages || isPending}
            className="hover:text-black dark:hover:text-white transition-colors disabled:opacity-50"
          >
            NEXT_MODULE
          </button>
        </div>
      </div>
    </div>
  );
}
