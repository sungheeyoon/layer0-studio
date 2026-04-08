'use server';

import { createClient } from '@/utils/supabase/server';
import { createSignupUseCase } from '@/lib/di/container';
import { AuthError } from '@/domain/errors/auth.error';

export async function signupAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  // TODO: Handle full_name and workspace_id if needed by the domain

  const supabase = await createClient();
  const signupUseCase = createSignupUseCase(supabase);

  try {
    const user = await signupUseCase.execute(email, password);

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
