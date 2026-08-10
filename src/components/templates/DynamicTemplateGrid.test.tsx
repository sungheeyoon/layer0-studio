// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import type { Template } from '@/domain/entities/template.entity';
import { I18nProvider } from '@/lib/i18n/provider';
import { ko } from '@/lib/i18n/messages/ko';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/app/(authenticated)/dashboard/(with-sidebar)/templates/actions', () => ({
  listPaginatedTemplatesAction: vi.fn(),
}));

import DynamicTemplateGrid from './DynamicTemplateGrid';
import TemplatesLoading from '@/app/(authenticated)/dashboard/(with-sidebar)/templates/loading';

const template: Template = {
  id: 'template-1',
  name: '16:9 Template',
  description: null,
  slug: 'test-template',
  category: 'Test',
  status: 'active',
  thumbnailUrl: 'https://example.com/thumbnail.webp',
  content: {
    mode: 'single',
    templateKey: 'test-template',
    globalStyles: {
      primaryColor: '#000000',
      secondaryColor: '#ffffff',
      backgroundColor: '#ffffff',
      fontFamily: 'sans-serif',
      fontSize: '16px',
      layout: 'wide',
    },
    blocks: [],
  },
  version: '1.0.0',
  createdBy: 'user-1',
  createdAt: '2026-08-10T00:00:00.000Z',
  updatedAt: '2026-08-10T00:00:00.000Z',
};

afterEach(cleanup);

describe('dashboard Template thumbnails', () => {
  it('renders the canonical 16:9 thumbnail without a 16:10 crop container', () => {
    render(
      <I18nProvider locale="ko" dictionary={ko}>
        <DynamicTemplateGrid
          templates={[template]}
          mySites={[]}
          categories={['Test']}
          initialTotal={1}
        />
      </I18nProvider>,
    );

    const frame = screen.getByAltText(template.name).parentElement;
    expect(frame).toHaveClass('aspect-video');
    expect(frame).not.toHaveClass('aspect-[16/10]');
  });

  it('uses the same 16:9 ratio for loading placeholders', () => {
    const { container } = render(<TemplatesLoading />);

    expect(container.querySelectorAll('.aspect-video')).toHaveLength(6);
    expect(container.querySelectorAll('.aspect-\\[16\\/10\\]')).toHaveLength(0);
  });
});
