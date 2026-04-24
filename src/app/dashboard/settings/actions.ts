'use server';

import { createClient, createAdminClient } from '@/utils/supabase/server';
import { createChangePasswordUseCase } from '@/lib/di/container';
import { AuthError } from '@/domain/errors/auth.error';
import { redirect } from 'next/navigation';

export async function changePasswordAction(password: string) {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: 'UNAUTHORIZED' };
  }

  try {
    const useCase = createChangePasswordUseCase(supabase);
    await useCase.execute(password);
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: error.code };
    }
    return { error: 'UNKNOWN' };
  }
}

export async function deleteAccountAction() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { error: 'UNAUTHORIZED' };
  }

  try {
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
    
  } catch (error) {
    console.error('[deleteAccountAction] Unexpected error:', error);
    return { error: 'UNKNOWN' };
  }

  // Redirect to home or login page after successful deletion
  redirect('/');
}
