// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ko } from '@/lib/i18n/messages/ko';

vi.mock('@/lib/auth/current-user', () => ({ getCurrentUser: vi.fn().mockResolvedValue(null) }));
vi.mock('@/lib/i18n/server', () => ({ getLocale: vi.fn().mockResolvedValue('ko') }));
vi.mock('@/lib/i18n/dictionary', () => ({ getDictionary: () => ko }));
vi.mock('@/app/(authenticated)/dashboard/(with-sidebar)/templates/actions', () => ({
  listPaginatedTemplatesAction: vi.fn().mockResolvedValue({ data: [] }),
}));
vi.mock('@/components/Hero', () => ({ default: () => null }));
vi.mock('@/components/Features', () => ({ default: () => null }));
vi.mock('@/components/Footer', () => ({ default: () => null }));
vi.mock('@/components/EditorPreview', () => ({ default: () => null }));

import Home from './page';

afterEach(cleanup);

describe('Home how-it-works heading', () => {
  it('stacks the two title lines and lead copy on the same axis', async () => {
    render(await Home());

    expect(screen.getByText(ko.landing.howItWorks.title)).toHaveClass('block');
    expect(screen.getByText(ko.landing.howItWorks.subtitle)).toHaveClass('block');
    expect(screen.getByText(ko.landing.howItWorks.lead)).toHaveClass('md:whitespace-nowrap');
  });
});
