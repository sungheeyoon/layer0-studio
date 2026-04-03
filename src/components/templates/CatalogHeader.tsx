export default function CatalogHeader() {
  return (
    <div className="mb-24 flex justify-between items-baseline border-b border-outline-variant pb-8">
      <div>
        <h1 className="font-['Inter'] font-thin text-[3.5rem] tracking-[0.02em] leading-none uppercase">Catalog</h1>
        <p className="font-['Inter'] font-light text-xs tracking-[0.1em] uppercase text-outline mt-4">
          Precision curated architectural blueprints for digital interfaces.
        </p>
      </div>
      <div className="flex gap-4">
        <div className="w-1 h-1 bg-tertiary"></div>
        <span className="font-['Inter'] font-medium text-[0.6875rem] uppercase tracking-[0.1em]">System v2.4</span>
      </div>
    </div>
  );
}
