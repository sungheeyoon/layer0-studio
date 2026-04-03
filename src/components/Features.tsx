export default function Features() {
  return (
    <section className="py-32 px-10 border-b border-surface-container">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-24">
        <div className="space-y-6">
          <div className="text-outline text-xs tracking-widest font-medium uppercase">01 / Assets</div>
          <h3 className="text-2xl font-light text-primary">Templates</h3>
          <p className="text-outline font-light leading-relaxed text-sm">
            Pre-architected layouts designed with mathematical precision. Every pixel accounted for in a 12-column global grid system.
          </p>
        </div>
        <div className="space-y-6">
          <div className="text-outline text-xs tracking-widest font-medium uppercase">02 / Interface</div>
          <h3 className="text-2xl font-light text-primary">Admin UI</h3>
          <p className="text-outline font-light leading-relaxed text-sm">
            A silent dashboard that removes cognitive load. Direct data manipulation with zero abstraction layers.
          </p>
        </div>
        <div className="space-y-6">
          <div className="text-outline text-xs tracking-widest font-medium uppercase">03 / Runtime</div>
          <h3 className="text-2xl font-light text-primary">Instant Editing</h3>
          <p className="text-outline font-light leading-relaxed text-sm">
            What you draft is what is served. Real-time rendering engine ensures absolute fidelity between editor and production.
          </p>
        </div>
      </div>
    </section>
  );
}
