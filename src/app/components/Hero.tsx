export default function Hero() {
  return (
    <section className="relative h-[800px] grid-blueprint border-b border-surface-container flex items-center px-10">
      <div className="max-w-6xl">
        <span className="text-tertiary text-xs uppercase tracking-widest mb-6 block">
          System v1.0.4
        </span>

        <h1 className="text-primary text-6xl md:text-7xl font-light leading-tight mb-10">
          Build and manage your website without developers.
        </h1>

        <div className="flex gap-6 items-center">
          <button className="bg-primary text-on-primary px-8 py-4 text-xs uppercase tracking-widest">
            Initialize Project
          </button>

          <p className="text-outline text-sm max-w-xs">
            A high-precision drafting environment for the modern web.
          </p>
        </div>
      </div>
    </section>
  );
}