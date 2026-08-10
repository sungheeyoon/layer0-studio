// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import MenuBento, { menuBentoSchema, type MenuBentoContent } from './MenuBento';
import type { Block } from '@/domain/entities/template.entity';

// @testing-library's auto-cleanup only self-registers under `globals: true`,
// which this repo does not use — without this the previous test's markup stays.
afterEach(cleanup);

/** Build a Block whose `fields` hold Values (ADR-0016), not Field objects. */
function blockWith(content: MenuBentoContent): Block {
  return {
    id: 'menu-001',
    type: 'menu',
    visible: true,
    fields: content as unknown as Block['fields'],
  };
}

const base: MenuBentoContent = {
  eyebrow: '메뉴',
  title: '오늘의 메뉴',
  description: '직접 로스팅한 원두',
  items: [
    {
      id: 'itm-a',
      fields: {
        title: '모노 라떼',
        desc: '흑당 카라멜',
        price: '6500',
        image: { url: 'https://cdn/latte.jpg', assetId: 'asset-1' },
        badge: 'BEST',
      },
    },
    { id: 'itm-b', fields: { title: '콜드브루', desc: '12시간 추출', price: '5500' } },
  ],
};

describe('MenuBento — schema-first rendering (ADR-0016)', () => {
  it('renders values straight from the Content, with no getFieldValue unwrapping', () => {
    render(<MenuBento block={blockWith(base)} />);

    expect(screen.getByText('메뉴')).toBeDefined();
    expect(screen.getByText('모노 라떼')).toBeDefined();
    expect(screen.getByText('콜드브루')).toBeDefined();
    expect(screen.getByText('흑당 카라멜')).toBeDefined();
  });

  it('reads an array-item image through ImageValue.url', () => {
    render(<MenuBento block={blockWith(base)} />);

    const img = screen.getByAltText('모노 라떼') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('https://cdn/latte.jpg');
  });

  it('falls back when optional Values are absent', () => {
    const bare: MenuBentoContent = {
      items: [{ id: 'itm-a', fields: { title: '아메리카노' } }],
    };
    render(<MenuBento block={blockWith(bare)} />);

    // Optional `eyebrow`/`title` fall back to the renderer's defaults — the
    // fallback discipline ADR-0016 §6 requires now that getFieldValue's
    // blanket `?? ''` is gone.
    expect(screen.getByText('메뉴')).toBeDefined();
    expect(screen.getByText('아메리카노')).toBeDefined();
  });

  it('drops items whose required title is empty rather than rendering a blank card', () => {
    const withBlank: MenuBentoContent = {
      items: [
        { id: 'a', fields: { title: '' } },
        { id: 'b', fields: { title: '라떼' } },
      ],
    };
    render(<MenuBento block={blockWith(withBlank)} />);
    expect(screen.getByText('라떼')).toBeDefined();
  });

  it('exports the same schema object the Content type was derived from', () => {
    expect(menuBentoSchema.items.itemSchema.title.required).toBe(true);
    expect(MenuBento.meta?.fieldsSchema).toBe(menuBentoSchema);
  });
});
