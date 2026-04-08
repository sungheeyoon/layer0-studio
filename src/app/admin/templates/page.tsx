export default function TemplatesPage() {
  return (
    <main className="ml-64 mt-12 h-[calc(100vh-48px)] grid grid-cols-12 overflow-hidden text-on-surface bg-background">
      {/* Left Column: Template List (High Density) */}
      <section className="col-span-4 bg-[#f3f3f3] dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto">
        <div className="sticky top-0 bg-[#f3f3f3] dark:bg-neutral-900 z-10 p-8 pb-4">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-[11px] font-medium tracking-[0.1em] uppercase">Existing Templates</h2>
            <span className="text-[10px] text-neutral-400 font-mono tracking-tighter">TOTAL_COUNT [08]</span>
          </div>
          <div className="flex items-center space-x-2 pb-2 border-b border-neutral-300 dark:border-neutral-800">
            <span className="material-symbols-outlined text-sm text-neutral-400" data-icon="filter_list">filter_list</span>
            <span className="text-[10px] font-medium uppercase tracking-[0.05em]">Filter by: All Categories</span>
          </div>
        </div>
        
        <div className="px-8 pb-12 space-y-4">
          {/* Template Item Active */}
          <div className="group bg-white dark:bg-neutral-950 p-4 border border-transparent hover:border-black dark:hover:border-white transition-all cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-800 flex-shrink-0 grayscale">
                <img 
                  alt="Modern Corporate"
                  className="w-full h-full object-cover" 
                  data-alt="grayscale minimalist website layout preview with clean lines and geometric shapes" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5z7njgH3KroQkBquLRghmU-uHodzXzI5lI2Adj7tpcpK8dm_xrTS8H-nXfYlIBQQ1m8gWofGgx2zitG1041SFTR-CbppAWzs4VZgIkdU82V8aD03PYIRuRQMx8KxZKlSWYZT30juElF4Hfrb0Q0nCV5lTMLzZJgAzVn2aTxWU6RyGqCBc03T8oqPTbSr69rhYfv0W7GjqcfjU_3DlchG2tG81sl_UzSGQP5uraDDxrPvStxl840j0VEHAw6-cvrTK7JHr4hMEIarv"
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-medium tracking-tight">Modern Corporate</span>
                  <div className="w-1 h-1 bg-[#7d000c] mt-1"></div>
                </div>
                <div className="flex gap-2 mt-1">
                  <span className="text-[9px] font-medium px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 uppercase tracking-widest text-neutral-500">Business</span>
                  <span className="text-[9px] font-medium px-1.5 py-0.5 bg-neutral-800 dark:bg-neutral-200 uppercase tracking-widest text-white dark:text-black">Active</span>
                </div>
                <div className="mt-3 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-[9px] uppercase tracking-tighter border-b border-black dark:border-white">Edit</button>
                  <button className="text-[9px] uppercase tracking-tighter border-b border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white">Duplicate</button>
                  <button className="text-[9px] uppercase tracking-tighter text-red-800 border-b border-red-800/30 dark:text-red-500 dark:border-red-500/30 hover:border-red-800 dark:hover:border-red-500 transition-colors">Delete</button>
                </div>
              </div>
            </div>
          </div>

          {/* Template Item Draft */}
          <div className="group bg-white/40 dark:bg-neutral-950/40 p-4 border border-transparent hover:border-black dark:hover:border-white transition-all cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-800 flex-shrink-0 grayscale">
                <img 
                  alt="Minimal Portfolio"
                  className="w-full h-full object-cover" 
                  data-alt="clean minimal blog template interface with serif typography and wide margins" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQyNoB_2RtByRlFMgggv4MT05BievDQsFRfzGbdY1qDfXK_ugDClEgbVaDEX8zfjVYQnMMbL5-6lZMQ-BHdPFN8mcBefS7NPP64nSt0tggE2Nc7GL453GXkQ4J05r2SzV--UYxl5EdN_xvNQhDa1xMWpV3-j4M9cQz8JLU0E0ewv8kuQ-8MXOeC1YtSAhA_bNCOeMMam9pIIG_-acxau3PpwRXC5yqGVW41StLox2M5wV6Ws6zK83EJZlg3kJyTMYG10D1X_3D9g5g"
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-medium tracking-tight">Minimal Portfolio</span>
                  <div className="w-1 h-1 bg-neutral-300 dark:bg-neutral-600 mt-1"></div>
                </div>
                <div className="flex gap-2 mt-1">
                  <span className="text-[9px] font-medium px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 uppercase tracking-widest text-neutral-500">Creative</span>
                  <span className="text-[9px] font-medium px-1.5 py-0.5 border border-neutral-300 dark:border-neutral-700 uppercase tracking-widest text-neutral-400">Draft</span>
                </div>
                <div className="mt-3 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-[9px] uppercase tracking-tighter border-b border-black dark:border-white">Edit</button>
                  <button className="text-[9px] uppercase tracking-tighter border-b border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white">Duplicate</button>
                  <button className="text-[9px] uppercase tracking-tighter text-red-800 border-b border-red-800/30 dark:text-red-500 dark:border-red-500/30 hover:border-red-800 dark:hover:border-red-500 transition-colors">Delete</button>
                </div>
              </div>
            </div>
          </div>

          {/* Template Item 3 */}
          <div className="group bg-white/40 dark:bg-neutral-950/40 p-4 border border-transparent hover:border-black dark:hover:border-white transition-all cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-800 flex-shrink-0 grayscale">
                <img 
                  alt="Tech Journal V2"
                  className="w-full h-full object-cover" 
                  data-alt="technical wireframe view of an e-commerce dashboard with grid lines" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPankrwGkEmlrGF0avrvnKQXQwiF9SIWlc8aOmiN9N59WAJMiFAKdhY98fLuH2zYM4HBXGRii1Q90nqA7rFluxdLqC9hd1tSDNVs_DMwuZjfWIvAASXTeL0pkjI5YJljVQA2J6SaI8_3JrGMw6nEIUC-uqXZbADPHj_F5RavZhOb0qQZcgf4vnElLa1lkrxYXLBH8F7sI99EJpDajf-_3-1U9mhRsfolwDSuLsLBfzP8C2GRzpQ0ccramU7FaSSN99zxmrwkDNF_L2"
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-medium tracking-tight">Tech Journal V2</span>
                  <div className="w-1 h-1 bg-[#7d000c] mt-1"></div>
                </div>
                <div className="flex gap-2 mt-1">
                  <span className="text-[9px] font-medium px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 uppercase tracking-widest text-neutral-500">Blog</span>
                  <span className="text-[9px] font-medium px-1.5 py-0.5 bg-neutral-800 dark:bg-neutral-200 uppercase tracking-widest text-white dark:text-black">Active</span>
                </div>
                <div className="mt-3 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-[9px] uppercase tracking-tighter border-b border-black dark:border-white">Edit</button>
                  <button className="text-[9px] uppercase tracking-tighter border-b border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white">Duplicate</button>
                  <button className="text-[9px] uppercase tracking-tighter text-red-800 border-b border-red-800/30 dark:text-red-500 dark:border-red-500/30 hover:border-red-800 dark:hover:border-red-500 transition-colors">Delete</button>
                </div>
              </div>
            </div>
          </div>

          {/* Template Item 4 */}
          <div className="group bg-white/40 dark:bg-neutral-950/40 p-4 border border-transparent hover:border-black dark:hover:border-white transition-all cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-800 flex-shrink-0 grayscale">
                <img 
                  alt="Architectural Grid"
                  className="w-full h-full object-cover" 
                  data-alt="architecture firm portfolio website mockup in monochrome tones" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_iz6sXWlOurXdXtEXH5AHg8uX-pLLn2zJrfHOFisHJgi_4Lsvf8i28pDjQJRpu2gKK37-QxosWohM4JKzlmVrNDepgKcr8iqsCUXw25YXuLaOF1_lUNogOvwr3uhyelU_kK51EaAjB66SNtOqkQ6X6eWnTlcWmPDJ9-IFADziF5nWosidORGLJRe79kOtmAHL9K_3Tpmuyx9pE6K_c_p1nm7jwfIBAhtZcJM4jcObKPkua9TmS3uCTqGL1RvO6MofyNq2gOqgCmyH"
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-medium tracking-tight">Architectural Grid</span>
                  <div className="w-1 h-1 bg-neutral-300 dark:bg-neutral-600 mt-1"></div>
                </div>
                <div className="flex gap-2 mt-1">
                  <span className="text-[9px] font-medium px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 uppercase tracking-widest text-neutral-500">Business</span>
                  <span className="text-[9px] font-medium px-1.5 py-0.5 border border-neutral-300 dark:border-neutral-700 uppercase tracking-widest text-neutral-400">Draft</span>
                </div>
                <div className="mt-3 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-[9px] uppercase tracking-tighter border-b border-black dark:border-white">Edit</button>
                  <button className="text-[9px] uppercase tracking-tighter border-b border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white">Duplicate</button>
                  <button className="text-[9px] uppercase tracking-tighter text-red-800 border-b border-red-800/30 dark:text-red-500 dark:border-red-500/30 hover:border-red-800 dark:hover:border-red-500 transition-colors">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right Column: Content Area (Form) */}
      <section className="col-span-8 bg-surface overflow-y-auto">
        <div className="p-12 max-w-4xl">
          <header className="mb-12">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-1 h-1 bg-[#7d000c]"></div>
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">Core Configuration</span>
            </div>
            <h2 className="text-3xl font-[100] tracking-tight">Template Editor_</h2>
          </header>
          
          <form className="space-y-16">
            {/* Section 1: Basic Info */}
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-4">
                <h3 className="text-[11px] font-medium uppercase tracking-widest">01 / BASIC_INFO</h3>
                <p className="text-[10px] text-neutral-400 mt-2 font-light">Define the primary identity and metadata for this blueprint.</p>
              </div>
              <div className="col-span-8 space-y-8">
                <div className="group relative">
                  <label className="text-[9px] uppercase tracking-widest text-neutral-500 block mb-1">Template Title</label>
                  <input className="w-full bg-transparent border-none border-b border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white focus:ring-0 p-0 py-2 text-sm font-light tracking-wide transition-colors outline-none" type="text" defaultValue="Modern Corporate"/>
                  <div className="absolute top-0 right-0 w-1 h-1 bg-[#7d000c] opacity-0 group-focus-within:opacity-100"></div>
                </div>
                <div className="group relative">
                  <label className="text-[9px] uppercase tracking-widest text-neutral-500 block mb-1">Description</label>
                  <textarea className="w-full bg-transparent border-none border-b border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white focus:ring-0 p-0 py-2 text-sm font-light tracking-wide transition-colors resize-none outline-none" rows={2} defaultValue="High-precision corporate identity for enterprise scale solutions. Minimalist grid-based layout."></textarea>
                  <div className="absolute top-0 right-0 w-1 h-1 bg-[#7d000c] opacity-0 group-focus-within:opacity-100"></div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="group relative">
                    <label className="text-[9px] uppercase tracking-widest text-neutral-500 block mb-1">Demo URL</label>
                    <input className="w-full bg-transparent border-none border-b border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white focus:ring-0 p-0 py-2 text-sm font-light tracking-wide transition-colors outline-none" type="text" defaultValue="https://blueprint.arch/demo/corp-01"/>
                  </div>
                  <div className="relative">
                    <label className="text-[9px] uppercase tracking-widest text-neutral-500 block mb-1">Thumbnail Upload</label>
                    <div className="mt-2 border border-dashed border-neutral-300 dark:border-neutral-700 p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
                      <span className="material-symbols-outlined text-neutral-400 mb-1" data-icon="upload_file">upload_file</span>
                      <span className="text-[9px] uppercase tracking-widest">Replace File</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Data Schema Management */}
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-4">
                <h3 className="text-[11px] font-medium uppercase tracking-widest">02 / DATA_SCHEMA</h3>
                <p className="text-[10px] text-neutral-400 mt-2 font-light">The foundational JSON object that powers the dynamic sections.</p>
              </div>
              <div className="col-span-8">
                <div className="bg-neutral-900 dark:bg-neutral-950 p-6 relative">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">initial_schema.json</span>
                    <span className="material-symbols-outlined text-neutral-500 text-sm" data-icon="code">code</span>
                  </div>
                  <textarea 
                    className="w-full bg-transparent border-none focus:ring-0 text-xs font-mono text-white/80 leading-relaxed resize-none p-0 outline-none" 
                    rows={8} 
                    defaultValue={`{
  "title": "Welcome to Architect",
  "hero_image": "corp_bg_01.jpg",
  "primary_color": "#000000",
  "layout": "asymmetric",
  "meta": {
    "version": "1.0.4",
    "status": "stable"
  }
}`}
                  />
                  <div className="absolute top-2 right-2 w-1 h-1 bg-[#7d000c]"></div>
                </div>
              </div>
            </div>

            {/* Section 3: Component Structure */}
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-4">
                <h3 className="text-[11px] font-medium uppercase tracking-widest">03 / STRUCTURE</h3>
                <p className="text-[10px] text-neutral-400 mt-2 font-light">Stack and reorder template modules.</p>
              </div>
              <div className="col-span-8">
                <div className="space-y-2">
                  {/* Structure Items */}
                  <div className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-neutral-400 text-sm" data-icon="drag_indicator">drag_indicator</span>
                      <span className="text-[10px] font-mono text-neutral-400">01</span>
                      <span className="text-xs uppercase tracking-widest font-medium">Hero Section</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[9px] uppercase text-neutral-400 tracking-tighter">Required</span>
                      <button className="material-symbols-outlined text-neutral-400 hover:text-black dark:hover:text-white text-sm transition-colors" data-icon="close">close</button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-neutral-400 text-sm" data-icon="drag_indicator">drag_indicator</span>
                      <span className="text-[10px] font-mono text-neutral-400">02</span>
                      <span className="text-xs uppercase tracking-widest font-medium">About Component</span>
                    </div>
                    <button className="material-symbols-outlined text-neutral-400 hover:text-black dark:hover:text-white text-sm transition-colors" data-icon="close">close</button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-neutral-400 text-sm" data-icon="drag_indicator">drag_indicator</span>
                      <span className="text-[10px] font-mono text-neutral-400">03</span>
                      <span className="text-xs uppercase tracking-widest font-medium">Service Matrix</span>
                    </div>
                    <button className="material-symbols-outlined text-neutral-400 hover:text-black dark:hover:text-white text-sm transition-colors" data-icon="close">close</button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-neutral-400 text-sm" data-icon="drag_indicator">drag_indicator</span>
                      <span className="text-[10px] font-mono text-neutral-400">04</span>
                      <span className="text-xs uppercase tracking-widest font-medium">Contact Footer</span>
                    </div>
                    <button className="material-symbols-outlined text-neutral-400 hover:text-black dark:hover:text-white text-sm transition-colors" data-icon="close">close</button>
                  </div>
                  
                  <button className="w-full mt-4 border border-dashed border-neutral-300 dark:border-neutral-700 py-3 text-[10px] uppercase tracking-widest text-neutral-500 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all">
                    + Insert Module
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-12 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
              <button className="text-[10px] uppercase tracking-widest text-neutral-400 hover:text-red-800 dark:hover:text-red-500 transition-colors" type="button">Discard Changes</button>
              <div className="flex gap-4">
                <button className="px-8 py-3 border border-black dark:border-white text-[10px] uppercase tracking-widest font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors" type="button">Save Draft</button>
                <button className="px-10 py-3 bg-black dark:bg-white text-white dark:text-black text-[10px] uppercase tracking-widest font-medium hover:opacity-80 transition-opacity" type="submit">Deploy Template</button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
