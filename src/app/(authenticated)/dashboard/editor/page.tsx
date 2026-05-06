import { loadSiteAction } from './actions';
import DynamicEditor from '@/components/editor/DynamicEditor';

interface EditorPageProps {
  searchParams: Promise<{ siteId?: string }>;
}

export default async function EditorPage({ searchParams }: EditorPageProps) {
  const params = await searchParams;
  const siteId = params.siteId;

  if (!siteId) {
    return (
      <main className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-['Inter'] font-light text-2xl tracking-wider mb-4">No site selected</h2>
          <p className="font-['Inter'] font-light text-sm text-on-surface-variant mb-8">
            Please select a template first to start editing.
          </p>
          <a
            href="/dashboard/templates"
            className="border border-outline px-6 py-2 font-['Inter'] font-light text-[0.6875rem] uppercase tracking-[0.1em] hover:bg-primary hover:text-white transition-colors"
          >
            Browse Templates
          </a>
        </div>
      </main>
    );
  }

  const site = await loadSiteAction(siteId);

  if (!site) {
    return (
      <main className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-['Inter'] font-light text-2xl tracking-wider mb-4">Site not found</h2>
          <a
            href="/dashboard/templates"
            className="border border-outline px-6 py-2 font-['Inter'] font-light text-[0.6875rem] uppercase tracking-[0.1em] hover:bg-primary hover:text-white transition-colors"
          >
            Browse Templates
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="h-full flex">
      <DynamicEditor site={site} />
    </main>
  );
}
