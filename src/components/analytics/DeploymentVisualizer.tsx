export default function DeploymentVisualizer() {
  return (
    <section className="grid grid-cols-12 gap-8 mb-24">
      <div className="col-span-12 md:col-span-2">
        <h3 className="font-['Inter'] font-medium text-[0.6875rem] uppercase tracking-[0.15em] text-[#1a1a1a]">
          Traffic Distribution
        </h3>
        <div className="mt-4 flex flex-col gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#777777]">North America</div>
            <div className="text-xs font-light">42%</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#777777]">Europe</div>
            <div className="text-xs font-light">31%</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#777777]">Asia</div>
            <div className="text-xs font-light">27%</div>
          </div>
        </div>
      </div>
      <div className="col-span-12 md:col-span-10 border-l border-[#eeeeee] pl-12 h-64 relative">
        {/* Geometric Visualization representing architectural data */}
        <div className="absolute inset-0 flex items-end px-12 gap-2 opacity-10">
          {/* Mimicking a technical graph */}
          <div className="flex-1 bg-black h-[10%]"></div>
          <div className="flex-1 bg-black h-[15%]"></div>
          <div className="flex-1 bg-black h-[12%]"></div>
          <div className="flex-1 bg-black h-[25%]"></div>
          <div className="flex-1 bg-black h-[40%]"></div>
          <div className="flex-1 bg-black h-[35%]"></div>
          <div className="flex-1 bg-black h-[60%]"></div>
          <div className="flex-1 bg-black h-[55%]"></div>
          <div className="flex-1 bg-black h-[70%]"></div>
          <div className="flex-1 bg-black h-[85%]"></div>
          <div className="flex-1 bg-black h-[80%]"></div>
          <div className="flex-1 bg-black h-[95%]"></div>
        </div>
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="text-[0.625rem] text-[#777777] uppercase tracking-widest">Network Throughput (TB/s)</div>
            <div className="text-[0.625rem] text-[#1a1a1a] uppercase tracking-widest font-medium">Live Data Stream</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-[3rem] font-thin tracking-tighter">8.42</div>
            <div className="w-1 h-1 bg-[#7d000c]"></div>
          </div>
          <div className="h-[1px] w-full bg-[#eeeeee]"></div>
        </div>
      </div>
    </section>
  );
}
