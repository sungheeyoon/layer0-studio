export default function MetricsGrid() {
  return (
    <section className="grid grid-cols-12 gap-x-8 gap-y-16 mb-32">
      <div className="col-span-6 md:col-span-3">
        <p className="font-['Inter'] font-medium text-[0.6875rem] uppercase tracking-[0.15em] text-[#777777] mb-6">
          Total Visits
        </p>
        <p className="text-4xl font-light tracking-tighter">142,809</p>
        <p className="text-[10px] font-light text-[#777777] mt-2 uppercase tracking-widest">+12.4% vs prev</p>
      </div>
      <div className="col-span-6 md:col-span-3">
        <p className="font-['Inter'] font-medium text-[0.6875rem] uppercase tracking-[0.15em] text-[#777777] mb-6">
          System Health
        </p>
        <p className="text-4xl font-light tracking-tighter">
          99.98<span className="text-lg opacity-40">%</span>
        </p>
        <p className="text-[10px] font-light text-[#7d000c] mt-2 uppercase tracking-widest">Nominal</p>
      </div>
      <div className="col-span-6 md:col-span-3">
        <p className="font-['Inter'] font-medium text-[0.6875rem] uppercase tracking-[0.15em] text-[#777777] mb-6">
          Latency (AVG)
        </p>
        <p className="text-4xl font-light tracking-tighter">
          24<span className="text-lg opacity-40">ms</span>
        </p>
        <p className="text-[10px] font-light text-[#777777] mt-2 uppercase tracking-widest">Global Edge</p>
      </div>
      <div className="col-span-6 md:col-span-3">
        <p className="font-['Inter'] font-medium text-[0.6875rem] uppercase tracking-[0.15em] text-[#777777] mb-6">
          Error Rate
        </p>
        <p className="text-4xl font-light tracking-tighter">
          0.02<span className="text-lg opacity-40">%</span>
        </p>
        <p className="text-[10px] font-light text-[#777777] mt-2 uppercase tracking-widest">Optimized</p>
      </div>
    </section>
  );
}
