'use server';

import { createAdminClient } from '@/utils/supabase/server';
import { createChangePasswordUseCase, createDeleteAccountUseCase } from '@/lib/di/auth';
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
    const useCase = createDeleteAccountUseCase(adminSupabase);

    // Orchestration (commit point -> lock -> storage drain -> auth delete) is
    // owned by DeleteAccountUseCase per ADR-0014 — this action just runs it
    // and tears down the caller's own session.
    await useCase.execute(user.id);

    await supabase.auth.signOut();

    redirect('/');
  });
}
