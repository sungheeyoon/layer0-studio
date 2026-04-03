export default function TechnicalLogs() {
  return (
    <section className="mt-40">
      <div className="grid grid-cols-12 border-b border-[#eeeeee] pb-4 mb-8">
        <div className="col-span-2 font-['Inter'] font-medium text-[0.625rem] uppercase tracking-widest text-[#777777]">
          Timestamp
        </div>
        <div className="col-span-4 font-['Inter'] font-medium text-[0.625rem] uppercase tracking-widest text-[#777777]">
          Event Hash
        </div>
        <div className="col-span-4 font-['Inter'] font-medium text-[0.625rem] uppercase tracking-widest text-[#777777]">
          Service Node
        </div>
        <div className="col-span-2 font-['Inter'] font-medium text-[0.625rem] uppercase tracking-widest text-[#777777] text-right">
          Status
        </div>
      </div>
      <div className="space-y-6">
        <div className="grid grid-cols-12 text-[0.6875rem] font-light">
          <div className="col-span-2 tabular-nums">14:02:45.001</div>
          <div className="col-span-4 font-mono opacity-60">0x7F41B2D9E3A</div>
          <div className="col-span-4 uppercase tracking-wider">Edge-Worker-East-01</div>
          <div className="col-span-2 text-right uppercase tracking-widest">Successful</div>
        </div>
        <div className="grid grid-cols-12 text-[0.6875rem] font-light">
          <div className="col-span-2 tabular-nums">14:02:44.892</div>
          <div className="col-span-4 font-mono opacity-60">0x3A12C5F8B12</div>
          <div className="col-span-4 uppercase tracking-wider">Storage-Buffer-A</div>
          <div className="col-span-2 text-right uppercase tracking-widest">Successful</div>
        </div>
        <div className="grid grid-cols-12 text-[0.6875rem] font-light">
          <div className="col-span-2 tabular-nums">14:02:44.210</div>
          <div className="col-span-4 font-mono opacity-60">0x9E01D4B2A7C</div>
          <div className="col-span-4 uppercase tracking-wider">Auth-Gateway-Primary</div>
          <div className="col-span-2 text-right uppercase tracking-widest flex justify-end items-center gap-2">
            Critical
            <div className="w-1 h-1 bg-[#7d000c]"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
