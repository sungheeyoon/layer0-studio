'use client';

import { UserSite } from '@/domain/entities/user-site.entity';
import { useState } from 'react';
import { adminUpdateSiteDomainAction, terminateSiteAction, updateSiteStatusAction } from './actions';
import { getAdminDomainError, getAdminActionError } from '@/lib/errors/messages';

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
    if (result.error) {
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
    if (result.error) {
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
    if (result.error) {
      setActionError({ siteId, message: getAdminActionError(result.error) });
    } else {
      setSites(prev => prev.map(s => s.id === siteId ? { ...s, status: newStatus as UserSite['status'] } : s));
    }
    setProcessingId(null);
  };

  if (sites.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="font-body font-[300] text-sm text-on-surface-variant">
          No projects deployed yet.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-outline-variant/30">
            <th className="py-4 font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase text-neutral-400">PROJECT_ID</th>
            <th className="py-4 font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase text-neutral-400">NAME</th>
            <th className="py-4 font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase text-neutral-400">DOMAIN</th>
            <th className="py-4 font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase text-neutral-400">TEMPLATE_REF</th>
            <th className="py-4 font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase text-neutral-400">STATUS</th>
            <th className="py-4 font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase text-neutral-400 text-right">ACTIONS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10">
          {sites.map((site) => {
            const shortId = `#${site.id.slice(0, 8).toUpperCase()}`;
            const isPending = site.status === 'draft';
            const isEditingThisDomain = editingDomain?.siteId === site.id;
            const isConfirmingTerminate = confirmTerminateId === site.id;
            const isProcessing = processingId === site.id;
            const isSavingThisDomain = savingDomainId === site.id;
            const thisDomainError = domainError?.siteId === site.id ? domainError.message : null;
            const thisActionError = actionError?.siteId === site.id ? actionError.message : null;

            return (
              <tr key={site.id} className="group hover:bg-surface-container-low transition-colors align-top">
                <td className="py-6 font-body font-[300] text-xs tabular-nums tracking-tighter">{shortId}</td>
                <td className="py-6 font-body font-[500] text-sm tracking-tight">{site.siteName}</td>
                <td className="py-6">
                  {isEditingThisDomain ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          type="text"
                          value={editingDomain.value}
                          onChange={(e) => setEditingDomain({ siteId: site.id, value: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveDomain(site.id);
                            if (e.key === 'Escape') { setEditingDomain(null); setDomainError(null); }
                          }}
                          className="bg-transparent border-b border-primary text-xs font-light w-28 focus:outline-none py-0.5"
                          placeholder="domain-slug"
                        />
                        <button
                          onClick={() => handleSaveDomain(site.id)}
                          disabled={isSavingThisDomain}
                          className="text-[9px] font-medium uppercase text-primary hover:underline disabled:opacity-50"
                        >
                          {isSavingThisDomain ? '...' : 'Save'}
                        </button>
                        <button
                          onClick={() => { setEditingDomain(null); setDomainError(null); }}
                          className="text-[9px] text-neutral-400 hover:text-black"
                        >
                          ✕
                        </button>
                      </div>
                      {thisDomainError && (
                        <p className="text-[9px] text-red-500">{thisDomainError}</p>
                      )}
                    </div>
                  ) : (
                    <span className="font-body font-[300] text-xs text-neutral-500">{site.domain || '-'}</span>
                  )}
                </td>
                <td className="py-6 font-body font-[300] text-[10px] tracking-widest text-neutral-400">
                  {site.templateId ? `TPL_${site.templateId.slice(0, 6).toUpperCase()}` : 'CUSTOM'}
                </td>
                <td className="py-6">
                  <div className="flex items-center gap-2">
                    {isPending && <div className="w-1 h-1 bg-tertiary"></div>}
                    <button
                      onClick={() => handleToggleStatus(site.id, site.status)}
                      disabled={isProcessing}
                      className={`font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase ${
                        isPending ? 'text-tertiary' : site.status === 'suspended' ? 'text-red-500' : 'text-neutral-500'
                      } hover:underline underline-offset-4 disabled:opacity-50`}
                    >
                      {site.status === 'draft' ? 'PENDING_DEPLOY' : site.status === 'active' ? 'ACTIVE' : 'SUSPENDED'}
                    </button>
                  </div>
                </td>
                <td className="py-6 text-right">
                  <div className="flex flex-col items-end gap-1">
                    {isConfirmingTerminate ? (
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] uppercase text-neutral-400 tracking-widest">Confirm?</span>
                        <button
                          onClick={() => handleTerminate(site.id)}
                          disabled={isProcessing}
                          className="font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase text-error hover:underline disabled:opacity-50"
                        >
                          {isProcessing ? '...' : 'Yes'}
                        </button>
                        <button
                          onClick={() => setConfirmTerminateId(null)}
                          className="font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase text-neutral-400 hover:underline"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-4 opacity-40 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingDomain({ siteId: site.id, value: site.domain || '' });
                            setDomainError(null);
                          }}
                          className="font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase hover:underline underline-offset-4"
                        >
                          CONFIGURE_DOMAIN
                        </button>
                        <button
                          onClick={() => { setConfirmTerminateId(site.id); setActionError(null); }}
                          className="font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase text-error hover:underline underline-offset-4"
                        >
                          TERMINATE
                        </button>
                      </div>
                    )}
                    {thisActionError && (
                      <p className="text-[9px] text-red-500">{thisActionError}</p>
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
