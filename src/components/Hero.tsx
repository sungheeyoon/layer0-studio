import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] grid-blueprint border-b border-surface-container flex items-center px-10 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-12 gap-8 relative z-10">
        <div className="col-span-12 lg:col-span-10">
          <span className="text-tertiary font-medium text-[0.6875rem] tracking-[0.3em] uppercase mb-10 block flex items-center gap-3">
            <span className="w-2 h-[1px] bg-tertiary"></span>
            Production-Ready Architecture v1.0.4
          </span>
          <h1 className="text-primary font-['Inter'] font-light text-6xl md:text-8xl lg:text-9xl leading-[0.95] tracking-tightest mb-12">
            Build Websites <br/>
            <span className="text-outline-variant italic text-5xl md:text-7xl lg:text-8xl">Without Code</span> <br/>
            Using Templates.
          </h1>
          <div className="flex flex-col md:flex-row gap-12 items-start md:items-center">
            <Link
              href="/templates"
              className="bg-primary text-on-primary px-12 py-5 font-medium text-[0.75rem] tracking-[0.2em] uppercase hover:brightness-110 transition-all shadow-xl"
            >
              Browse Templates
            </Link>
            <div className="max-w-md border-l border-outline-variant pl-8 py-2">
              <p className="text-outline font-light text-sm leading-relaxed">
                Choose a template, customize your content, and launch instantly. 
                High-fidelity digital experiences with no code required.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background Decorative Element */}
      <div className="absolute right-[-10%] top-[20%] text-[25rem] font-['Inter'] font-thin text-surface-container-highest leading-none select-none pointer-events-none opacity-20">
        STUDIO
      </div>
      
      <div className="absolute bottom-10 right-10 flex gap-12 text-[0.625rem] font-mono text-outline tracking-widest uppercase">
        <div className="flex flex-col gap-1">
          <span className="text-primary opacity-50">STATUS</span>
          <span>SYSTEM_READY</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-primary opacity-50">LOCATION</span>
          <span>SEOUL_EDGE_NODE</span>
        </div>
      </div>
    </section>
  );
}
