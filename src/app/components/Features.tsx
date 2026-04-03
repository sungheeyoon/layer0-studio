export default function Features() {
  return (
    <section className="py-32 px-10 border-b border-surface-container">
      <div className="grid md:grid-cols-3 gap-20 max-w-6xl mx-auto">
        <div>
          <p className="text-xs uppercase text-outline mb-4">01 / Assets</p>
          <h3 className="text-2xl text-primary mb-4">Templates</h3>
          <p className="text-outline text-sm">
            Pre-architected layouts designed with precision.
          </p>
        </div>

        <div>
          <p className="text-xs uppercase text-outline mb-4">02 / Interface</p>
          <h3 className="text-2xl text-primary mb-4">Admin UI</h3>
          <p className="text-outline text-sm">
            A silent dashboard that removes cognitive load.
          </p>
        </div>

        <div>
          <p className="text-xs uppercase text-outline mb-4">03 / Runtime</p>
          <h3 className="text-2xl text-primary mb-4">Instant Editing</h3>
          <p className="text-outline text-sm">
            Real-time rendering engine ensures fidelity.
          </p>
        </div>
      </div>
    </section>
  );
}