import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getLocale } from '@/lib/i18n/server';
import { getDictionary } from '@/lib/i18n/dictionary';

export default async function EditorLayout({ children }: { children: React.ReactNode }) {
  const t = getDictionary(await getLocale()).editor;

  return (
    <div className="flex h-dvh w-full flex-col bg-background">
      <div className="flex h-12 shrink-0 items-center border-b border-border bg-card px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {t.backToDashboard}
        </Link>
      </div>
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
