'use client';

import { useState } from 'react';
import { updateSiteDomainAction } from '@/app/(authenticated)/dashboard/editor/actions';
import { getDomainError } from '@/lib/errors/messages';
import { useDashboardData } from '../DashboardDataProvider';

export default function DomainsClient() {
  const { sites, patchSite } = useDashboardData();
  const [editingDomain, setEditingDomain] = useState<{ siteId: string; value: string } | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [domainError, setDomainError] = useState<{ siteId: string; message: string } | null>(null);

  const handleSaveDomain = async (siteId: string) => {
    if (!editingDomain || editingDomain.siteId !== siteId) return;
    setSavingId(siteId);
    setDomainError(null);

    const result = await updateSiteDomainAction(siteId, editingDomain.value);
    if (result && 'error' in result) {
      setDomainError({ siteId, message: getDomainError(result.error) });
    } else if (result && 'domain' in result && result.domain) {
      patchSite(siteId, { domain: result.domain ?? null });
      setEditingDomain(null);
    }
    setSavingId(null);
  };

  return (
    <div className="space-y-4">
      {sites.length === 0 ? (
        <p className="text-outline font-light italic">No sites created yet.</p>
      ) : (
        sites.map((site) => {
          const isEditing = editingDomain?.siteId === site.id;
          const isSaving = savingId === site.id;
          const thisError = domainError?.siteId === site.id ? domainError.message : null;

          return (
            <div key={site.id} className="bg-surface border border-outline-variant p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:border-primary/30 group">
              <div className="space-y-1">
                <h3 className="font-['Inter'] font-medium text-lg tracking-tight group-hover:text-primary transition-colors">
                  {site.siteName}
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-medium px-2 py-0.5 uppercase tracking-widest bg-neutral-800 text-white">
                    {site.status}
                  </span>
                  <p className="text-outline text-xs font-light">
                    ID: <span className="font-mono text-[10px]">{site.id.slice(0, 8)}...</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:items-end gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-outline font-medium">Domain:</span>
                  <span className={`font-mono text-sm ${site.domain ? 'text-on-surface' : 'text-amber-500 italic'}`}>
                    {site.domain || 'no-domain-set'}
                  </span>
                </div>

                {isEditing ? (
                  <div className="flex flex-col items-end gap-2">
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
                        placeholder="new-domain-slug"
                        className="bg-surface border border-outline-variant px-3 py-1.5 text-sm font-light focus:outline-none focus:border-primary transition-colors w-48"
                      />
                      <button
                        onClick={() => handleSaveDomain(site.id)}
                        disabled={isSaving}
                        className="bg-primary text-on-primary px-4 py-1.5 text-[10px] uppercase tracking-widest font-medium hover:brightness-110 transition-all disabled:opacity-50"
                      >
                        {isSaving ? '...' : 'Save'}
                      </button>
                      <button
                        onClick={() => { setEditingDomain(null); setDomainError(null); }}
                        className="border border-outline px-4 py-1.5 text-[10px] uppercase tracking-widest font-medium hover:bg-surface-container transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                    {thisError && (
                      <p className="text-[10px] text-red-500 font-light">{thisError}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingDomain({ siteId: site.id, value: site.domain || '' });
                        setDomainError(null);
                      }}
                      className="bg-primary text-on-primary px-4 py-2 text-[10px] uppercase tracking-widest font-medium hover:brightness-110 transition-all"
                    >
                      Change Domain
                    </button>
                    {site.domain && (
                      <a
                        href={`/site/${site.domain}`}
                        target="_blank"
                        className="border border-outline px-4 py-2 text-[10px] uppercase tracking-widest font-medium hover:bg-surface-container transition-all"
                      >
                        View Site
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
