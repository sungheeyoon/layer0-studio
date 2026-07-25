import { SupabaseClient } from '@supabase/supabase-js';
import { IAccountErasureRepository } from '@/domain/repositories/account-erasure.repository';
import { AuthError } from '@/domain/errors/auth.error';

const TOMBSTONE_BUCKET = 'user_assets';

/**
 * Every method here needs service-role privileges (RPC deletes another user's
 * rows by id, `auth.admin.*`, storage removal across RLS) — construct this
 * with the admin client only, never the per-request session client.
 */
export class SupabaseAccountErasureRepositoryImpl implements IAccountErasureRepository {
  constructor(private supabase: SupabaseClient) {}

  async requestErasure(userId: string): Promise<string[]> {
    const { data, error } = await this.supabase.rpc('request_account_erasure', {
      p_user_id: userId,
    });

    if (error) {
      console.error('[SupabaseAccountErasureRepo::requestErasure]', error.message);
      throw new AuthError('UNKNOWN');
    }

    return (data as string[] | null) ?? [];
  }

  async markDeleted(userId: string): Promise<void> {
    const { error } = await this.supabase.auth.admin.updateUserById(userId, {
      // GoTrue merges app_metadata rather than replacing it wholesale, so this
      // doesn't clobber existing keys like `role` / `canPublishTemplates`.
      app_metadata: { deletedAt: new Date().toISOString() },
    });

    if (error) {
      console.error('[SupabaseAccountErasureRepo::markDeleted]', error.message);
      throw new AuthError('UNKNOWN');
    }
  }

  /**
   * Best-effort by contract (ADR-0014): never throws. Any path that fails to
   * clear stays recorded in `asset_tombstones` (status 'failed' or already
   * 'pending') for the cleanup worker to retry — that table has no FK back to
   * `assets` or `auth.users`, so it survives both the account and the asset row.
   */
  async drainStorage(paths: string[]): Promise<void> {
    if (paths.length === 0) return;

    const { error: storageError } = await this.supabase.storage
      .from(TOMBSTONE_BUCKET)
      .remove(paths);

    if (storageError) {
      console.warn('[SupabaseAccountErasureRepo::drainStorage] storage removal failed:', storageError.message);
    }

    const { error: updateError } = await this.supabase
      .from('asset_tombstones')
      .update({
        status: storageError ? 'failed' : 'done',
        last_error: storageError?.message ?? null,
      })
      .eq('bucket', TOMBSTONE_BUCKET)
      .in('path', paths);

    if (updateError) {
      console.error('[SupabaseAccountErasureRepo::drainStorage] tombstone update failed:', updateError.message);
    }
  }

  async deleteAuthUser(userId: string): Promise<void> {
    const { error } = await this.supabase.auth.admin.deleteUser(userId);
    if (error) {
      console.error('[SupabaseAccountErasureRepo::deleteAuthUser]', error.message);
      throw new AuthError('UNKNOWN');
    }
  }
}
