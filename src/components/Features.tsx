import type { Messages } from "@/lib/i18n/messages/ko";

export default function Features({
  copy,
}: {
  copy: Messages["landing"]["features"];
}) {
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
          <h3 className="text-3xl font-light text-primary tracking-tight">{copy.layouts.title}</h3>
          <p className="text-outline font-light leading-relaxed text-sm">
            {copy.layouts.body}
          </p>
        </div>

        <div className="space-y-8 group">
          <div className="text-tertiary text-[0.625rem] tracking-[0.3em] font-bold uppercase flex items-center gap-2">
            <span className="w-1 h-1 bg-tertiary"></span> 02 / CONTROL
          </div>
          <h3 className="text-3xl font-light text-primary tracking-tight">{copy.editing.title}</h3>
          <p className="text-outline font-light leading-relaxed text-sm">
            {copy.editing.body}
          </p>
        </div>

        <div className="space-y-8 group">
          <div className="text-tertiary text-[0.625rem] tracking-[0.3em] font-bold uppercase flex items-center gap-2">
            <span className="w-1 h-1 bg-tertiary"></span> 03 / DEPLOY
          </div>
          <h3 className="text-3xl font-light text-primary tracking-tight">{copy.publishing.title}</h3>
          <p className="text-outline font-light leading-relaxed text-sm">
            {copy.publishing.body}
          </p>
        </div>
      </div>
    </section>
  );
}
