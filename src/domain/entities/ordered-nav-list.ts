import {
  ContentModel,
  MenuEntry,
  SingleBlock,
  isSingleContent,
} from './template.entity';

export type MoveDirection = 'up' | 'down';
export type MenuPlacement = 'none' | 'header' | 'footer';

interface IdItem { id: string }
interface VisibleItem extends IdItem { visible: boolean }

export function moveItem<T extends IdItem>(
  items: T[],
  id: string,
  direction: MoveDirection,
  isPinned: (item: T) => boolean = () => false,
): T[] {
  const index = items.findIndex((item) => item.id === id);
  if (index < 0) return items;
  const target = direction === 'up' ? index - 1 : index + 1;
  if (target < 0 || target >= items.length) return items;
  if (isPinned(items[index]) || isPinned(items[target])) return items;
  const next = items.slice();
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function reorderItem<T extends IdItem>(
  items: T[],
  activeId: string,
  overId: string,
  isPinned: (item: T) => boolean = () => false,
): T[] {
  if (activeId === overId) return items;
  const from = items.findIndex((item) => item.id === activeId);
  const to = items.findIndex((item) => item.id === overId);
  if (from < 0 || to < 0 || isPinned(items[from]) || isPinned(items[to])) return items;
  const next = items.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export function toggleVisible<T extends VisibleItem>(items: T[], id: string): T[] {
  return items.map((item) => item.id === id ? { ...item, visible: !item.visible } : item);
}

export function isSinglePinned(block: SingleBlock): boolean {
  return block.type === 'nav' || block.type === 'footer';
}

export function moveNavItem(json: ContentModel, id: string, direction: MoveDirection): void {
  if (isSingleContent(json)) json.blocks = moveItem(json.blocks, id, direction, isSinglePinned);
  else json.pages = moveItem(json.pages, id, direction);
}

export function reorderNavItem(json: ContentModel, activeId: string, overId: string): void {
  if (isSingleContent(json)) {
    json.blocks = reorderItem(json.blocks, activeId, overId, isSinglePinned);
  } else {
    json.pages = reorderItem(json.pages, activeId, overId);
  }
}

/** Multi only: reorder Blocks within one Page without moving its Chrome. */
export function reorderPageBlock(
  json: ContentModel,
  pageId: string,
  activeId: string,
  overId: string,
): void {
  if (isSingleContent(json)) return;
  const page = json.pages.find((item) => item.id === pageId);
  if (page) page.blocks = reorderItem(page.blocks, activeId, overId);
}

export function toggleNavItemVisible(json: ContentModel, id: string): void {
  if (isSingleContent(json)) json.blocks = toggleVisible(json.blocks, id);
  else json.pages = toggleVisible(json.pages, id);
}

/** Single only: menu presence is the inclusion switch. */
export function toggleSingleMenu(json: ContentModel, id: string, defaultLabel: string): void {
  if (!isSingleContent(json)) return;
  const block = json.blocks.find((item) => item.id === id);
  if (!block) return;
  if (block.menu) delete block.menu;
  else block.menu = { label: defaultLabel };
}

/** Multi only: explicit three-state projection. */
export function setPageMenuPlacement(
  json: ContentModel,
  id: string,
  placement: MenuPlacement,
): void {
  if (isSingleContent(json)) return;
  const page = json.pages.find((item) => item.id === id);
  if (!page) return;
  if (placement === 'none') {
    delete page.menu;
    return;
  }
  const label = page.menu?.label || page.name;
  page.menu = placement === 'header' ? { label } : { label, placement: 'footer' };
}

export function relabelMenuItem(json: ContentModel, id: string, label: string): void {
  const items: Array<{ id: string; menu?: MenuEntry | { label: string } }> =
    isSingleContent(json) ? json.blocks : json.pages;
  const item = items.find((candidate) => candidate.id === id);
  if (item?.menu) item.menu.label = label;
}

export function renamePage(json: ContentModel, id: string, name: string): void {
  if (isSingleContent(json)) return;
  const page = json.pages.find((item) => item.id === id);
  if (page) page.name = name;
}
