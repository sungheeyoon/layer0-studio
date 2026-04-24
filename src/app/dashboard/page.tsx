import { createClient } from '@/utils/supabase/server';
import { createListUserSitesUseCase } from '@/lib/di/container';
import DashboardClient from './DashboardClient';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const listSitesUseCase = createListUserSitesUseCase(supabase);
  const sites = await listSitesUseCase.execute(user.id);

  return <DashboardClient initialSites={sites} />;
}
