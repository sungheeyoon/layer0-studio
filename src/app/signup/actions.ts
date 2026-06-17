'use server';

import { createClient } from '@/utils/supabase/server';
import { createSignupUseCase } from '@/lib/di/container';
import { withAction } from '@/lib/actions/server-action';

export async function signupAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  return withAction(async () => {
    const supabase = await createClient();
    const signupUseCase = createSignupUseCase(supabase);
    const user = await signupUseCase.execute(email, password);
    return { success: true as const, user };
  });
}
