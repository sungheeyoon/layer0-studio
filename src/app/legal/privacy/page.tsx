import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Layer0 Studio",
};

export default function PrivacyPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-8">
      <div className="w-full max-w-[640px] py-24">
        <h1 className="mb-2 text-4xl font-semibold tracking-tight text-foreground">
          Privacy Policy
        </h1>
        <p className="mb-16 text-sm text-muted-foreground">
          Layer0 Studio — Data &amp; Privacy
        </p>

        <div className="mb-12 rounded-lg border border-border bg-card p-8">
          <p className="mb-4 text-sm leading-relaxed text-foreground">
            개인정보 처리방침은 법무 검토 후 게시될 예정입니다.
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Privacy Policy is currently under review and will be published shortly.
            For any inquiries, please contact us directly.
          </p>
        </div>

        <Link
          href="/"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Return home
        </Link>
      </div>
    </main>
  );
}
