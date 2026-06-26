'use client';

import { useDictionary } from "@/lib/i18n/provider";

export default function EditorPreview() {
  const t = useDictionary().landing.editorPreview;
  return (
    <section className="bg-surface-container-low py-32 px-10 border-b border-surface-container relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-8 mb-20 items-end">
          <div className="col-span-12 lg:col-span-5">
            <h2 className="text-4xl md:text-5xl font-light text-primary mb-8 tracking-tight">
              {t.title} <br/>
              <span className="text-outline">{t.titleEmphasis}</span>
            </h2>
            <p className="text-outline font-light text-sm mb-12 max-w-sm leading-relaxed">
              {t.description}
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <span className="text-[0.625rem] font-mono text-primary uppercase tracking-widest">{t.experienceLabel}</span>
                <p className="text-xl font-light tracking-tight">{t.experienceValue}</p>
              </div>
              <div className="space-y-2">
                <span className="text-[0.625rem] font-mono text-primary uppercase tracking-widest">{t.feedbackLabel}</span>
                <p className="text-xl font-light tracking-tight">{t.feedbackValue}</p>
              </div>
            </div>
          </div>
          <div className="hidden lg:block lg:col-span-7">
            <div className="flex justify-end gap-4 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-outline-variant">
              <span>{t.step1}</span>
              <span>/</span>
              <span>{t.step2}</span>
              <span>/</span>
              <span>{t.step3}</span>
            </div>
          </div>
        </div>

        {/* Mock Editor UI */}
        <div className="relative bg-white border border-outline-variant shadow-2xl p-1 rounded-sm overflow-hidden group">
          <div className="bg-surface border border-outline-variant flex h-[600px] overflow-hidden">
            {/* Mock Left Sidebar */}
            <div className="w-[240px] border-r border-outline-variant flex flex-col hidden md:flex">
              <div className="p-4 border-b border-outline-variant flex gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
              </div>
              <div className="flex border-b border-outline-variant">
                <div className="flex-1 py-3 text-[10px] uppercase font-bold text-center border-b-2 border-primary text-primary">Content</div>
                <div className="flex-1 py-3 text-[10px] uppercase font-medium text-center text-outline opacity-50">Design</div>
              </div>
              <div className="p-6 space-y-8">
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-outline mb-4">Sections</div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-primary font-medium">Hero</span>
                      <span className="material-symbols-outlined text-xs">visibility</span>
                    </div>
                    <div className="flex items-center justify-between opacity-50">
                      <span className="text-[11px]">About</span>
                      <span className="material-symbols-outlined text-xs">visibility</span>
                    </div>
                    <div className="flex items-center justify-between opacity-50">
                      <span className="text-[11px]">Features</span>
                      <span className="material-symbols-outlined text-xs">visibility</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-outline mb-4">Properties</div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="text-[9px] text-outline uppercase tracking-tighter">Title</div>
                      <div className="h-6 border-b border-outline-variant flex items-center text-[11px] text-on-surface">Digital Portfolio</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[9px] text-outline uppercase tracking-tighter">Theme Color</div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-tertiary"></div>
                        <div className="text-[11px] text-on-surface">#7D000C</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-auto p-4 border-t border-outline-variant">
                <div className="bg-primary text-white text-[10px] uppercase font-medium tracking-widest py-3 text-center cursor-pointer hover:brightness-110 transition-all">
                  Publish Site
                </div>
              </div>
            </div>

            {/* Mock Canvas Area */}
            <div className="flex-grow bg-surface-container-lowest relative blueprint-grid overflow-hidden p-8 flex flex-col">
              <div className="absolute top-4 left-4 flex gap-2">
                 <div className="px-3 py-1 bg-primary text-white text-[9px] uppercase tracking-widest">Live Preview</div>
                 <div className="px-3 py-1 border border-outline-variant text-outline text-[9px] uppercase tracking-widest bg-white">Desktop</div>
              </div>
              
              <div className="mt-12 bg-white shadow-xl flex-grow overflow-hidden flex flex-col rounded-sm border border-outline-variant">
                <div className="h-8 bg-[#f5f5f5] border-b border-outline-variant flex items-center px-4 gap-2">
                   <div className="w-2 h-2 rounded-full bg-zinc-300"></div>
                   <div className="h-3 bg-zinc-200 w-32 rounded-full"></div>
                </div>
                <div className="p-12 space-y-12 group-hover:opacity-100 transition-all duration-700">
                  <div className="space-y-4">
                    <div className="h-2 bg-tertiary w-16"></div>
                    <div className="text-4xl font-light text-primary tracking-tight">Digital Portfolio</div>
                    <div className="text-sm text-outline font-light max-w-sm">Designing high-performance web experiences.</div>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="aspect-square bg-surface-container border border-outline-variant p-4 flex flex-col justify-end">
                       <div className="h-2 bg-primary w-1/2 mb-2"></div>
                       <div className="h-1 bg-outline-variant w-full"></div>
                    </div>
                    <div className="aspect-square bg-surface-container border border-outline-variant p-4 flex flex-col justify-end">
                       <div className="h-2 bg-primary w-1/2 mb-2"></div>
                       <div className="h-1 bg-outline-variant w-full"></div>
                    </div>
                    <div className="aspect-square bg-surface-container border border-outline-variant p-4 flex flex-col justify-end">
                       <div className="h-2 bg-primary w-1/2 mb-2"></div>
                       <div className="h-1 bg-outline-variant w-full"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                 <div className="bg-tertiary text-white p-4 rounded-full shadow-2xl animate-bounce">
                    <span className="material-symbols-outlined text-4xl">touch_app</span>
                 </div>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 border-[10px] border-primary/5 pointer-events-none"></div>
        </div>
      </div>
      
      {/* Decorative lines */}
      <div className="absolute top-0 right-[20%] w-px h-full bg-outline-variant opacity-30"></div>
      <div className="absolute bottom-[20%] left-0 w-full h-px bg-outline-variant opacity-30"></div>
    </section>
  );
}
