'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { createLoginUseCase } from '@/lib/di/container';
import { withAction } from '@/lib/actions/server-action';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  return withAction(async () => {
    const supabase = await createClient();
    const loginUseCase = createLoginUseCase(supabase);
    const user = await loginUseCase.execute(email, password);
    return { success: true as const, user };
  });
}

export async function logoutAction() {
  const supabase = await createClient();
  const { createLogoutUseCase } = await import('@/lib/di/container');
  const logoutUseCase = createLogoutUseCase(supabase);

  try {
    await logoutUseCase.execute();
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false };
  }

  revalidatePath('/', 'layout');
  redirect('/login');
}
