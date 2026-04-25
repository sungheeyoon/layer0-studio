import { listTemplatesAction } from './actions';
import TemplatesClientWrapper from './TemplatesClientWrapper';

export default async function TemplatesPage() {
  const templates = await listTemplatesAction();

  if ('error' in templates) {
    return <div className="p-8 text-error">Error: {templates.error}</div>;
  }

  return (
    <main className="h-[calc(100vh-48px)] grid grid-cols-12 overflow-hidden text-on-surface bg-background">
      <TemplatesClientWrapper templates={templates} />
    </main>
  );
}
