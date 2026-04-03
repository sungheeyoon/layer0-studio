export default function PreviewCanvas() {
  return (
    <section className="flex-grow bg-surface-container-lowest relative blueprint-grid border border-outline-variant overflow-hidden p-20 flex flex-col">
      {/* Canvas Labels */}
      <div className="absolute top-0 left-0 bg-primary text-on-primary px-2 py-1 text-[10px] font-medium tracking-tighter">
        VIEW_001
      </div>
      <div className="absolute top-0 right-0 border-l border-b border-outline-variant px-3 py-1 text-[10px] text-outline font-light tracking-[0.1em]">
        1440 x 900
      </div>
      <div className="max-w-3xl mx-auto w-full flex flex-col gap-24">
        {/* Preview Header */}
        <div className="flex justify-between items-baseline border-b border-primary pb-4">
          <h1 className="text-4xl font-thin tracking-tight">The Modern Primitive</h1>
          <span className="text-xs font-light tracking-[0.3em] uppercase">Architecture — 24</span>
        </div>
        
        {/* Preview Image Asymmetric Layout */}
        <div className="grid grid-cols-12 gap-8 items-end">
          <div className="col-span-7">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="w-full grayscale brightness-90 filter hover:grayscale-0 transition-all duration-700"
              alt="monochrome minimalist skyscraper facade with sharp repeating geometric patterns and high contrast dramatic architectural lighting"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHL-x5Hb3uZwb77RfKupPkQVLW3DKKhzCAWc-6cLabeccUp9JFND9dA4Co1anfr7_psHN-EzINTM0hg7xEMdOfkRPCxFgEJWpp2lgP58QAnHdx8y2WZY6iVxpF7EQ_7OwdqqGpanzHwiqhIRgpVEAy0k3NXyy6qFzGMzvNtOjnRpT3uylXKmC7_xKU4m5aabhJpAbjuEVMrmy11ErRK1A4gLw0ZR409_l5D6fIlTi86CxyLeBRdJ8_tzwq-08Vgfl7hhry5lrfNLrZ"
            />
          </div>
          <div className="col-span-5 pb-10">
            <p className="text-xs leading-relaxed text-outline">
              01 / A study in structural silence. We focus on the mathematical relationship between void and mass, ensuring every line serves a singular purpose.
            </p>
            <div className="mt-6 w-12 h-[1px] bg-primary"></div>
          </div>
        </div>

        {/* Bento Style Detail Grid */}
        <div className="grid grid-cols-3 gap-1">
          <div className="bg-surface-container h-48 flex flex-col p-6 justify-between border border-outline-variant">
            <span className="text-[10px] font-medium tracking-widest uppercase">Grid Structure</span>
            <span className="text-2xl font-thin">12.0</span>
          </div>
          <div className="bg-surface-container h-48 flex flex-col p-6 justify-between border border-outline-variant">
            <span className="text-[10px] font-medium tracking-widest uppercase">Opacity</span>
            <span className="text-2xl font-thin">0.05</span>
          </div>
          <div className="bg-primary text-on-primary h-48 flex flex-col p-6 justify-between border border-outline-variant">
            <span className="text-[10px] font-medium tracking-widest uppercase">Execution</span>
            <span className="material-symbols-outlined" data-icon="north_east">
              north_east
            </span>
          </div>
        </div>
      </div>

      {/* Coordinate Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-12 text-[10px] text-outline tracking-widest">
        <span>LAT: 40.7128 N</span>
        <span>LNG: 74.0060 W</span>
      </div>
    </section>
  );
}
