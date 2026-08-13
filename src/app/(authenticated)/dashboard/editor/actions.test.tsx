import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ContentModel } from '@/domain/entities/template.entity';

const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  saveContent: vi.fn(),
}));

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('@/lib/actions/server-action', () => ({
  withUser: (operation: (user: { id: string }, supabase: object) => unknown) =>
    operation({ id: 'user-1' }, {}),
}));
vi.mock('@/lib/di/site-content-write', () => ({
  createSiteWriteUseCase: () => ({ saveContent: mocks.saveContent }),
}));

import { saveContentAction } from './actions';

const content: ContentModel = {
  mode: 'single',
  templateKey: 'cafe-default',
  globalStyles: {
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    backgroundColor: '#ffffff',
    fontFamily: 'sans-serif',
    fontSize: '16px',
    layout: 'wide',
  },
  blocks: [],
};

describe('saveContentAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.saveContent.mockResolvedValue({ updatedAt: '2026-08-13T08:00:00.000Z' });
  });

  it('does not refresh the current Editor tree after saving client-owned content', async () => {
    const result = await saveContentAction(
      'site-1',
      content,
      '2026-08-13T07:59:00.000Z',
    );

    expect(result).toEqual({ success: true, updatedAt: '2026-08-13T08:00:00.000Z' });
    expect(mocks.saveContent).toHaveBeenCalledWith(
      'site-1',
      'user-1',
      content,
      '2026-08-13T07:59:00.000Z',
    );
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});
