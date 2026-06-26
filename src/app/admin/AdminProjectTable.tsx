'use client';

import { UserSite } from '@/domain/entities/user-site.entity';
import { useState } from 'react';
import { adminUpdateSiteDomainAction, terminateSiteAction, updateSiteStatusAction } from './actions';
import { getAdminDomainError, getAdminActionError } from '@/lib/errors/messages';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AdminProjectTableProps {
  sites: UserSite[];
}

export default function AdminProjectTable({ sites: initialSites }: AdminProjectTableProps) {
  const [sites, setSites] = useState(initialSites);
  const [editingDomain, setEditingDomain] = useState<{ siteId: string; value: string } | null>(null);
  const [savingDomainId, setSavingDomainId] = useState<string | null>(null);
  const [domainError, setDomainError] = useState<{ siteId: string; message: string } | null>(null);
  const [confirmTerminateId, setConfirmTerminateId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<{ siteId: string; message: string } | null>(null);

  const handleSaveDomain = async (siteId: string) => {
    if (!editingDomain || editingDomain.siteId !== siteId) return;
    setSavingDomainId(siteId);
    setDomainError(null);
    const result = await adminUpdateSiteDomainAction(siteId, editingDomain.value);
    if ('error' in result) {
      setDomainError({ siteId, message: getAdminDomainError(result.error) });
    } else {
      setSites(prev => prev.map(s => s.id === siteId ? { ...s, domain: editingDomain.value || null } : s));
      setEditingDomain(null);
    }
    setSavingDomainId(null);
  };

  const handleTerminate = async (siteId: string) => {
    setProcessingId(siteId);
    setActionError(null);
    const result = await terminateSiteAction(siteId);
    if ('error' in result) {
      setActionError({ siteId, message: getAdminActionError(result.error) });
    } else {
      setSites(prev => prev.filter(s => s.id !== siteId));
    }
    setConfirmTerminateId(null);
    setProcessingId(null);
  };

  const handleToggleStatus = async (siteId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setProcessingId(siteId);
    setActionError(null);
    const result = await updateSiteStatusAction(siteId, newStatus as 'draft' | 'active' | 'suspended');
    if ('error' in result) {
      setActionError({ siteId, message: getAdminActionError(result.error) });
    } else {
      setSites(prev => prev.map(s => s.id === siteId ? { ...s, status: newStatus as UserSite['status'] } : s));
    }
    setProcessingId(null);
  };

  if (sites.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-20 text-center">
        <p className="text-sm text-muted-foreground">No projects deployed yet.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-4 py-3 text-xs font-medium text-muted-foreground">ID</th>
            <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Name</th>
            <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Domain</th>
            <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Template</th>
            <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sites.map((site) => {
            const shortId = `#${site.id.slice(0, 8)}`;
            const isEditingThisDomain = editingDomain?.siteId === site.id;
            const isConfirmingTerminate = confirmTerminateId === site.id;
            const isProcessing = processingId === site.id;
            const isSavingThisDomain = savingDomainId === site.id;
            const thisDomainError = domainError?.siteId === site.id ? domainError.message : null;
            const thisActionError = actionError?.siteId === site.id ? actionError.message : null;
            const statusVariant =
              site.status === 'active' ? 'default' : site.status === 'suspended' ? 'destructive' : 'outline';
            const statusLabel =
              site.status === 'draft' ? 'Pending' : site.status === 'active' ? 'Active' : 'Suspended';

            return (
              <tr key={site.id} className="group border-b border-border align-top last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-4 font-mono text-xs tabular-nums text-muted-foreground">{shortId}</td>
                <td className="px-4 py-4 text-sm font-medium">{site.siteName}</td>
                <td className="px-4 py-4">
                  {isEditingThisDomain ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Input
                          autoFocus
                          type="text"
                          value={editingDomain.value}
                          onChange={(e) => setEditingDomain({ siteId: site.id, value: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveDomain(site.id);
                            if (e.key === 'Escape') { setEditingDomain(null); setDomainError(null); }
                          }}
                          className="h-8 w-36 text-xs"
                          placeholder="domain-slug"
                        />
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => handleSaveDomain(site.id)}
                          disabled={isSavingThisDomain}
                        >
                          {isSavingThisDomain ? '...' : 'Save'}
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          className="text-muted-foreground"
                          onClick={() => { setEditingDomain(null); setDomainError(null); }}
                        >
                          Cancel
                        </Button>
                      </div>
                      {thisDomainError && (
                        <p className="text-xs text-destructive">{thisDomainError}</p>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">{site.domain || '-'}</span>
                  )}
                </td>
                <td className="px-4 py-4 font-mono text-xs text-muted-foreground">
                  {site.templateId ? site.templateId.slice(0, 8) : 'custom'}
                </td>
                <td className="px-4 py-4">
                  <button
                    onClick={() => handleToggleStatus(site.id, site.status)}
                    disabled={isProcessing}
                    title="Toggle active / suspended"
                    className="disabled:opacity-50"
                  >
                    <Badge variant={statusVariant}>{statusLabel}</Badge>
                  </button>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex flex-col items-end gap-1">
                    {isConfirmingTerminate ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Confirm?</span>
                        <Button
                          size="xs"
                          variant="destructive"
                          onClick={() => handleTerminate(site.id)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? '...' : 'Yes'}
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => setConfirmTerminateId(null)}
                        >
                          No
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => {
                            setEditingDomain({ siteId: site.id, value: site.domain || '' });
                            setDomainError(null);
                          }}
                        >
                          Configure domain
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => { setConfirmTerminateId(site.id); setActionError(null); }}
                        >
                          Terminate
                        </Button>
                      </div>
                    )}
                    {thisActionError && (
                      <p className="text-xs text-destructive">{thisActionError}</p>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
