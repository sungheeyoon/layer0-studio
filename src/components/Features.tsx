export default function Features() {
  return (
    <section className="py-32 px-10 border-b border-surface-container bg-surface">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-24 relative">
        {/* Vertical separators for desktop */}
        <div className="hidden md:block absolute top-0 left-1/3 w-px h-full bg-outline-variant opacity-20"></div>
        <div className="hidden md:block absolute top-0 left-2/3 w-px h-full bg-outline-variant opacity-20"></div>

        <div className="space-y-8 group">
          <div className="text-tertiary text-[0.625rem] tracking-[0.3em] font-bold uppercase flex items-center gap-2">
            <span className="w-1 h-1 bg-tertiary"></span> 01 / BLUEPRINT
          </div>
          <h3 className="text-3xl font-light text-primary tracking-tight">Ready-to-Use <br />Layouts</h3>
          <p className="text-outline font-light leading-relaxed text-sm">
            Choose from professionally designed templates. Start with
            a solid foundation instead of a blank page, optimized
            for performance and SEO.
          </p>
        </div>

        <div className="space-y-8 group">
          <div className="text-tertiary text-[0.625rem] tracking-[0.3em] font-bold uppercase flex items-center gap-2">
            <span className="w-1 h-1 bg-tertiary"></span> 02 / CONTROL
          </div>
          <h3 className="text-3xl font-light text-primary tracking-tight">Edit <br />Without Code</h3>
          <p className="text-outline font-light leading-relaxed text-sm">
            Modify text, images, and styles in seconds. Our direct
            editing interface gives you full control over your
            site&apos;s content without any complexity.
          </p>
        </div>

        <div className="space-y-8 group">
          <div className="text-tertiary text-[0.625rem] tracking-[0.3em] font-bold uppercase flex items-center gap-2">
            <span className="w-1 h-1 bg-tertiary"></span> 03 / DEPLOY
          </div>
          <h3 className="text-3xl font-light text-primary tracking-tight">Instant <br />Publishing</h3>
          <p className="text-outline font-light leading-relaxed text-sm">
            Launch your website globally with a single click.
            No servers to manage, no complex setup—just fast,
            reliable deployment.
          </p>
        </div>
      </div>
    </section>
  );
}
