import DomainsClient from './DomainsClient';
import { getLocale } from '@/lib/i18n/server';
import { getDictionary } from '@/lib/i18n/dictionary';

export default async function DomainsPage() {
  const t = getDictionary(await getLocale()).dashboard.domains;
  return (
    <main className="p-10 min-h-[calc(100vh-124px)]">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl font-light text-primary tracking-tight uppercase mb-2">{t.title}</h1>
          <p className="text-outline text-sm font-light tracking-wide">
            {t.description}
          </p>
        </header>

        <DomainsClient />
      </div>
    </main>
  );
}
