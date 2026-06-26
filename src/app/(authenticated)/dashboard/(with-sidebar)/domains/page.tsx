import DomainsClient from './DomainsClient';
import { getLocale } from '@/lib/i18n/server';
import { getDictionary } from '@/lib/i18n/dictionary';

export default async function DomainsPage() {
  const t = getDictionary(await getLocale()).dashboard.domains;
  return (
    <div className="mx-auto w-full max-w-4xl">
      <header className="mb-10">
        <h1 className="text-heading">{t.title}</h1>
        <p className="text-body mt-2 text-muted-foreground">{t.description}</p>
      </header>

      <DomainsClient />
    </div>
  );
}
