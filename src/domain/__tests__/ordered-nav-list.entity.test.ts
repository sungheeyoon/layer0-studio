import { describe, expect, it } from 'vitest';
import {
  isSinglePinned,
  moveItem,
  reorderItem,
  reorderNavItem,
  toggleNavItemVisible,
  toggleSingleMenu,
  setPageMenuPlacement,
  relabelMenuItem,
  renamePage,
} from '../entities/ordered-nav-list';
import type { MultiContent, Page, SingleBlock, SingleContent } from '../entities/template.entity';

const globalStyles = {
  primaryColor: '#000000', secondaryColor: '#ffffff', backgroundColor: '#ffffff',
  fontFamily: 'Inter', fontSize: '16px', layout: 'wide',
};

function block(id: string, type: string, menu = true): SingleBlock {
  return { id, type, visible: true, ...(menu ? { menu: { label: id } } : {}), fields: {} };
}

function page(id: string): Page {
  return { id, slug: id, visible: true, name: id, menu: { label: id }, blocks: [] };
}

const singleBlocks = () => [
  block('nav', 'nav', false), block('a', 'hero'), block('b', 'about'),
  block('c', 'contact'), block('footer', 'footer', false),
];
const ids = (items: Array<{ id: string }>) => items.map((item) => item.id);

describe('ordered list core', () => {
  it('moves and reorders while respecting Single pins', () => {
    const items = singleBlocks();
    expect(moveItem(items, 'a', 'up', isSinglePinned)).toBe(items);
    expect(ids(moveItem(items, 'b', 'up', isSinglePinned))).toEqual(['nav', 'b', 'a', 'c', 'footer']);
    expect(reorderItem(items, 'a', 'footer', isSinglePinned)).toBe(items);
    expect(ids(reorderItem(items, 'a', 'c', isSinglePinned))).toEqual(['nav', 'b', 'c', 'a', 'footer']);
  });
});

const singleJson = (): SingleContent => ({
  mode: 'single', templateKey: 'cafe-default', globalStyles, blocks: singleBlocks(),
});
const multiJson = (): MultiContent => ({
  mode: 'multi', templateKey: 'medical-clinic', globalStyles,
  chrome: { header: [], footer: [] }, pages: [page('home'), page('about')],
});

describe('menu write model', () => {
  it('Single toggles menu presence and relabels only an existing menu', () => {
    const json = singleJson();
    toggleSingleMenu(json, 'a', 'ignored');
    expect(json.blocks[1].menu).toBeUndefined();
    relabelMenuItem(json, 'a', 'ignored');
    toggleSingleMenu(json, 'a', 'Welcome');
    expect(json.blocks[1].menu).toEqual({ label: 'Welcome' });
    relabelMenuItem(json, 'a', 'Start');
    expect(json.blocks[1].menu?.label).toBe('Start');
  });

  it('Multi supports none, header and footer independently from page name', () => {
    const json = multiJson();
    setPageMenuPlacement(json, 'about', 'footer');
    expect(json.pages[1].menu).toEqual({ label: 'about', placement: 'footer' });
    renamePage(json, 'about', 'About page');
    expect(json.pages[1].name).toBe('About page');
    expect(json.pages[1].menu?.label).toBe('about');
    setPageMenuPlacement(json, 'about', 'none');
    expect(json.pages[1].menu).toBeUndefined();
    setPageMenuPlacement(json, 'about', 'header');
    expect(json.pages[1].menu).toEqual({ label: 'About page' });
  });

  it('shared dispatchers still route by mode', () => {
    const single = singleJson();
    reorderNavItem(single, 'b', 'c');
    expect(ids(single.blocks)).toEqual(['nav', 'a', 'c', 'b', 'footer']);
    toggleNavItemVisible(single, 'a');
    expect(single.blocks[1].visible).toBe(false);

    const multi = multiJson();
    reorderNavItem(multi, 'home', 'about');
    expect(ids(multi.pages)).toEqual(['about', 'home']);
  });
});
