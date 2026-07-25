import { describe, it, expect } from 'vitest';
import { DeleteAccountUseCase } from '../usecases/delete-account.usecase';
import { FakeAccountErasureRepository } from './fakes';

describe('DeleteAccountUseCase', () => {
  it('rejects a missing user id before touching the repository', async () => {
    const repo = new FakeAccountErasureRepository();
    const uc = new DeleteAccountUseCase(repo);

    await expect(uc.execute('')).rejects.toThrow('User ID is required');
    expect(repo.calls).toEqual([]);
  });

  it('runs the pipeline in strict order: requestErasure -> markDeleted -> drainStorage -> deleteAuthUser', async () => {
    const repo = new FakeAccountErasureRepository(['user-1/asset-1/photo.png']);
    const uc = new DeleteAccountUseCase(repo);

    await uc.execute('user-1');

    expect(repo.calls).toEqual(['requestErasure', 'markDeleted', 'drainStorage', 'deleteAuthUser']);
  });

  it('passes the tombstoned paths from requestErasure straight into drainStorage', async () => {
    const paths = ['user-1/asset-1/a.png', 'user-1/asset-2/b.png'];
    const repo = new FakeAccountErasureRepository(paths);
    const uc = new DeleteAccountUseCase(repo);

    await uc.execute('user-1');

    expect(repo.drainedPaths).toEqual(paths);
  });

  it('never calls deleteAuthUser before drainStorage, even if there is nothing to drain', async () => {
    const repo = new FakeAccountErasureRepository([]);
    const uc = new DeleteAccountUseCase(repo);

    await uc.execute('user-1');

    const drainIdx = repo.calls.indexOf('drainStorage');
    const authIdx = repo.calls.indexOf('deleteAuthUser');
    expect(drainIdx).toBeGreaterThanOrEqual(0);
    expect(authIdx).toBeGreaterThan(drainIdx);
  });

  it('does not throw when a post-commit step (deleteAuthUser) fails — the commit point already succeeded', async () => {
    const repo = new FakeAccountErasureRepository(['user-1/asset-1/photo.png'], 'deleteAuthUser');
    const uc = new DeleteAccountUseCase(repo);

    await expect(uc.execute('user-1')).resolves.toBeUndefined();
    expect(repo.calls).toEqual(['requestErasure', 'markDeleted', 'drainStorage', 'deleteAuthUser']);
  });

  it('does not throw when markDeleted fails, and still attempts the remaining steps', async () => {
    const repo = new FakeAccountErasureRepository(['user-1/asset-1/photo.png'], 'markDeleted');
    const uc = new DeleteAccountUseCase(repo);

    await expect(uc.execute('user-1')).resolves.toBeUndefined();
    // markDeleted's own failure must not block the rest of the best-effort pipeline.
    expect(repo.calls).toEqual(['requestErasure', 'markDeleted', 'drainStorage', 'deleteAuthUser']);
  });

  it('still throws when requestErasure (the commit point) itself fails — nothing happened yet', async () => {
    const repo = new FakeAccountErasureRepository();
    repo.requestErasure = async () => {
      throw new Error('DB unreachable');
    };
    const uc = new DeleteAccountUseCase(repo);

    await expect(uc.execute('user-1')).rejects.toThrow('DB unreachable');
  });
});
