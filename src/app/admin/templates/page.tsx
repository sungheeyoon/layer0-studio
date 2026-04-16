import { listTemplatesAction } from './actions';
import TemplatesClientWrapper from './TemplatesClientWrapper';

export default async function TemplatesPage() {
  const templates = await listTemplatesAction();

  return (
    <main className="ml-64 mt-12 h-[calc(100vh-48px)] grid grid-cols-12 overflow-hidden text-on-surface bg-background">
      <TemplatesClientWrapper templates={templates} />
    </main>
  );
}
