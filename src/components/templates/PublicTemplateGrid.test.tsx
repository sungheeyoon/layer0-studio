// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import type { Template } from '@/domain/entities/template.entity';
import { I18nProvider } from '@/lib/i18n/provider';
import { ko } from '@/lib/i18n/messages/ko';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/app/(authenticated)/dashboard/(with-sidebar)/templates/actions', () => ({
  listPaginatedTemplatesAction: vi.fn(),
}));

import PublicTemplateGrid from './PublicTemplateGrid';

const template: Template = {
  id: 'template-1',
  name: '온유의원',
  description: '모바일에서도 선택과 미리보기가 보여야 하는 실제 Template 설명입니다.',
  slug: 'medical-clinic',
  category: 'medical',
  status: 'active',
  thumbnailUrl: 'https://example.com/template.webp',
  content: {
    mode: 'single',
    templateKey: 'medical-clinic',
    globalStyles: {} as never,
    blocks: [],
  },
  version: '1.0.0',
  createdBy: 'user-1',
  createdAt: '2026-08-11T00:00:00.000Z',
  updatedAt: '2026-08-11T00:00:00.000Z',
};

afterEach(cleanup);

describe('PublicTemplateGrid input-independent actions', () => {
  it('renders Template selection and Preview without a hover-only ancestor', () => {
    render(
      <I18nProvider locale="ko" dictionary={ko}>
        <PublicTemplateGrid templates={[template]} categories={['medical']} initialTotal={1} />
      </I18nProvider>,
    );

    const use = screen.getByRole('button', { name: ko.templatesCatalog.useTemplate });
    const preview = screen.getByRole('link', { name: ko.templatesCatalog.preview });
    expect(use.closest('.opacity-0')).toBeNull();
    expect(preview.closest('.opacity-0')).toBeNull();
    expect(preview).toHaveAttribute('href', '/preview/template-1');
  });

  it('keeps category controls in one horizontally scrollable row', () => {
    const { container } = render(
      <I18nProvider locale="ko" dictionary={ko}>
        <PublicTemplateGrid templates={[template]} categories={['medical']} initialTotal={1} />
      </I18nProvider>,
    );
    expect(container.querySelector('.overflow-x-auto')).toBeInTheDocument();
  });
});
