'use client';

import { useState } from 'react';
import { Template } from '@/domain/entities/template.entity';
import { deleteTemplateAction } from './actions';

interface TemplateListPanelProps {
  templates: Template[];
  onEdit: (template: Template) => void;
  onDelete?: (id: string) => void;
}

export default function TemplateListPanel({
  templates,
  onEdit,
  onDelete,
}: TemplateListPanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    templates[0]?.id ?? null,
  );
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<{ id: string; message: string } | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setDeleteError(null);
    const result = await deleteTemplateAction(id);
    if (result && 'error' in result) {
      setDeleteError({ id, message: `Failed to delete: ${result.error}` });
      setConfirmDeleteId(null);
    } else {
      onDelete?.(id);
    }
    setDeletingId(null);
  };

  return (
    <section className="col-span-4 bg-[#f3f3f3] dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto">
      <div className="sticky top-0 bg-[#f3f3f3] dark:bg-neutral-900 z-10 p-8 pb-4">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-[11px] font-medium tracking-[0.1em] uppercase">
            Existing Templates
          </h2>
          <span className="text-[10px] text-neutral-400 font-mono tracking-tighter">
            TOTAL_COUNT [{String(templates.length).padStart(2, '0')}]
          </span>
        </div>
        <div className="flex items-center space-x-2 pb-2 border-b border-neutral-300 dark:border-neutral-800">
          <span
            className="material-symbols-outlined text-sm text-neutral-400"
            data-icon="filter_list"
          >
            filter_list
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.05em]">
            Filter by: All Categories
          </span>
        </div>
      </div>

      <div className="px-8 pb-12 space-y-4">
        {templates.length === 0 && (
          <p className="text-[10px] text-neutral-400 uppercase tracking-widest pt-4">
            No templates yet. Create your first template to get started.
          </p>
        )}

        {templates.map((template) => {
          const isActive = template.status === 'active';
          const isSelected = selectedId === template.id;
          const isConfirmingDelete = confirmDeleteId === template.id;
          const isDeletingThis = deletingId === template.id;
          const thisDeleteError = deleteError?.id === template.id ? deleteError.message : null;

          return (
            <div
              key={template.id}
              onClick={() => setSelectedId(template.id)}
              className={`group ${isActive ? 'bg-white dark:bg-neutral-950' : 'bg-white/40 dark:bg-neutral-950/40'} p-4 border ${isSelected ? 'border-black dark:border-white' : 'border-transparent hover:border-black dark:hover:border-white'} transition-all cursor-pointer`}
            >
              <div className="flex items-start gap-4">
                {/* Thumbnail */}
                <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-800 flex-shrink-0 grayscale overflow-hidden">
                  {template.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={template.name}
                      className="w-full h-full object-cover"
                      src={template.thumbnailUrl}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-neutral-400 text-sm">
                        image
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-medium tracking-tight truncate">
                      {template.name}
                    </span>
                    <div
                      className={`w-1 h-1 flex-shrink-0 mt-1 ${isActive ? 'bg-[#7d000c]' : 'bg-neutral-300 dark:bg-neutral-600'}`}
                    />
                  </div>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[9px] font-medium px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 uppercase tracking-widest text-neutral-500">
                      {template.category}
                    </span>
                    {isActive ? (
                      <span className="text-[9px] font-medium px-1.5 py-0.5 bg-neutral-800 dark:bg-neutral-200 uppercase tracking-widest text-white dark:text-black">
                        Active
                      </span>
                    ) : (
                      <span className="text-[9px] font-medium px-1.5 py-0.5 border border-neutral-300 dark:border-neutral-700 uppercase tracking-widest text-neutral-400">
                        {template.status === 'draft' ? 'Draft' : 'Archived'}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-3 space-y-2">
                    {isConfirmingDelete ? (
                      <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                        <span className="text-[9px] uppercase text-neutral-500 tracking-widest">Delete?</span>
                        <button
                          onClick={() => handleDelete(template.id)}
                          disabled={isDeletingThis}
                          className="text-[9px] uppercase tracking-tighter text-red-800 dark:text-red-500 border-b border-red-800/50 hover:border-red-800 disabled:opacity-50"
                        >
                          {isDeletingThis ? '...' : 'Yes'}
                        </button>
                        <button
                          onClick={() => { setConfirmDeleteId(null); setDeleteError(null); }}
                          className="text-[9px] uppercase tracking-tighter text-neutral-400 border-b border-neutral-300 hover:border-black dark:hover:border-white"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onEdit(template)}
                          className="text-[9px] uppercase tracking-tighter border-b border-black dark:border-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => { setConfirmDeleteId(template.id); setDeleteError(null); }}
                          className="text-[9px] uppercase tracking-tighter text-red-800 border-b border-red-800/30 dark:text-red-500 dark:border-red-500/30 hover:border-red-800 dark:hover:border-red-500 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                    {thisDeleteError && (
                      <p className="text-[9px] text-red-500">{thisDeleteError}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
