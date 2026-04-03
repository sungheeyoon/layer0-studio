export default function EditorControls() {
  return (
    <section className="w-1/4 flex flex-col gap-12">
      <div>
        <h3 className="font-['Inter'] font-medium text-[0.6875rem] tracking-[0.1em] uppercase text-primary mb-6">
          Hierarchy
        </h3>
        <ul className="space-y-4">
          <li className="flex items-center justify-between group cursor-pointer">
            <span className="font-['Inter'] font-light text-xs tracking-wider text-primary">Header Main</span>
            <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors" data-icon="visibility">
              visibility
            </span>
          </li>
          <li className="flex items-center justify-between group cursor-pointer">
            <span className="font-['Inter'] font-light text-xs tracking-wider text-primary">Hero Section</span>
            <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors" data-icon="visibility">
              visibility
            </span>
          </li>
          <li className="flex items-center justify-between group cursor-pointer">
            <span className="font-['Inter'] font-light text-xs tracking-wider text-outline">Bento Grid_01</span>
            <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors" data-icon="visibility_off">
              visibility_off
            </span>
          </li>
          <li className="flex items-center justify-between group cursor-pointer">
            <span className="font-['Inter'] font-light text-xs tracking-wider text-primary">Content Block</span>
            <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors" data-icon="visibility">
              visibility
            </span>
          </li>
          <li className="flex items-center justify-between group cursor-pointer">
            <span className="font-['Inter'] font-light text-xs tracking-wider text-primary">Footer Cluster</span>
            <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors" data-icon="visibility">
              visibility
            </span>
          </li>
        </ul>
      </div>
      <div>
        <h3 className="font-['Inter'] font-medium text-[0.6875rem] tracking-[0.1em] uppercase text-primary mb-6">
          Parameters
        </h3>
        <div className="space-y-8">
          <div className="relative">
            <label className="block font-['Inter'] font-light text-[0.625rem] tracking-[0.1em] uppercase text-outline mb-2">
              Base Font Size
            </label>
            <input
              className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 pb-1 font-['Inter'] font-light text-xs"
              type="text"
              defaultValue="14.5px"
            />
            <div className="absolute right-0 top-0 w-1 h-1 bg-tertiary opacity-0 focus-within:opacity-100"></div>
          </div>
          <div className="relative">
            <label className="block font-['Inter'] font-light text-[0.625rem] tracking-[0.1em] uppercase text-outline mb-2">
              Primary Weight
            </label>
            <input
              className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 pb-1 font-['Inter'] font-light text-xs"
              type="text"
              defaultValue="100 (Thin)"
            />
          </div>
          <div className="relative">
            <label className="block font-['Inter'] font-light text-[0.625rem] tracking-[0.1em] uppercase text-outline mb-2">
              Grid Unit
            </label>
            <input
              className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 pb-1 font-['Inter'] font-light text-xs"
              type="text"
              defaultValue="40px"
            />
          </div>
        </div>
      </div>
      <div className="mt-auto">
        <button className="w-full bg-primary text-on-primary h-12 font-['Inter'] font-medium text-[0.6875rem] tracking-[0.2em] uppercase flex items-center justify-center gap-2">
          Publish Changes
          <div className="w-1 h-1 bg-tertiary"></div>
        </button>
      </div>
    </section>
  );
}
