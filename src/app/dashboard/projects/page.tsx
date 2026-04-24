import { createClient } from '@/utils/supabase/server';
import { createListUserSitesUseCase } from '@/lib/di/container';
import ProjectsClient from './ProjectsClient';

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in to manage projects.</div>;
  }

  const listSitesUseCase = createListUserSitesUseCase(supabase);
  const sites = await listSitesUseCase.execute(user.id);

  return <ProjectsClient initialSites={sites} />;
}
