export default function Pricing() {
  return (
    <section className="py-32 px-10 border-b border-surface-container">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-16 border-b border-outline-variant pb-8">
          <h2 className="text-4xl font-light">Subscription Models.</h2>
          <div className="text-xs font-mono text-outline">REVISION_DATE: 2024.11.01</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-outline-variant border border-outline-variant">
          <div className="bg-surface p-10 flex flex-col h-full">
            <div className="mb-auto">
              <span className="text-[0.6rem] uppercase tracking-[0.2em] font-medium block mb-4 text-outline">Tier 01</span>
              <h3 className="text-xl font-light mb-2">Essential</h3>
              <div className="text-3xl font-light mb-8">
                $49<span className="text-sm text-outline">/mo</span>
              </div>
              <ul className="space-y-4 text-xs font-light text-outline uppercase tracking-wider">
                <li>3 Projects</li>
                <li>Standard Grid</li>
                <li>Shared Domain</li>
              </ul>
            </div>
            <button className="mt-12 border border-primary py-4 text-[0.6rem] uppercase tracking-widest font-medium hover:bg-primary hover:text-on-primary transition-colors">
              Select Essential
            </button>
          </div>
          <div className="bg-surface p-10 flex flex-col h-full relative">
            <div className="absolute top-0 right-0 p-4">
              <div className="w-1.5 h-1.5 bg-tertiary"></div>
            </div>
            <div className="mb-auto">
              <span className="text-[0.6rem] uppercase tracking-[0.2em] font-medium block mb-4 text-tertiary">
                Recommended
              </span>
              <h3 className="text-xl font-light mb-2">Professional</h3>
              <div className="text-3xl font-light mb-8">
                $129<span className="text-sm text-outline">/mo</span>
              </div>
              <ul className="space-y-4 text-xs font-light text-outline uppercase tracking-wider">
                <li>Unlimited Projects</li>
                <li>Custom Blueprints</li>
                <li>Whitelabel UI</li>
                <li>Priority Edge</li>
              </ul>
            </div>
            <button className="mt-12 bg-primary text-on-primary py-4 text-[0.6rem] uppercase tracking-widest font-medium">
              Select Professional
            </button>
          </div>
          <div className="bg-surface p-10 flex flex-col h-full">
            <div className="mb-auto">
              <span className="text-[0.6rem] uppercase tracking-[0.2em] font-medium block mb-4 text-outline">Tier 03</span>
              <h3 className="text-xl font-light mb-2">Enterprise</h3>
              <div className="text-3xl font-light mb-8">Custom</div>
              <ul className="space-y-4 text-xs font-light text-outline uppercase tracking-wider">
                <li>Custom Infrastructure</li>
                <li>24/7 Engineer Access</li>
                <li>SLA Guarantee</li>
              </ul>
            </div>
            <button className="mt-12 border border-primary py-4 text-[0.6rem] uppercase tracking-widest font-medium hover:bg-primary hover:text-on-primary transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
