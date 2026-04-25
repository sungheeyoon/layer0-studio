import { listAllSitesAction } from './actions';
import AdminProjectTable from './AdminProjectTable';

export default async function AdminPage() {
  const result = await listAllSitesAction();

  if (!Array.isArray(result)) {
    return (
      <main className="px-12 min-h-[calc(100vh-48px)] pb-20">
        <div className="p-20 text-center border border-dashed border-outline-variant/30">
          <h1 className="font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase text-error mb-2">
            SYSTEM_ERROR
          </h1>
          <p className="font-body font-[300] text-sm text-on-surface-variant">
            Failed to retrieve registry data: {result.error}
          </p>
        </div>
      </main>
    );
  }

  const sites = result;
  const pendingCount = sites.filter((s) => s.status === 'draft').length;

  return (
    <main className="px-12 min-h-[calc(100vh-48px)] pb-20">
      {/* Header Section */}
      <div className="grid grid-cols-12 gap-8 mb-16">
        <div className="col-span-8">
          <h1 className="text-[3.5rem] font-headline font-[100] tracking-[0.02em] leading-none mb-4 uppercase">
            PROJECT_REGISTRY
          </h1>
          <p className="font-body font-[300] text-sm tracking-[0.05em] text-on-surface-variant max-w-md">
            Centralized control interface for all active architectural nodes and
            distributed deployment vectors within the current revision cycle.
          </p>
        </div>
        <div className="col-span-4 flex flex-col justify-end items-end">
          <div className="flex flex-col items-end gap-2">
            <span className="font-label font-[500] text-[0.6875rem] uppercase tracking-[0.1em] text-neutral-400">
              NODES_STATUS
            </span>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-tertiary"></div>
              <span className="font-label font-[500] text-[0.6875rem] uppercase tracking-[0.1em]">
                {pendingCount} NODES_PENDING
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Registry Controls */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-outline-variant/20">
        <h2 className="font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase">
          ACTIVE_NODES [{sites.length}]
        </h2>
        <button className="flex items-center gap-2 border border-outline px-6 py-2 hover:bg-neutral-100 transition-colors">
          <span className=" text-xs" data-icon="add">
            add
          </span>
          <span className="font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase">
            DEPLOY_NEW_PROJECT
          </span>
        </button>
      </div>

      {/* Dynamic Data Grid */}
      <AdminProjectTable sites={sites} />

      {/* System Visualization (Asymmetric Component) */}
      <div className="mt-24 grid grid-cols-12 gap-8 border-t border-outline-variant/20 pt-12">
        <div className="col-span-4 border-r border-outline-variant/20 pr-8">
          <span className="font-label font-[500] text-[0.6875rem] tracking-[0.2em] uppercase text-neutral-400 mb-4 block">
            RESOURCES_ALLOCATION
          </span>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="font-body font-[300] text-xs uppercase tracking-widest">
                  TOTAL_SITES
                </span>
                <span className="font-body font-[300] text-[10px] tabular-nums">
                  {sites.length}
                </span>
              </div>
              <div className="h-1 bg-neutral-200 w-full relative">
                <div className="absolute top-0 left-0 h-full bg-neutral-900" style={{ width: `${Math.min(sites.length * 10, 100)}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="font-body font-[300] text-xs uppercase tracking-widest">
                  ACTIVE_RATE
                </span>
                <span className="font-body font-[300] text-[10px] tabular-nums">
                  {sites.length > 0 ? Math.round((sites.filter(s => s.status === 'active').length / sites.length) * 100) : 0}%
                </span>
              </div>
              <div className="h-1 bg-neutral-200 w-full relative">
                <div className="absolute top-0 left-0 h-full bg-neutral-900" style={{ width: `${sites.length > 0 ? (sites.filter(s => s.status === 'active').length / sites.length) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-8 relative">
          <div className="aspect-[21/9] bg-neutral-100 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
              <span className="font-label font-[500] text-[0.6875rem] tracking-[0.5em] uppercase text-neutral-300">
                NODE_TOPOLOGY_MAP
              </span>
              <div className="mt-4 flex gap-8">
                {sites.slice(0, 5).map((site) => (
                  <div key={site.id} className="w-16 h-16 border border-neutral-300 flex items-center justify-center">
                    <div className={`w-1 h-1 bg-tertiary ${site.status !== 'active' ? 'opacity-20' : ''}`}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
