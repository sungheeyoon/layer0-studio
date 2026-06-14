'use client';

import { useState } from 'react';
import { Template, allSections } from '@/domain/entities/template.entity';
import { selectTemplateAction } from '@/app/(authenticated)/dashboard/(with-sidebar)/templates/actions';
import { getDomainError } from '@/lib/errors/messages';

interface CreateProjectClientProps {
  template: Template;
}

export default function CreateProjectClient({ template }: CreateProjectClientProps) {
  const [siteName, setSiteName] = useState('');
  const [urlSlug, setUrlSlug] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [provisionError, setProvisionError] = useState<string | null>(null);

  const handleProvision = async () => {
    if (!siteName) {
      setProvisionError('사이트 이름을 입력해주세요.');
      return;
    }
    setProvisionError(null);
    setIsSubmitting(true);
    try {
      const result = await selectTemplateAction(template.id, siteName, urlSlug);
      if (result?.error) {
        setProvisionError(getDomainError(result.error));
        setIsSubmitting(false);
      }
    } catch {
      // Next.js redirect() throws internally and is handled automatically.
    }
  };

  const sectionsCount = template.templateJson ? allSections(template.templateJson).length : 0;

  return (
    <div className="-mx-12 -my-12 px-12 py-12 bg-white min-h-[calc(100vh-3.5rem)] text-on-background">
      <div className="max-w-6xl mx-auto pb-20">
        {/* HEADER SECTION */}
        <section className="mb-20">
          <div className="flex items-baseline gap-4 mb-2">
            <span className="text-[0.6875rem] font-medium tracking-[0.1em] text-neutral-400 uppercase">SYSTEM_STATE: READY</span>
            <div className="w-1 h-1 bg-tertiary"></div>
          </div>
          <h2 className="text-7xl font-thin tracking-tight text-primary uppercase leading-none">INITIALIZE_NODE</h2>
          <div className="mt-6 flex gap-12 text-[10px] tracking-[0.1em] font-light text-neutral-500 uppercase">
            <div className="flex gap-2"><span>PROTOCOL_V:</span><span className="text-black">1.0.4_STABLE</span></div>
            <div className="flex gap-2"><span>CLUSTER_ID:</span><span className="text-black">L0-99X-ALPHA</span></div>
            <div className="flex gap-2"><span>TIMESTAMP:</span><span className="text-black">{new Date().toISOString().replace('T', '_').split('.')[0]}</span></div>
          </div>
        </section>

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-12 gap-12">
          {/* LEFT COLUMN: FORM */}
          <div className="col-span-12 md:col-span-7 space-y-24">
            {/* PROJECT_IDENTITY */}
            <section>
              <div className="flex items-center gap-3 mb-10">
                <span className="w-4 h-[1px] bg-black"></span>
                <h3 className="text-[0.6875rem] font-medium tracking-[0.2em] uppercase">01_PROJECT_IDENTITY</h3>
              </div>
              <div className="space-y-12">
                <div className="group relative">
                  <label className="block text-[10px] tracking-[0.1em] font-light text-neutral-400 uppercase mb-2">Site Name</label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full bg-transparent border-b border-outline-variant py-4 text-sm font-light tracking-widest uppercase focus:border-primary placeholder:text-neutral-300 focus:outline-none focus:ring-0"
                    placeholder="ENTER_NAME"
                  />
                  <div className="absolute top-0 right-0 hidden group-focus-within:block w-1 h-1 bg-tertiary"></div>
                </div>

                <div className="group relative">
                  <label className="block text-[10px] tracking-[0.1em] font-light text-neutral-400 uppercase mb-2">URL Slug</label>
                  <div className="flex items-center border-b border-outline-variant focus-within:border-primary">
                    <input
                      type="text"
                      value={urlSlug}
                      onChange={(e) => setUrlSlug(e.target.value)}
                      className="flex-1 bg-transparent border-none py-4 text-sm font-light tracking-widest uppercase focus:ring-0 placeholder:text-neutral-300 focus:outline-none"
                      placeholder="DOMAIN_PREFIX"
                    />
                    <span className="text-[11px] tracking-[0.1em] font-medium text-neutral-400 px-4">.LAYER0.STUDIO</span>
                  </div>
                  <div className="absolute top-0 right-0 hidden group-focus-within:block w-1 h-1 bg-tertiary"></div>
                </div>
              </div>
            </section>

            {/* TECHNICAL_PROVISIONS */}
            <section>
              <div className="flex items-center gap-3 mb-10">
                <span className="w-4 h-[1px] bg-black"></span>
                <h3 className="text-[0.6875rem] font-medium tracking-[0.2em] uppercase">02_TECHNICAL_PROVISIONS</h3>
              </div>
              <div className="grid grid-cols-2 gap-12">
                <div className="group relative">
                  <label className="block text-[10px] tracking-[0.1em] font-light text-neutral-400 uppercase mb-2">Primary Language</label>
                  <select className="w-full bg-transparent border-b border-outline-variant py-4 text-[11px] font-light tracking-widest uppercase focus:border-primary focus:ring-0 appearance-none focus:outline-none cursor-pointer">
                    <option>TYPESCRIPT_V5</option>
                    <option>RUST_WASM</option>
                    <option>GO_ENGINE</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-0 bottom-4 text-neutral-400 pointer-events-none" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 24", fontSize: '18px' }}>expand_more</span>
                </div>

                <div className="group relative">
                  <label className="block text-[10px] tracking-[0.1em] font-light text-neutral-400 uppercase mb-2">Regional Node</label>
                  <select className="w-full bg-transparent border-b border-outline-variant py-4 text-[11px] font-light tracking-widest uppercase focus:border-primary focus:ring-0 appearance-none focus:outline-none cursor-pointer">
                    <option>US_EAST_01 (N.VIRGINIA)</option>
                    <option>EU_WEST_02 (LONDON)</option>
                    <option>AP_SOUTH_01 (MUMBAI)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-0 bottom-4 text-neutral-400 pointer-events-none" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 24", fontSize: '18px' }}>expand_more</span>
                </div>
              </div>
            </section>

            {/* ACTION */}
            <div className="pt-8">
              {provisionError && (
                <div className="px-4 py-3 border border-error/40 bg-error/5 text-[10px] tracking-widest text-error uppercase">
                  {provisionError}
                </div>
              )}
              <button
                onClick={handleProvision}
                disabled={isSubmitting}
                className="bg-primary text-on-primary w-full h-16 flex items-center justify-between px-8 group transition-all hover:bg-neutral-800 disabled:opacity-50"
              >
                <span className="text-sm font-medium tracking-[0.3em] uppercase">
                  {isSubmitting ? 'PROVISIONING...' : 'PROVISION_PROJECT'}
                </span>
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-2" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 24", fontSize: '18px' }}>arrow_forward</span>
              </button>
              <p className="mt-4 text-[9px] tracking-[0.1em] font-light text-neutral-400 uppercase text-center">Execution of this command will initiate automated cluster provisioning.</p>
            </div>
          </div>

          {/* RIGHT COLUMN: CONTEXT */}
          <div className="col-span-12 md:col-span-5">
            <div className="sticky top-28 bg-surface-container-low p-8 border border-neutral-100">
              <div className="flex items-center gap-3 mb-8">
                <span className="w-4 h-[1px] bg-black"></span>
                <h3 className="text-[0.6875rem] font-medium tracking-[0.2em] uppercase">BLUEPRINT_CONTEXT</h3>
              </div>

              <div className="space-y-8">
                <div>
                  <p className="text-[10px] tracking-[0.1em] font-light text-neutral-500 uppercase mb-4">SELECTED_TEMPLATE</p>
                  <div className="bg-white border border-neutral-200 p-1">
                    <div className="aspect-video bg-neutral-100 flex items-center justify-center overflow-hidden relative group">
                      {template.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={template.thumbnailUrl}
                          alt={template.name}
                          className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-80"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-surface-variant">
                          <span className="text-[10px] tracking-widest text-neutral-400 uppercase">NO_PREVIEW</span>
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-[11px] font-medium tracking-[0.2em] text-black bg-white/90 px-4 py-2 uppercase shadow-sm">
                          {template.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-neutral-200">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] tracking-[0.1em] font-light text-neutral-500 uppercase">Component Count</span>
                    <span className="text-[10px] tracking-[0.1em] font-medium text-black uppercase">{sectionsCount}_ELEMENTS</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] tracking-[0.1em] font-light text-neutral-500 uppercase">Style Dictionary</span>
                    <span className="text-[10px] tracking-[0.1em] font-medium text-black uppercase">{template.templateJson?.templateKey || 'DEFAULT'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] tracking-[0.1em] font-light text-neutral-500 uppercase">Runtime Env</span>
                    <span className="text-[10px] tracking-[0.1em] font-medium text-black uppercase">NODE_20_LTS</span>
                  </div>
                </div>

                {template.description && (
                  <div className="pt-6 bg-tertiary/5 p-4 flex gap-4">
                    <div className="w-1 h-1 bg-tertiary mt-1 shrink-0"></div>
                    <p className="text-[10px] leading-relaxed font-light text-tertiary tracking-wide uppercase">
                      Note: {template.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER METADATA */}
        <footer className="mt-32 pt-12 border-t border-neutral-200 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 bg-black"></span>
              <p className="text-[10px] tracking-[0.2em] font-medium uppercase">NODE_ORCHESTRATOR</p>
            </div>
            <p className="text-[9px] tracking-[0.1em] font-light text-neutral-400 uppercase">System operational. All parameters within nominal range.</p>
          </div>
          <div className="md:text-right space-y-1">
            <p className="text-[14px] font-thin tracking-widest text-black">40.7128° N, 74.0060° W</p>
            <p className="text-[8px] tracking-[0.1em] font-light text-neutral-400 uppercase">Primary Node Location / Global Mesh</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
