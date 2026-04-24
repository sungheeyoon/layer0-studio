import { listTemplatesAction } from './actions';
import TemplatesClientWrapper from './TemplatesClientWrapper';

export default async function TemplatesPage() {
  const templates = await listTemplatesAction();

  if ('error' in templates) {
    return <div className="ml-64 mt-20 p-8 text-error">Error: {templates.error}</div>;
  }

  return (
    <main className="ml-64 mt-12 h-[calc(100vh-48px)] grid grid-cols-12 overflow-hidden text-on-surface bg-background">
      <TemplatesClientWrapper templates={templates} />
    </main>
  );
}
