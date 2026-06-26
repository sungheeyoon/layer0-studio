import { loadSiteAction } from './actions';
import DynamicEditor from '@/components/editor/DynamicEditor';
import { getLocale } from '@/lib/i18n/server';
import { getDictionary } from '@/lib/i18n/dictionary';
import { Button } from '@/components/ui/button';

interface EditorPageProps {
  searchParams: Promise<{ siteId?: string }>;
}

export default async function EditorPage({ searchParams }: EditorPageProps) {
  const params = await searchParams;
  const siteId = params.siteId;
  const t = getDictionary(await getLocale()).editor;

  if (!siteId) {
    return (
      <main className="flex h-full items-center justify-center p-8">
        <div className="space-y-4 text-center">
          <h2 className="text-heading">{t.noSiteSelected}</h2>
          <p className="text-body text-muted-foreground">{t.noSiteSelectedHint}</p>
          <Button asChild className="mt-2">
            <a href="/dashboard/templates">{t.browseTemplates}</a>
          </Button>
        </div>
      </main>
    );
  }

  const site = await loadSiteAction(siteId);

  if (!site) {
    return (
      <main className="flex h-full items-center justify-center p-8">
        <div className="space-y-4 text-center">
          <h2 className="text-heading">{t.siteNotFound}</h2>
          <Button asChild className="mt-2">
            <a href="/dashboard/templates">{t.browseTemplates}</a>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-full">
      <DynamicEditor site={site} />
    </main>
  );
}
