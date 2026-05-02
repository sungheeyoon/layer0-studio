import { listTemplatesAction } from './actions';
import TemplatesClientWrapper from './TemplatesClientWrapper';
import { createClient } from '@/utils/supabase/server';

export default async function TemplatesPage() {
  const templates = await listTemplatesAction();
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const canPublish = user?.app_metadata?.canPublishTemplates === true;

  if ('error' in templates) {
    return <div className="p-8 text-error">Error: {templates.error}</div>;
  }

  return (
    <main className="h-[calc(100vh-48px)] grid grid-cols-12 overflow-hidden text-on-surface bg-background">
      <TemplatesClientWrapper templates={templates} canPublish={canPublish} />
    </main>
  );
}
