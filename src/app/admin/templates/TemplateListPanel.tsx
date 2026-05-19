'use client';

import { useState } from 'react';
import { Template } from '@/domain/entities/template.entity';
import { deleteTemplateAction, archiveTemplateAction, revertToDraftAction, syncTemplatesAction } from './actions';
import { isPresetSlug } from '@/templates/_generated';
import { SyncSummary } from '@/lib/template/sync';

interface TemplateListPanelProps {
  templates: Template[];
  onEdit: (template: Template) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
  canPublish?: boolean;
}

export default function TemplateListPanel({
  templates,
  onEdit,
  onDelete,
  onArchive,
  canPublish = false,
}: TemplateListPanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    templates[0]?.id ?? null,
  );
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<{ id: string; message: string } | null>(null);
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [revertingId, setRevertingId] = useState<string | null>(null);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSummary, setSyncSummary] = useState<SyncSummary | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);

  const handleSync = async (dryRun: boolean) => {
    setIsSyncing(true);
    setSyncError(null);
    const result = await syncTemplatesAction(dryRun);
    if ('error' in result && result.error) {
      setSyncError(result.error);
    } else if ('summary' in result && result.summary) {
      setSyncSummary(result.summary);
    }
    setIsSyncing(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setDeleteError(null);
    const result = await deleteTemplateAction(id);
    if (result && 'error' in result) {
      setDeleteError({ id, message: `Failed to delete: ${result.error}` });
    } else {
      setConfirmDeleteId(null);
      onDelete?.(id);
    }
    setDeletingId(null);
  };

  const handleArchive = async (id: string) => {
    setArchivingId(id);
    const result = await archiveTemplateAction(id);
    if (result && 'error' in result) {
      // Silently fail or show error — for now just close modal
    } else {
      setConfirmArchiveId(null);
      onArchive?.(id);
    }
    setArchivingId(null);
  };

  const handleRevertToDraft = async (id: string) => {
    setRevertingId(id);
    const result = await revertToDraftAction(id);
    if (result && !('error' in result)) {
      onArchive?.(id); // reuse callback to trigger list refresh
    }
    setRevertingId(null);
  };

  return (
    <section className="col-span-4 bg-[#f3f3f3] dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto">
      <div className="sticky top-0 bg-[#f3f3f3] dark:bg-neutral-900 z-10 p-8 pb-4">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-[11px] font-medium tracking-[0.1em] uppercase">
            Template Management
          </h2>
          <span className="text-[10px] text-neutral-400 font-mono tracking-tighter">
            TOTAL_COUNT [{String(templates.length).padStart(2, '0')}]
          </span>
        </div>

        {/* Sync Controls */}
        <div className="mb-6 p-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 bg-[#7d000c]" />
              <span className="text-[9px] font-medium uppercase tracking-widest text-neutral-500">
                Code Synchronization
              </span>
            </div>
          </div>
          <p className="text-[10px] text-neutral-400 font-light leading-relaxed mb-4">
            Sync preset blueprints from the codebase to the database.
          </p>
          <button
            onClick={() => setShowSyncModal(true)}
            className="w-full py-2 bg-neutral-900 dark:bg-white text-white dark:text-black text-[9px] uppercase tracking-widest font-medium hover:opacity-80 transition-opacity"
          >
            Sync from Code
          </button>
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

          return (
            <div
              key={template.id}
              onClick={() => setSelectedId(template.id)}
              className={`group ${isActive ? 'bg-white dark:bg-neutral-950' : 'bg-white/40 dark:bg-neutral-950/40'} p-4 border ${isSelected ? 'border-black dark:border-white' : 'border-transparent hover:border-black dark:hover:border-white'} transition-all cursor-pointer`}
            >
              <div className="flex items-start gap-4">
                {/* Thumbnail */}
                <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-800 flex-shrink-0 overflow-hidden">
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
                    {isPresetSlug(template.slug) ? (
                      <span className="text-[9px] font-medium px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 uppercase tracking-widest text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                        Code
                      </span>
                    ) : (
                      <span className="text-[9px] font-medium px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/30 uppercase tracking-widest text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50">
                        Manual
                      </span>
                    )}
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
                  <div className="mt-3">
                    <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onEdit(template)}
                        className="text-[9px] uppercase tracking-tighter border-b border-black dark:border-white"
                      >
                        Edit
                      </button>
                      {template.status !== 'archived' && (
                        <button
                          onClick={() => setConfirmArchiveId(template.id)}
                          className="text-[9px] uppercase tracking-tighter text-neutral-500 border-b border-neutral-400/30 hover:border-neutral-500 transition-colors"
                        >
                          Archive
                        </button>
                      )}
                      {template.status === 'archived' && (
                        <button
                          onClick={() => handleRevertToDraft(template.id)}
                          disabled={revertingId === template.id}
                          className="text-[9px] uppercase tracking-tighter text-amber-700 dark:text-amber-500 border-b border-amber-700/30 dark:border-amber-500/30 hover:border-amber-700 dark:hover:border-amber-500 transition-colors disabled:opacity-40"
                        >
                          {revertingId === template.id ? 'Reverting...' : 'Revert to Draft'}
                        </button>
                      )}
                      <button
                        onClick={() => { setConfirmDeleteId(template.id); setDeleteError(null); }}
                        className="text-[9px] uppercase tracking-tighter text-red-800 border-b border-red-800/30 dark:text-red-500 dark:border-red-500/30 hover:border-red-800 dark:hover:border-red-500 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete confirmation modal */}
      {confirmDeleteId && (() => {
        const target = templates.find((t) => t.id === confirmDeleteId);
        if (!target) return null;
        const isDeletingThis = deletingId === confirmDeleteId;
        const thisDeleteError = deleteError?.id === confirmDeleteId ? deleteError.message : null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="relative bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-10 w-[460px]">
              <div className="absolute top-3 right-3 w-1 h-1 bg-[#7d000c]" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-1 bg-neutral-400" />
                <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-neutral-400">
                  Destructive Action
                </span>
              </div>
              <h3 className="text-xl font-[100] tracking-tight mb-2">Delete Template?</h3>
              <p className="text-sm font-medium tracking-tight mb-4">{target.name}</p>
              <p className="text-[11px] text-neutral-500 font-light leading-relaxed mb-8">
                This action cannot be undone. Sites already created from this template will not be affected.
              </p>
              {thisDeleteError && (
                <p className="text-[10px] text-red-500 mb-4">{thisDeleteError}</p>
              )}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => { setConfirmDeleteId(null); setDeleteError(null); }}
                  disabled={isDeletingThis}
                  className="px-8 py-3 text-[10px] uppercase tracking-widest font-medium text-neutral-500 hover:text-black dark:hover:text-white transition-colors disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(confirmDeleteId)}
                  disabled={isDeletingThis}
                  className="px-10 py-3 bg-[#7d000c] text-white text-[10px] uppercase tracking-widest font-medium hover:opacity-80 transition-opacity disabled:opacity-40"
                >
                  {isDeletingThis ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Archive confirmation modal */}
      {confirmArchiveId && (() => {
        const target = templates.find((t) => t.id === confirmArchiveId);
        if (!target) return null;
        const isArchivingThis = archivingId === confirmArchiveId;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="relative bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-10 w-[420px]">
              <div className="absolute top-3 right-3 w-1 h-1 bg-neutral-400" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-1 bg-neutral-400" />
                <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-neutral-400">
                  Status Change
                </span>
              </div>
              <h3 className="text-xl font-[100] tracking-tight mb-2">Archive Template?</h3>
              <p className="text-sm font-medium tracking-tight mb-4">{target.name}</p>
              <p className="text-[11px] text-neutral-500 font-light leading-relaxed mb-8">
                이 템플릿은 공개 카탈로그에서 숨겨집니다. 리스트에서 &quot;Revert to Draft&quot;를 클릭하거나, Edit → Save Draft로 수정 상태로 되돌릴 수 있습니다.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setConfirmArchiveId(null)}
                  disabled={isArchivingThis}
                  className="px-8 py-3 text-[10px] uppercase tracking-widest font-medium text-neutral-500 hover:text-black dark:hover:text-white transition-colors disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleArchive(confirmArchiveId)}
                  disabled={isArchivingThis}
                  className="px-10 py-3 bg-neutral-700 text-white text-[10px] uppercase tracking-widest font-medium hover:opacity-80 transition-opacity disabled:opacity-40"
                >
                  {isArchivingThis ? 'Archiving...' : 'Archive'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Sync Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-10 w-[600px] max-h-[80vh] flex flex-col">
            <div className="absolute top-3 right-3 w-1 h-1 bg-[#7d000c]" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-1 bg-[#7d000c]" />
              <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-neutral-400">
                Database Synchronization
              </span>
            </div>
            
            <h3 className="text-xl font-[100] tracking-tight mb-6">Sync Presets from Source_</h3>

            <div className="flex-1 overflow-y-auto pr-4 mb-8">
              {syncError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[11px] uppercase tracking-widest mb-6">
                  Error: {syncError}
                </div>
              )}

              {!syncSummary && !isSyncing && !syncError && (
                <div className="text-[12px] text-neutral-500 font-light leading-relaxed">
                  이 작업은 코드베이스(`src/themes/**/presets/*.ts`)에 정의된 템플릿 프리셋을 데이터베이스와 동기화합니다.
                  <br /><br />
                  - <strong>Preview Sync:</strong> 변경 사항을 미리 봅니다. (안전)
                  <br />
                  - <strong>Apply Sync:</strong> 실제 데이터베이스에 반영합니다. (관리자 권한 필요)
                </div>
              )}

              {isSyncing && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-neutral-200 border-t-[#7d000c] rounded-full animate-spin mb-4" />
                  <span className="text-[10px] uppercase tracking-widest text-neutral-400">Processing Sync...</span>
                </div>
              )}

              {syncSummary && (
                <div className="space-y-6">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                      <div className="text-[9px] uppercase text-neutral-400 mb-1">New</div>
                      <div className="text-xl font-light">{syncSummary.creates}</div>
                    </div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                      <div className="text-[9px] uppercase text-neutral-400 mb-1">Updated</div>
                      <div className="text-xl font-light">{syncSummary.updates}</div>
                    </div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                      <div className="text-[9px] uppercase text-neutral-400 mb-1">Errors</div>
                      <div className="text-xl font-light text-red-500">{syncSummary.errors}</div>
                    </div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                      <div className="text-[9px] uppercase text-neutral-400 mb-1">Unchanged</div>
                      <div className="text-xl font-light text-neutral-400">{syncSummary.noChange}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="text-[9px] font-medium uppercase tracking-widest text-neutral-400">Details:</span>
                    <div className="bg-neutral-900 p-4 font-mono text-[10px] text-white/70 overflow-x-auto max-h-[300px]">
                      {syncSummary.details.map((d, i) => (
                        <div key={i} className="mb-2 last:mb-0">
                          <span className={`mr-2 ${
                            d.action === 'CREATE' ? 'text-green-400' :
                            d.action === 'UPDATE' ? 'text-blue-400' :
                            d.action === 'ERROR' ? 'text-red-400' :
                            'text-neutral-500'
                          }`}>[{d.action}]</span>
                          <span className="font-bold">{d.slug}</span>
                          {d.changes && d.changes.map((c, j) => (
                            <div key={j} className="ml-14 text-white/40">↳ {c}</div>
                          ))}
                          {d.errors && d.errors.map((e, j) => (
                            <div key={j} className="ml-14 text-red-400/60">↳ {e}</div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-8 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  setShowSyncModal(false);
                  setSyncSummary(null);
                  setSyncError(null);
                }}
                className="text-[10px] uppercase tracking-widest font-medium text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
              >
                Close
              </button>
              <div className="flex gap-4">
                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={() => handleSync(true)}
                  className="px-8 py-3 border border-black dark:border-white text-[10px] uppercase tracking-widest font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors disabled:opacity-40"
                >
                  Preview Sync
                </button>
                {canPublish && (
                  <button
                    type="button"
                    disabled={isSyncing}
                    onClick={() => handleSync(false)}
                    className="px-10 py-3 bg-[#7d000c] text-white text-[10px] uppercase tracking-widest font-medium hover:opacity-80 transition-opacity disabled:opacity-40"
                  >
                    Apply Sync
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
