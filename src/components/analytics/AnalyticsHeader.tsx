export default function AnalyticsHeader() {
  return (
    <section className="grid grid-cols-12 gap-8 mb-24 items-end">
      <div className="col-span-12 md:col-span-7">
        <span className="font-['Inter'] font-medium text-[0.625rem] tracking-[0.2em] uppercase text-[#777777] mb-4 block">
          System Core / v.2.4.0
        </span>
        <h1 className="text-[3.5rem] font-light leading-none tracking-tight text-[#1a1a1a]">
          Project <br />
          Overview
        </h1>
      </div>
      <div className="col-span-12 md:col-span-5 flex flex-col items-end gap-2">
        <div className="flex items-center gap-3">
          <span className="font-['Inter'] font-light text-[0.6875rem] uppercase tracking-widest text-[#777777]">
            Deployment Status
          </span>
          <div className="w-1 h-1 bg-[#7d000c]"></div> {/* The Red Dot */}
        </div>
        <div className="font-['Inter'] font-light text-[0.625rem] text-[#777777] uppercase tracking-[0.1em]">
          Last sync: 2.4s ago
        </div>
      </div>
    </section>
  );
}
