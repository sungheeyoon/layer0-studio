'use client';

import { useState } from 'react';
import { UserSite } from '@/domain/entities/user-site.entity';
import { updateSiteDomainAction } from '@/app/dashboard/editor/actions';

interface DomainsClientProps {
  initialSites: UserSite[];
}

export default function DomainsClient({ initialSites }: DomainsClientProps) {
  const [sites, setSites] = useState(initialSites);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleUpdateDomain = async (siteId: string, currentDomain: string | null) => {
    const newDomain = prompt('Enter new domain for this site:', currentDomain || '');
    if (newDomain === null) return;

    setUpdatingId(siteId);
    const result = await updateSiteDomainAction(siteId, newDomain);

    if (result && 'error' in result) {
      alert(`Failed to update domain: ${result.error}`);
    } else {
      setSites(prev => prev.map(s => s.id === siteId ? { ...s, domain: newDomain } : s));
    }
    setUpdatingId(null);
  };

  return (
    <div className="space-y-4">
      {sites.length === 0 ? (
        <p className="text-outline font-light italic">No sites created yet.</p>
      ) : (
        sites.map((site) => (
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

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateDomain(site.id, site.domain)}
                  disabled={updatingId === site.id}
                  className="bg-primary text-on-primary px-4 py-2 text-[10px] uppercase tracking-widest font-medium hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {updatingId === site.id ? 'Updating...' : 'Change Domain'}
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
            </div>
          </div>
        ))
      )}
    </div>
  );
}
