'use server';

import { createAdminClient } from '@/utils/supabase/server';
import { createChangePasswordUseCase } from '@/lib/di/container';
import { redirect } from 'next/navigation';
import { withUser } from '@/lib/actions/server-action';

export async function changePasswordAction(password: string) {
  return withUser(async (_user, supabase) => {
    const useCase = createChangePasswordUseCase(supabase);
    await useCase.execute(password);
    return { success: true as const };
  });
}

export async function deleteAccountAction() {
  return withUser(async (user, supabase) => {
    const adminSupabase = await createAdminClient();

    // 1. Delete user sites
    await adminSupabase.from('user_sites').delete().eq('user_id', user.id);

    // 2. Delete user assets
    await adminSupabase.from('assets').delete().eq('user_id', user.id);

    // 3. Delete user from Supabase Auth
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error('[deleteAccountAction] Error:', deleteError);
      return { error: 'UNKNOWN' };
    }

    // 4. Sign out current session
    await supabase.auth.signOut();

    // Redirect to home or login page after successful deletion
    redirect('/');
  });
}
