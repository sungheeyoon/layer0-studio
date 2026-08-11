// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ko } from '@/lib/i18n/messages/ko';
import type { Template } from '@/domain/entities/template.entity';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.ComponentProps<'a'> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import Hero from './Hero';

const templates = ['의료', '학원', '아웃도어'].map((category, index) => ({
  id: `template-${index}`,
  name: `Template ${index + 1}`,
  description: null,
  slug: `template-${index}`,
  category,
  status: 'active',
  thumbnailUrl: `/template-${index}.webp`,
  content: {} as Template['content'],
  version: '1.0.0',
  createdBy: 'test',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
})) satisfies Template[];

beforeEach(() => {
  vi.useFakeTimers();
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('Hero template carousel', () => {
  it('rotates every five seconds and exposes direct controls', () => {
    render(
      <Hero
        copy={ko.landing.hero}
        ctaLabel="템플릿 둘러보기"
        primaryCtaHref="/signup"
        primaryCtaLabel="시작하기"
        templates={templates}
      />,
    );

    expect(screen.getByRole('img', { name: 'Template 1' })).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByRole('img', { name: 'Template 2' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: ko.landing.hero.nextTemplate }));
    expect(screen.getByRole('img', { name: 'Template 3' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: ko.landing.hero.pauseCarousel }));
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByRole('img', { name: 'Template 3' })).toBeInTheDocument();
  });
});
