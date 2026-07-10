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
      setDeleteError({ id, message: `삭제 실패: ${result.error}` });
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
          <h2 className="text-sm font-semibold tracking-tight">템플릿</h2>
          <span className="text-xs text-muted-foreground tabular-nums">
            총 {templates.length}개
          </span>
        </div>

        {/* Sync Controls */}
        <div className="mb-6 rounded-lg border border-border bg-card p-4">
          <span className="text-xs font-medium text-muted-foreground">
            코드 동기화 (긴급용)
          </span>
          <p className="mt-1 mb-4 text-xs text-muted-foreground">
            등록은 프로덕션 배포 후 자동으로 실행됩니다. 배포 웹훅이 실패한 경우 등
            예외 상황에서만 사용하세요.
          </p>
          <Button size="sm" variant="outline" className="w-full" onClick={() => setShowSyncModal(true)}>
            강제 재동기화
          </Button>
        </div>

        <div className="flex items-center gap-2 border-b border-border pb-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">필터: 전체 카테고리</span>
        </div>
      </div>

      <div className="space-y-3 px-8 pb-12">
        {templates.length === 0 && (
          <p className="pt-4 text-xs text-muted-foreground">
            아직 템플릿이 없습니다. 첫 번째 템플릿을 만들어 시작하세요.
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
                      {isPresetSlug(template.slug) ? '코드' : '수동'}
                    </Badge>
                    {isActive ? (
                      <Badge>활성</Badge>
                    ) : (
                      <Badge variant="outline">
                        {template.status === 'draft' ? '초안' : '보관됨'}
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div
                    className="mt-3 flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Activate (publish) — the live publish decision, gated by
                        canPublishTemplates (ADR-0012 §5). Shown on draft rows. */}
                    {canPublish && template.status === 'draft' && (
                      <Button
                        size="xs"
                        disabled={activatingId === template.id}
                        onClick={() => setConfirmActivateId(template.id)}
                      >
                        <Rocket className="h-3 w-3" />
                        {activatingId === template.id ? '활성화 중...' : '활성화'}
                      </Button>
                    )}
                    {/* Secondary actions — revealed on hover to keep the list calm. */}
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button size="xs" variant="ghost" onClick={() => onEdit(template)}>
                      편집
                    </Button>
                    {/* Archive / Revert — takedown & re-publish, gated by
                        canPublishTemplates (ADR-0012 §5). */}
                    {canPublish && template.status !== 'archived' && (
                      <Button
                        size="xs"
                        variant="ghost"
                        className="text-muted-foreground"
                        onClick={() => setConfirmArchiveId(template.id)}
                      >
                        보관
                      </Button>
                    )}
                    {canPublish && template.status === 'archived' && (
                      <Button
                        size="xs"
                        variant="ghost"
                        disabled={revertingId === template.id}
                        onClick={() => handleRevertToDraft(template.id)}
                      >
                        {revertingId === template.id ? '되돌리는 중...' : '초안으로 되돌리기'}
                      </Button>
                    )}
                    <Button
                      size="xs"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => { setConfirmDeleteId(template.id); setDeleteError(null); }}
                    >
                      삭제
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
            <AlertDialogTitle>템플릿을 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.name}
              <br />
              이 작업은 되돌릴 수 없습니다. 이미 이 템플릿으로 만들어진 사이트에는 영향을 주지 않습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError?.id === confirmDeleteId && deleteError && (
            <p className="text-xs text-destructive">{deleteError.message}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingId === confirmDeleteId}>취소</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={deletingId === confirmDeleteId}
              onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
            >
              {deletingId === confirmDeleteId ? '삭제 중...' : '영구 삭제'}
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
            <AlertDialogTitle>템플릿을 보관할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              {archiveTarget?.name}
              <br />
              이 템플릿은 공개 카탈로그에서 숨겨집니다. 리스트에서 &quot;초안으로 되돌리기&quot;를 클릭하거나, 편집 → 초안 저장으로 수정 상태로 되돌릴 수 있습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={archivingId === confirmArchiveId}>취소</AlertDialogCancel>
            <AlertDialogAction
              disabled={archivingId === confirmArchiveId}
              onClick={() => confirmArchiveId && handleArchive(confirmArchiveId)}
            >
              {archivingId === confirmArchiveId ? '보관 중...' : '보관'}
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
            <AlertDialogTitle>템플릿을 활성화할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              {activateTarget?.name}
              <br />
              상태를 <strong>활성</strong>으로 바꿔 공개 카탈로그에 노출합니다. 사용자가 이 템플릿으로 사이트를 만들 수 있게 됩니다. 언제든 &quot;보관&quot;으로 다시 숨길 수 있습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={activatingId === confirmActivateId}>취소</AlertDialogCancel>
            <AlertDialogAction
              disabled={activatingId === confirmActivateId}
              onClick={(e) => { e.preventDefault(); if (confirmActivateId) handleActivate(confirmActivateId); }}
            >
              {activatingId === confirmActivateId ? '활성화 중...' : '활성화'}
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
            <DialogTitle>강제 재동기화 (긴급용)</DialogTitle>
            <DialogDescription>
              코드 프리셋을 데이터베이스에 수동으로 다시 등록합니다. 보통은 프로덕션
              배포 후 자동으로 실행되며, 예외 상황에서만 사용하세요.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-2">
            {syncError && (
              <div className="mb-6 rounded-md bg-destructive/10 p-4 text-xs text-destructive">
                오류: {syncError}
              </div>
            )}

            {!syncSummary && !isSyncing && !syncError && (
              <div className="text-xs leading-relaxed text-muted-foreground">
                이 작업은 코드베이스에 정의된 템플릿 프리셋을 데이터베이스와 동기화합니다.
                <br /><br />
                - <strong>동기화 미리보기:</strong> 변경 사항을 미리 봅니다. (안전)
                <br />
                - <strong>동기화 적용:</strong> 실제 데이터베이스에 반영합니다. (관리자 권한 필요)
              </div>
            )}

            {isSyncing && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="mb-4 h-6 w-6 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">동기화 처리 중...</span>
              </div>
            )}

            {syncSummary && (
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: '신규', value: syncSummary.creates },
                    { label: '업데이트', value: syncSummary.updates },
                    { label: '오류', value: syncSummary.errors, danger: true },
                    { label: '변경 없음', value: syncSummary.noChange, muted: true },
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
                  <span className="text-xs font-medium text-muted-foreground">상세 내역</span>
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
              동기화 미리보기
            </Button>
            {canPublish && (
              <Button disabled={isSyncing} onClick={() => handleSync(false)}>
                동기화 적용
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
