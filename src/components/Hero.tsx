export default function Hero() {
  return (
    <section className="relative h-[819px] grid-blueprint border-b border-surface-container flex items-center px-10">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-8 lg:col-span-7">
          <span className="text-tertiary font-medium text-[0.6875rem] tracking-[0.2em] uppercase mb-8 block flex items-center gap-2">
            <span className="w-1 h-1 bg-tertiary"></span> System v1.0.4
          </span>
          <h1 className="text-primary font-['Inter'] font-light text-5xl md:text-7xl lg:text-8xl leading-[1.1] tracking-tight mb-12">
            Build and manage your website without developers.
          </h1>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <button className="bg-primary text-on-primary px-10 py-4 font-medium text-[0.6875rem] tracking-[0.1em] uppercase">
              Initialize Project
            </button>
            <p className="max-w-xs text-outline font-light text-sm leading-relaxed mt-2">
              A high-precision drafting environment for the modern web. Engineering aesthetics, commercial performance.
            </p>
          </div>
        </div>
        <div className="hidden lg:block lg:col-span-5 relative">
          <div className="absolute right-0 top-0 text-[10rem] font-['Inter'] font-thin text-surface-container-highest leading-none select-none">
            00
          </div>
        </div>
      </div>
    </section>
  );
}
