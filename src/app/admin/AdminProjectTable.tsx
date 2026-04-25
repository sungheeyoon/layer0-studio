'use client';

import { UserSite } from '@/domain/entities/user-site.entity';
import { adminUpdateSiteDomainAction, terminateSiteAction, updateSiteStatusAction } from './actions';

interface AdminProjectTableProps {
  sites: UserSite[];
}

export default function AdminProjectTable({ sites }: AdminProjectTableProps) {
  const handleConfigureDomain = async (siteId: string, currentDomain: string | null) => {
    const domain = prompt('Enter domain:', currentDomain || '');
    if (domain === null) return;
    const result = await adminUpdateSiteDomainAction(siteId, domain);
    if (result.error) {
      alert(`Error: ${result.error}`);
    }
  };

  const handleTerminate = async (siteId: string) => {
    if (!confirm('Are you sure you want to terminate this site? This action cannot be undone.')) return;
    const result = await terminateSiteAction(siteId);
    if (result.error) {
      alert(`Error: ${result.error}`);
    }
  };

  const handleToggleStatus = async (siteId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const result = await updateSiteStatusAction(siteId, newStatus as 'draft' | 'active' | 'suspended');
    if (result.error) {
      alert(`Error: ${result.error}`);
    }
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
            <th className="py-4 font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase text-neutral-400">
              PROJECT_ID
            </th>
            <th className="py-4 font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase text-neutral-400">
              NAME
            </th>
            <th className="py-4 font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase text-neutral-400">
              DOMAIN
            </th>
            <th className="py-4 font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase text-neutral-400">
              TEMPLATE_REF
            </th>
            <th className="py-4 font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase text-neutral-400">
              STATUS
            </th>
            <th className="py-4 font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase text-neutral-400 text-right">
              ACTIONS
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10">
          {sites.map((site) => {
            const shortId = `#${site.id.slice(0, 8).toUpperCase()}`;
            const isPending = site.status === 'draft';

            return (
              <tr key={site.id} className="group hover:bg-surface-container-low transition-colors">
                <td className="py-6 font-body font-[300] text-xs tabular-nums tracking-tighter">
                  {shortId}
                </td>
                <td className="py-6 font-body font-[500] text-sm tracking-tight">
                  {site.siteName}
                </td>
                <td className="py-6 font-body font-[300] text-xs text-neutral-500">
                  {site.domain || '-'}
                </td>
                <td className="py-6 font-body font-[300] text-[10px] tracking-widest text-neutral-400">
                  {site.templateId ? `TPL_${site.templateId.slice(0, 6).toUpperCase()}` : 'CUSTOM'}
                </td>
                <td className="py-6">
                  <div className="flex items-center gap-2">
                    {isPending && <div className="w-1 h-1 bg-tertiary"></div>}
                    <button
                      onClick={() => handleToggleStatus(site.id, site.status)}
                      className={`font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase ${
                        isPending
                          ? 'text-tertiary'
                          : site.status === 'suspended'
                            ? 'text-red-500'
                            : 'text-neutral-500'
                      } hover:underline underline-offset-4`}
                    >
                      {site.status === 'draft' ? 'PENDING_DEPLOY' : site.status === 'active' ? 'ACTIVE' : 'SUSPENDED'}
                    </button>
                  </div>
                </td>
                <td className="py-6 text-right">
                  <div className="flex justify-end gap-4 opacity-40 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleConfigureDomain(site.id, site.domain)}
                      className="font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase hover:underline underline-offset-4"
                    >
                      CONFIGURE_DOMAIN
                    </button>
                    <button
                      onClick={() => handleTerminate(site.id)}
                      className="font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase text-error hover:underline underline-offset-4"
                    >
                      TERMINATE
                    </button>
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
