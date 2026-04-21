'use server';

import { createClient } from '@/utils/supabase/server';
import { createLoginUseCase } from '@/lib/di/container';
import { AuthError } from '@/domain/errors/auth.error';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createClient();
  const loginUseCase = createLoginUseCase(supabase);

  try {
    const user = await loginUseCase.execute(email, password);

    return {
      success: true,
      user,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        code: error.code,
      };
    }

    return {
      success: false,
      code: 'UNKNOWN',
    };
  }
}

export async function logoutAction() {
  const supabase = await createClient();
  const { createLogoutUseCase } = await import('@/lib/di/container');
  const logoutUseCase = createLogoutUseCase(supabase);

  try {
    await logoutUseCase.execute();
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false };
  }
}
