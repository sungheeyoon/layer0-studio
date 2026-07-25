import { IAccountErasureRepository } from '../repositories/account-erasure.repository';

/**
 * Storage-before-auth is a business rule, not an implementation detail: the
 * Tombstone drain must be attempted while the request record is still fresh,
 * and the auth principal is only ever destroyed last (ADR-0014).
 */
export class DeleteAccountUseCase {
  constructor(private repository: IAccountErasureRepository) {}

  async execute(userId: string): Promise<void> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Commit point: a failure here means nothing happened yet, so let it throw.
    const tombstonePaths = await this.repository.requestErasure(userId);

    // Past the commit point the account is already erased at the DB level —
    // each remaining step is attempted independently so one failure (e.g. a
    // transient auth-admin-API error) can't stop the others from running.
    // Never surface these as an error to the caller: it would be misleading
    // for a deletion that already succeeded. The cleanup worker is the
    // safety net for whatever didn't finish (ADR-0014).
    await this.attempt(() => this.repository.markDeleted(userId));
    await this.attempt(() => this.repository.drainStorage(tombstonePaths));
    await this.attempt(() => this.repository.deleteAuthUser(userId));
  }

  private async attempt(step: () => Promise<void>): Promise<void> {
    try {
      await step();
    } catch (err) {
      console.error('[DeleteAccountUseCase] post-commit step failed (durable; worker will retry):', err);
    }
  }
}
