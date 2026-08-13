// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { UserSite } from '@/domain/entities/user-site.entity';
import { I18nProvider } from '@/lib/i18n/provider';
import { ko } from '@/lib/i18n/messages/ko';
import SiteListTable from './SiteListTable';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.ComponentProps<'a'> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const site: UserSite = {
  id: 'site-1',
  userId: 'user-1',
  templateId: 'template-1',
  siteName: '온유의원',
  domain: 'onyu',
  status: 'active',
  content: { mode: 'single', templateKey: 'medical-clinic', globalStyles: {} as never, blocks: [] },
  publishedContent: null,
  snapshot: { mode: 'single', templateKey: 'medical-clinic', globalStyles: {} as never, blocks: [] },
  publishedAt: '2026-08-11T00:00:00.000Z',
  createdAt: '2026-08-11T00:00:00.000Z',
  updatedAt: '2026-08-11T00:00:00.000Z',
};

afterEach(cleanup);

describe('SiteListTable responsive interaction', () => {
  it('selects a Site through focus and tap instead of hover only', () => {
    const onSelect = vi.fn();
    render(
      <I18nProvider locale="ko" dictionary={ko}>
        <SiteListTable sites={[site]} empty={null} onHoverSite={onSelect} />
      </I18nProvider>,
    );
    const row = screen.getByText(site.siteName).closest('[tabindex="0"]');
    expect(row).not.toBeNull();
    fireEvent.focus(row!);
    fireEvent.click(row!);
    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  // The link used to be `/preview/<site.id>`, which is the *Template* preview
  // route — it looked a `user_sites` id up in `templates`, so Preview 404'd for
  // every Site, published or not.
  it('points Preview at the Site preview route, not the Template one', () => {
    render(
      <I18nProvider locale="ko" dictionary={ko}>
        <SiteListTable sites={[site]} empty={null} />
      </I18nProvider>,
    );
    const preview = screen.getByRole('link', { name: ko.dashboard.common.preview });
    expect(preview).toHaveAttribute('href', '/preview/site/site-1');
  });

  // Since ADR-0017 the two buttons answer different questions — View opens the
  // published copy, Preview opens the draft — so a published Site needs both.
  it('offers both View and Preview once the Site is published', () => {
    render(
      <I18nProvider locale="ko" dictionary={ko}>
        <SiteListTable sites={[site]} empty={null} />
      </I18nProvider>,
    );
    expect(screen.getByRole('link', { name: ko.dashboard.common.view })).toHaveAttribute(
      'href',
      '/site/onyu',
    );
    expect(screen.getByRole('link', { name: ko.dashboard.common.preview })).toBeInTheDocument();
  });
});
