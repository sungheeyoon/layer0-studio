import { SupabaseClient } from '@supabase/supabase-js';
import { IAuthRepository } from '@/domain/repositories/auth.repository';
import { User } from '@/domain/entities/user.entity';
import { AuthError } from '@/domain/errors/auth.error';

export class SupabaseAuthRepositoryImpl implements IAuthRepository {
  constructor(private supabase: SupabaseClient) {}

  async login(email: string, password: string): Promise<User> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[Supabase::login] Error:', error.message);
      if (error.message.includes('Email not confirmed')) {
        throw new AuthError('EMAIL_NOT_CONFIRMED');
      }
      throw new AuthError('WRONG_CREDENTIALS');
    }

    if (!data.user) {
      throw new AuthError('UNKNOWN');
    }

    return {
      id: data.user.id,
      email: data.user.email!,
    };
  }

  async signup(email: string, password: string): Promise<User> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('[Supabase::signup] Error:', error.message);
      throw new AuthError('USER_ALREADY_EXISTS');
    }

    if (!data.user) {
      throw new AuthError('UNKNOWN');
    }

    return {
      id: data.user.id,
      email: data.user.email!,
    };
  }

  async deleteUser(userId: string): Promise<void> {
    // Note: Edge functions or service_role key are usually required to delete a user.
    // Provided here to align with the domain architecture.
    const { error } = await this.supabase.auth.admin.deleteUser(userId);
    if (error) {
      throw new AuthError('UNKNOWN');
    }
  }

  async updatePassword(password: string): Promise<void> {
    const { error } = await this.supabase.auth.updateUser({ password });
    if (error) {
      throw new AuthError('UNKNOWN');
    }
  }
}
