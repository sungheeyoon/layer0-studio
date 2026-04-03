export default function CatalogDescription() {
  return (
    <div className="mt-32 grid grid-cols-12 gap-10">
      <div className="col-start-2 col-span-4">
        <h3 className="font-['Inter'] font-medium text-[0.6875rem] uppercase tracking-[0.1em] border-l-2 border-tertiary pl-4">
          The Logic of Order
        </h3>
        <p className="mt-6 font-['Inter'] font-light text-sm leading-relaxed text-outline">
          Our templates are not mere decorations. They are structural frameworks built on a rigorous 12-column mathematical
          grid. Every pixel is calculated to provide maximum clarity and focus.
        </p>
      </div>
      <div className="col-start-7 col-span-5">
        <p className="font-['Inter'] font-light text-2xl tracking-tight leading-snug">
          &quot;Simplicity is the ultimate sophistication. We remove the noise so that your vision can speak clearly through the
          silence of the grid.&quot;
        </p>
      </div>
    </div>
  );
}
