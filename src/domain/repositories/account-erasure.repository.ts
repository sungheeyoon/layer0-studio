/**
 * Account Erasure port (ADR-0014). Each method is one stage of the pipeline;
 * `DeleteAccountUseCase` owns the order they run in.
 */
export interface IAccountErasureRepository {
  /**
   * The commit point: request record + row deletes + Tombstone issuance, all
   * in one DB transaction (`request_account_erasure` RPC). Returns the
   * storage paths just tombstoned so the caller can attempt an inline drain.
   */
  requestErasure(userId: string): Promise<string[]>;

  /** Locks the account out immediately (`app_metadata.deletedAt`). */
  markDeleted(userId: string): Promise<void>;

  /** Best-effort storage removal. Must not throw — leftover paths stay in
   * `asset_tombstones` for the cleanup worker to retry. */
  drainStorage(paths: string[]): Promise<void>;

  /** Final step: destroys the auth principal. */
  deleteAuthUser(userId: string): Promise<void>;
}
