import { listTemplatesAction } from './actions';
import TemplatesClientWrapper from './TemplatesClientWrapper';
import { createClient } from '@/utils/supabase/server';

export default async function TemplatesPage() {
  const templates = await listTemplatesAction();
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const canPublish = user?.app_metadata?.canPublishTemplates === true;

  if ('error' in templates) {
    return <div className="p-8 text-destructive">오류: {templates.error}</div>;
  }

  return (
    <main className="h-[calc(100vh-3.5rem)] grid grid-cols-12 overflow-hidden text-foreground bg-background">
      <TemplatesClientWrapper templates={templates} canPublish={canPublish} />
    </main>
  );
}
