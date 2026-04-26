import Link from "next/link";

export const metadata = {
  title: "Terms of Service — Layer0 Studio",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen blueprint-grid flex flex-col items-center justify-center px-8">
      <div className="w-full max-w-[640px] py-24">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1 h-1 bg-tertiary"></span>
          <span className="font-label text-[10px] font-medium tracking-[0.2em] uppercase text-zinc-500">Legal_Document</span>
        </div>
        <h1 className="font-headline text-4xl font-thin tracking-tight text-zinc-900 mb-2">TERMS_OF_SERVICE</h1>
        <p className="font-body text-xs font-light tracking-wider text-zinc-400 mb-16">LAYER0 STUDIO — USAGE TERMS & CONDITIONS</p>

        <div className="border border-zinc-100 p-8 mb-12">
          <p className="font-body text-sm font-light text-zinc-600 leading-relaxed mb-4">
            서비스 이용약관은 법무 검토 후 게시될 예정입니다.
          </p>
          <p className="font-body text-xs font-light text-zinc-400 leading-relaxed">
            Terms of Service are currently under review and will be published shortly.
            For any inquiries, please contact us directly.
          </p>
        </div>

        <Link
          href="/"
          className="font-label text-[9px] font-light tracking-[0.15em] uppercase text-zinc-400 hover:text-zinc-900 border-b border-transparent hover:border-zinc-900 pb-0.5 transition-colors"
        >
          ← RETURN_HOME
        </Link>
      </div>
    </main>
  );
}
