'use client';

import { useState } from 'react';
import { Filter, ImageIcon, Loader2, Rocket } from 'lucide-react';
import { Template } from '@/domain/entities/template.entity';
import { deleteTemplateAction, archiveTemplateAction, revertToDraftAction, activateTemplateAction, syncTemplatesAction } from './actions';
import { isPresetSlug } from '@/templates/_generated';
import { SyncSummary } from '@/lib/template/sync';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  const [confirmActivateId, setConfirmActivateId] = useState<string | null>(null);
  const [activatingId, setActivatingId] = useState<string | null>(null);

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

  const handleActivate = async (id: string) => {
    setActivatingId(id);
    const result = await activateTemplateAction(id);
    if (result && !('error' in result)) {
      setConfirmActivateId(null);
      onArchive?.(id); // reuse callback to trigger list refresh
    }
    setActivatingId(null);
  };

  const deleteTarget = templates.find((t) => t.id === confirmDeleteId) ?? null;
  const archiveTarget = templates.find((t) => t.id === confirmArchiveId) ?? null;
  const activateTarget = templates.find((t) => t.id === confirmActivateId) ?? null;

  return (
    <section className="col-span-4 overflow-y-auto border-r border-border bg-muted/30">
      <div className="sticky top-0 z-10 bg-muted/30 p-8 pb-4 backdrop-blur">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-sm font-semibold tracking-tight">Templates</h2>
          <span className="text-xs text-muted-foreground tabular-nums">
            {templates.length} total
          </span>
        </div>

        {/* Sync Controls */}
        <div className="mb-6 rounded-lg border border-border bg-card p-4">
          <span className="text-xs font-medium text-muted-foreground">
            Code synchronization
          </span>
          <p className="mt-1 mb-4 text-xs text-muted-foreground">
            Sync preset templates from the codebase to the database.
          </p>
          <Button size="sm" className="w-full" onClick={() => setShowSyncModal(true)}>
            Sync from code
          </Button>
        </div>

        <div className="flex items-center gap-2 border-b border-border pb-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Filter: All categories</span>
        </div>
      </div>

      <div className="space-y-3 px-8 pb-12">
        {templates.length === 0 && (
          <p className="pt-4 text-xs text-muted-foreground">
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
              className={`group cursor-pointer rounded-lg border bg-card p-4 transition-colors ${
                isSelected ? 'border-primary' : 'border-border hover:border-foreground/30'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Thumbnail */}
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                  {template.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={template.name}
                      className="h-full w-full object-cover object-top"
                      src={template.thumbnailUrl}
                    />
                  ) : (
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {template.name}
                  </span>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <Badge variant="outline">{template.category}</Badge>
                    <Badge variant={isPresetSlug(template.slug) ? 'secondary' : 'outline'}>
                      {isPresetSlug(template.slug) ? 'Code' : 'Manual'}
                    </Badge>
                    {isActive ? (
                      <Badge>Active</Badge>
                    ) : (
                      <Badge variant="outline">
                        {template.status === 'draft' ? 'Draft' : 'Archived'}
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div
                    className="mt-3 flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Activate (publish) — always visible on draft rows so the
                        publish step isn't buried in the editor's "Deploy" button. */}
                    {template.status === 'draft' && (
                      <Button
                        size="xs"
                        disabled={activatingId === template.id}
                        onClick={() => setConfirmActivateId(template.id)}
                      >
                        <Rocket className="h-3 w-3" />
                        {activatingId === template.id ? 'Activating...' : 'Activate'}
                      </Button>
                    )}
                    {/* Secondary actions — revealed on hover to keep the list calm. */}
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button size="xs" variant="ghost" onClick={() => onEdit(template)}>
                      Edit
                    </Button>
                    {template.status !== 'archived' && (
                      <Button
                        size="xs"
                        variant="ghost"
                        className="text-muted-foreground"
                        onClick={() => setConfirmArchiveId(template.id)}
                      >
                        Archive
                      </Button>
                    )}
                    {template.status === 'archived' && (
                      <Button
                        size="xs"
                        variant="ghost"
                        disabled={revertingId === template.id}
                        onClick={() => handleRevertToDraft(template.id)}
                      >
                        {revertingId === template.id ? 'Reverting...' : 'Revert to draft'}
                      </Button>
                    )}
                    <Button
                      size="xs"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => { setConfirmDeleteId(template.id); setDeleteError(null); }}
                    >
                      Delete
                    </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => { if (!open) { setConfirmDeleteId(null); setDeleteError(null); } }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete template?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.name}
              <br />
              This action cannot be undone. Sites already created from this template will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError?.id === confirmDeleteId && deleteError && (
            <p className="text-xs text-destructive">{deleteError.message}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingId === confirmDeleteId}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={deletingId === confirmDeleteId}
              onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
            >
              {deletingId === confirmDeleteId ? 'Deleting...' : 'Delete permanently'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive confirmation */}
      <AlertDialog
        open={!!confirmArchiveId}
        onOpenChange={(open) => { if (!open) setConfirmArchiveId(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive template?</AlertDialogTitle>
            <AlertDialogDescription>
              {archiveTarget?.name}
              <br />
              이 템플릿은 공개 카탈로그에서 숨겨집니다. 리스트에서 &quot;Revert to draft&quot;를 클릭하거나, Edit → Save draft로 수정 상태로 되돌릴 수 있습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={archivingId === confirmArchiveId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={archivingId === confirmArchiveId}
              onClick={() => confirmArchiveId && handleArchive(confirmArchiveId)}
            >
              {archivingId === confirmArchiveId ? 'Archiving...' : 'Archive'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activate confirmation */}
      <AlertDialog
        open={!!confirmActivateId}
        onOpenChange={(open) => { if (!open) setConfirmActivateId(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate template?</AlertDialogTitle>
            <AlertDialogDescription>
              {activateTarget?.name}
              <br />
              상태를 <strong>Active</strong>로 바꿔 공개 카탈로그에 노출합니다. 사용자가 이 템플릿으로 사이트를 만들 수 있게 됩니다. 언제든 &quot;Archive&quot;로 다시 숨길 수 있습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={activatingId === confirmActivateId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={activatingId === confirmActivateId}
              onClick={(e) => { e.preventDefault(); if (confirmActivateId) handleActivate(confirmActivateId); }}
            >
              {activatingId === confirmActivateId ? 'Activating...' : 'Activate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Sync Modal */}
      <Dialog
        open={showSyncModal}
        onOpenChange={(open) => {
          setShowSyncModal(open);
          if (!open) { setSyncSummary(null); setSyncError(null); }
        }}
      >
        <DialogContent className="flex max-h-[80vh] flex-col sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Sync presets from source</DialogTitle>
            <DialogDescription>
              Reflect template presets defined in the codebase to the database.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-2">
            {syncError && (
              <div className="mb-6 rounded-md bg-destructive/10 p-4 text-xs text-destructive">
                Error: {syncError}
              </div>
            )}

            {!syncSummary && !isSyncing && !syncError && (
              <div className="text-xs leading-relaxed text-muted-foreground">
                이 작업은 코드베이스에 정의된 템플릿 프리셋을 데이터베이스와 동기화합니다.
                <br /><br />
                - <strong>Preview sync:</strong> 변경 사항을 미리 봅니다. (안전)
                <br />
                - <strong>Apply sync:</strong> 실제 데이터베이스에 반영합니다. (관리자 권한 필요)
              </div>
            )}

            {isSyncing && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="mb-4 h-6 w-6 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Processing sync...</span>
              </div>
            )}

            {syncSummary && (
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'New', value: syncSummary.creates },
                    { label: 'Updated', value: syncSummary.updates },
                    { label: 'Errors', value: syncSummary.errors, danger: true },
                    { label: 'Unchanged', value: syncSummary.noChange, muted: true },
                  ].map((cell) => (
                    <div key={cell.label} className="rounded-md border border-border bg-card p-3">
                      <div className="mb-1 text-xs text-muted-foreground">{cell.label}</div>
                      <div className={`text-xl font-semibold ${cell.danger ? 'text-destructive' : cell.muted ? 'text-muted-foreground' : ''}`}>
                        {cell.value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground">Details</span>
                  <div className="max-h-[300px] overflow-x-auto rounded-md bg-muted p-4 font-mono text-xs">
                    {syncSummary.details.map((d, i) => (
                      <div key={i} className="mb-2 last:mb-0">
                        <span className={`mr-2 ${
                          d.action === 'CREATE' ? 'text-primary' :
                          d.action === 'ERROR' ? 'text-destructive' :
                          d.action === 'UPDATE' ? 'text-foreground' :
                          'text-muted-foreground'
                        }`}>[{d.action}]</span>
                        <span className="font-bold">{d.slug}</span>
                        {d.changes && d.changes.map((c, j) => (
                          <div key={j} className="ml-14 text-muted-foreground">↳ {c}</div>
                        ))}
                        {d.errors && d.errors.map((e, j) => (
                          <div key={j} className="ml-14 text-destructive">↳ {e}</div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              disabled={isSyncing}
              onClick={() => handleSync(true)}
            >
              Preview sync
            </Button>
            {canPublish && (
              <Button disabled={isSyncing} onClick={() => handleSync(false)}>
                Apply sync
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
