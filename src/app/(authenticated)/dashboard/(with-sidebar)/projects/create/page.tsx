import { createClient } from '@/utils/supabase/server';
import { createGetTemplateUseCase } from '@/lib/di/template-read';
import { redirect } from 'next/navigation';
import CreateProjectClient from './CreateProjectClient';

interface PageProps {
  searchParams: Promise<{ templateId?: string }>;
}

export default async function CreateProjectPage({ searchParams }: PageProps) {
  const { templateId } = await searchParams;

  if (!templateId) {
    redirect('/dashboard/templates');
  }

  const supabase = await createClient();
  const getTemplateUseCase = createGetTemplateUseCase(supabase);
  const template = await getTemplateUseCase.execute(templateId);

  if (!template) {
    redirect('/dashboard/templates');
  }

  return (
    <div className="min-h-full">
      <CreateProjectClient template={template} />
    </div>
  );
}
