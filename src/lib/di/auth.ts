import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseAuthRepositoryImpl } from '@/data/repositories/supabase-auth.repository.impl';
import { SupabaseAccountErasureRepositoryImpl } from '@/data/repositories/supabase-account-erasure.repository.impl';
import { LoginUseCase } from '@/domain/usecases/login.usecase';
import { SignupUseCase } from '@/domain/usecases/signup.usecase';
import { LogoutUseCase } from '@/domain/usecases/logout.usecase';
import { DeleteAccountUseCase } from '@/domain/usecases/delete-account.usecase';
import { ChangePasswordUseCase } from '@/domain/usecases/change-password.usecase';

export const createLoginUseCase = (supabase: SupabaseClient) => {
  const repository = new SupabaseAuthRepositoryImpl(supabase);
  return new LoginUseCase(repository);
};

export const createSignupUseCase = (supabase: SupabaseClient) => {
  const repository = new SupabaseAuthRepositoryImpl(supabase);
  return new SignupUseCase(repository);
};

export const createLogoutUseCase = (supabase: SupabaseClient) => {
  const repository = new SupabaseAuthRepositoryImpl(supabase);
  return new LogoutUseCase(repository);
};

/**
 * Every stage (RPC deleting another user's rows by id, `auth.admin.*`,
 * storage removal across RLS) needs service-role privileges — pass the admin
 * client here, not the per-request session client from `withUser`.
 */
export const createDeleteAccountUseCase = (adminSupabase: SupabaseClient) => {
  const repository = new SupabaseAccountErasureRepositoryImpl(adminSupabase);
  return new DeleteAccountUseCase(repository);
};

export const createChangePasswordUseCase = (supabase: SupabaseClient) => {
  const repository = new SupabaseAuthRepositoryImpl(supabase);
  return new ChangePasswordUseCase(repository);
};
