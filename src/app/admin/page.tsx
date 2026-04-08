export default function AdminPage() {
  return (
    <main className="ml-64 pt-24 px-12 min-h-screen pb-20">
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
                2 NODES_PENDING
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Registry Controls */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-outline-variant/20">
        <h2 className="font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase">
          ACTIVE_NODES
        </h2>
        <button className="flex items-center gap-2 border border-outline px-6 py-2 hover:bg-neutral-100 transition-colors">
          <span className="material-symbols-outlined text-xs" data-icon="add">
            add
          </span>
          <span className="font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase">
            DEPLOY_NEW_PROJECT
          </span>
        </button>
      </div>

      {/* Technical Data Grid */}
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
            {/* Row 1 */}
            <tr className="group hover:bg-surface-container-low transition-colors">
              <td className="py-6 font-body font-[300] text-xs tabular-nums tracking-tighter">
                #AX-992-01
              </td>
              <td className="py-6 font-body font-[500] text-sm tracking-tight">
                Cafe_Minimalist
              </td>
              <td className="py-6 font-body font-[300] text-xs text-neutral-500">
                cafe-min.com
              </td>
              <td className="py-6 font-body font-[300] text-[10px] tracking-widest text-neutral-400">
                BLUEPRINT_04
              </td>
              <td className="py-6">
                <div className="flex items-center gap-2">
                  <span className="font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase text-neutral-500">
                    ACTIVE
                  </span>
                </div>
              </td>
              <td className="py-6 text-right">
                <div className="flex justify-end gap-4 opacity-40 group-hover:opacity-100 transition-opacity">
                  <button className="font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase hover:underline underline-offset-4">
                    CONFIGURE_DOMAIN
                  </button>
                  <button className="font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase text-error hover:underline underline-offset-4">
                    TERMINATE
                  </button>
                </div>
              </td>
            </tr>
            {/* Row 2 (Pending) */}
            <tr className="group hover:bg-surface-container-low transition-colors">
              <td className="py-6 font-body font-[300] text-xs tabular-nums tracking-tighter">
                #AX-992-02
              </td>
              <td className="py-6 font-body font-[500] text-sm tracking-tight">
                Gallery_Frame_V2
              </td>
              <td className="py-6 font-body font-[300] text-xs text-neutral-500">
                frame-gallery.io
              </td>
              <td className="py-6 font-body font-[300] text-[10px] tracking-widest text-neutral-400">
                BLUEPRINT_01
              </td>
              <td className="py-6">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-tertiary"></div>
                  <span className="font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase text-tertiary">
                    PENDING_DEPLOY
                  </span>
                </div>
              </td>
              <td className="py-6 text-right">
                <div className="flex justify-end gap-4 opacity-40 group-hover:opacity-100 transition-opacity">
                  <button className="font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase hover:underline underline-offset-4">
                    CONFIGURE_DOMAIN
                  </button>
                  <button className="font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase text-error hover:underline underline-offset-4">
                    TERMINATE
                  </button>
                </div>
              </td>
            </tr>
            {/* Row 3 */}
            <tr className="group hover:bg-surface-container-low transition-colors">
              <td className="py-6 font-body font-[300] text-xs tabular-nums tracking-tighter">
                #AX-993-05
              </td>
              <td className="py-6 font-body font-[500] text-sm tracking-tight">
                Studio_Nexus_Core
              </td>
              <td className="py-6 font-body font-[300] text-xs text-neutral-500">
                nexus-core.studio
              </td>
              <td className="py-6 font-body font-[300] text-[10px] tracking-widest text-neutral-400">
                BLUEPRINT_09
              </td>
              <td className="py-6">
                <div className="flex items-center gap-2">
                  <span className="font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase text-neutral-500">
                    ACTIVE
                  </span>
                </div>
              </td>
              <td className="py-6 text-right">
                <div className="flex justify-end gap-4 opacity-40 group-hover:opacity-100 transition-opacity">
                  <button className="font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase hover:underline underline-offset-4">
                    CONFIGURE_DOMAIN
                  </button>
                  <button className="font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase text-error hover:underline underline-offset-4">
                    TERMINATE
                  </button>
                </div>
              </td>
            </tr>
            {/* Row 4 (Pending) */}
            <tr className="group hover:bg-surface-container-low transition-colors">
              <td className="py-6 font-body font-[300] text-xs tabular-nums tracking-tighter">
                #AX-994-11
              </td>
              <td className="py-6 font-body font-[500] text-sm tracking-tight">
                Urban_Draft_System
              </td>
              <td className="py-6 font-body font-[300] text-xs text-neutral-500">
                urban-draft.com
              </td>
              <td className="py-6 font-body font-[300] text-[10px] tracking-widest text-neutral-400">
                BLUEPRINT_04
              </td>
              <td className="py-6">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-tertiary"></div>
                  <span className="font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase text-tertiary">
                    PENDING_DEPLOY
                  </span>
                </div>
              </td>
              <td className="py-6 text-right">
                <div className="flex justify-end gap-4 opacity-40 group-hover:opacity-100 transition-opacity">
                  <button className="font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase hover:underline underline-offset-4">
                    CONFIGURE_DOMAIN
                  </button>
                  <button className="font-label font-[500] text-[0.6875rem] tracking-[0.1em] uppercase text-error hover:underline underline-offset-4">
                    TERMINATE
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

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
                  COMPUTE_POWER
                </span>
                <span className="font-body font-[300] text-[10px] tabular-nums">
                  74.2%
                </span>
              </div>
              <div className="h-1 bg-neutral-200 w-full relative">
                <div className="absolute top-0 left-0 h-full bg-neutral-900 w-[74.2%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="font-body font-[300] text-xs uppercase tracking-widest">
                  NETWORK_BANDWIDTH
                </span>
                <span className="font-body font-[300] text-[10px] tabular-nums">
                  22.8%
                </span>
              </div>
              <div className="h-1 bg-neutral-200 w-full relative">
                <div className="absolute top-0 left-0 h-full bg-neutral-900 w-[22.8%]"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-8 relative">
          <div className="aspect-[21/9] bg-neutral-100 flex items-center justify-center relative overflow-hidden">
            <img
              alt="Architectural abstraction"
              className="absolute inset-0 object-cover opacity-20 grayscale"
              data-alt="abstract architectural blueprint of a modern skyscraper facade with high contrast lighting and sharp technical lines grayscale style"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRxT4cKlDadxj9xPAx1PSoUKrH4E6c1SatmU296r2P5P45uKLm6L5F7f_S_Bi7CD6eaMRh-FdKzF6M2o18bss8oVsbdo8PX7lCySEJBXm3Zq6PdGQbDIwBzpwDjqQd89UvZFM8MrAZpPAEfqcnhbKFOsyhJSQ3D-4HCxhXX1ekm6hMYPjzNABOcgYB6r6HYaU7-6kpC6XFRJ2wEb6Boje6srrAX5iob7Kn6d1_IW30PJLI8ZurJsM1HJmdQhKUdgr9IgLivylipNai"
            />
            <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
              <span className="font-label font-[500] text-[0.6875rem] tracking-[0.5em] uppercase text-neutral-300">
                NODE_TOPOLOGY_MAP
              </span>
              <div className="mt-4 flex gap-8">
                <div className="w-16 h-16 border border-neutral-300 flex items-center justify-center">
                  <div className="w-1 h-1 bg-tertiary"></div>
                </div>
                <div className="w-16 h-16 border border-neutral-300 flex items-center justify-center">
                  <div className="w-1 h-1 bg-tertiary opacity-20"></div>
                </div>
                <div className="w-16 h-16 border border-neutral-300 flex items-center justify-center">
                  <div className="w-1 h-1 bg-tertiary"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
