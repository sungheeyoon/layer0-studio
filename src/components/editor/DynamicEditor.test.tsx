// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { EditorSite } from '@/domain/entities/user-site.entity';
import type { ContentModel } from '@/domain/entities/template.entity';
import type { TemplateModule, TemplateRendererProps } from '@/templates/types';

vi.mock('@/app/(authenticated)/dashboard/editor/actions', () => ({
  saveContentAction: vi.fn(),
  publishSiteAction: vi.fn(),
  discardDraftAction: vi.fn(),
}));
vi.mock('@/templates/registry', () => ({ loadTemplate: vi.fn() }));
vi.mock('@/utils/supabase/client', () => ({ createClient: vi.fn() }));

import DynamicEditor from './DynamicEditor';
import { I18nProvider } from '@/lib/i18n/provider';
import { ko } from '@/lib/i18n/messages/ko';
import { loadTemplate } from '@/templates/registry';
import { saveContentAction } from '@/app/(authenticated)/dashboard/editor/actions';

const pageNames = ['홈', '진료안내', '병원소개', '갤러리', '오시는길'];

const multiContent: ContentModel = {
  mode: 'multi',
  templateKey: 'medical-clinic',
  globalStyles: {
    primaryColor: '#2563eb',
    secondaryColor: '#0e7490',
    backgroundColor: '#ffffff',
    fontFamily: 'sans-serif',
    fontSize: '16px',
    layout: 'wide',
  },
  chrome: { header: [], footer: [] },
  pages: pageNames.map((name, index) => ({
    id: `page-${index}`,
    slug: index === 0 ? 'home' : `page-${index}`,
    name,
    visible: true,
    menu: { label: name },
    blocks: [
      {
        id: `hero-${index}`,
        type: 'hero',
        visible: true,
        fields: { title: `${name} 제목` },
      },
      ...(index === 0 ? [{
        id: 'details-0',
        type: 'hero',
        visible: true,
        fields: { title: '상세 안내' },
      }] : []),
    ],
  })),
};

const site: EditorSite = {
  id: 'site-1',
  userId: 'user-1',
  templateId: 'template-1',
  siteName: '온유의원',
  domain: 'onyu',
  status: 'draft',
  content: multiContent,
  publishedAt: null,
  hasUnpublishedChanges: false,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
};

function TestRenderer({ content, activePageId, onSectionClick }: TemplateRendererProps) {
  if (content.mode !== 'multi') return null;
  const page = content.pages.find((item) => item.id === activePageId) ?? content.pages[0];
  const block = page.blocks[0];
  return (
    <button data-testid={`preview-${block.id}`} onClick={() => onSectionClick?.(block.id)}>
      {String(block.fields.title)}
    </button>
  );
}

const templateModule: TemplateModule = {
  default: TestRenderer,
  defaultContent: multiContent,
  library: {
    hero: {
      Component: () => null,
      meta: {
        componentKey: 'hero',
        category: 'content',
        label: '히어로',
        fieldsSchema: { title: { type: 'text', label: '제목' } },
      },
    },
  },
};

function renderEditor() {
  return render(
    <I18nProvider locale="ko" dictionary={ko}>
      <DynamicEditor site={site} />
    </I18nProvider>,
  );
}

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(loadTemplate).mockResolvedValue(templateModule);
});

describe('DynamicEditor information architecture', () => {
  it('keeps page switching above Multi content and moves page/menu settings into Navigation', async () => {
    const user = userEvent.setup();
    renderEditor();

    const pageSwitcher = await screen.findByRole('tablist', { name: ko.editor.pages.switcherLabel });
    const pageTabs = within(pageSwitcher).getAllByRole('tab');
    expect(pageTabs).toHaveLength(5);
    expect(pageSwitcher).toHaveClass('grid', 'grid-cols-3');
    pageTabs.forEach((tab) => expect(tab).toHaveClass('w-full'));
    expect(pageSwitcher).toHaveClass('group-data-[orientation=horizontal]/tabs:h-auto');
    expect(pageSwitcher).not.toHaveClass('overflow-x-auto');
    expect(screen.queryByText(ko.editor.pages.heading)).toBeNull();

    await user.click(screen.getByRole('tab', { name: ko.editor.tabs.navigation }));
    expect(screen.getByText(ko.editor.pages.heading)).toBeVisible();
    expect(screen.queryByRole('tablist', { name: ko.editor.pages.switcherLabel })).toBeNull();
  });

  it('reserves the editor scrollbar gutter so short and long Pages keep the same content width', () => {
    renderEditor();

    expect(screen.getByTestId('editor-scroll-region')).toHaveClass('[scrollbar-gutter:stable]');
  });

  it('shows reorder handles only for Blocks inside the active Multi Page', async () => {
    const user = userEvent.setup();
    renderEditor();

    expect(await screen.findAllByRole('button', { name: ko.editor.blocks.reorder })).toHaveLength(2);

    await user.click(screen.getByRole('tab', { name: '진료안내' }));
    expect(screen.getAllByRole('button', { name: ko.editor.blocks.reorder })).toHaveLength(1);
  });

  it('focuses and scrolls the matching editor Block when any content inside it is clicked in preview', async () => {
    const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => {});
    renderEditor();

    const iframe = await waitFor(() => {
      const frame = document.querySelector('iframe');
      expect(frame).not.toBeNull();
      expect(frame!.contentDocument?.querySelector('[data-testid="preview-hero-0"]')).not.toBeNull();
      return frame as HTMLIFrameElement;
    });
    fireEvent.click(iframe.contentDocument!.querySelector('[data-testid="preview-hero-0"]')!);

    const editorBlock = await waitFor(() => {
      const block = document.querySelector('[data-editor-block-id="hero-0"]');
      expect(block).not.toBeNull();
      return block as HTMLElement;
    });
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' }));
    expect(editorBlock).toContainElement(screen.getByLabelText('제목'));
    scrollIntoView.mockRestore();
  });

  it('writes nothing until the user asks for it', async () => {
    renderEditor();
    const title = await screen.findByLabelText('제목');

    vi.useFakeTimers();
    fireEvent.change(title, { target: { value: '첫 편집' } });
    // Well past every timer the old debounce used to arm.
    await act(async () => { await vi.advanceTimersByTimeAsync(60_000); });

    expect(saveContentAction).not.toHaveBeenCalled();
    expect(screen.getByText(ko.editor.saveStatus.unsaved)).toBeInTheDocument();
  });

  it('does not claim "saved" for an edit the acknowledgement did not carry', async () => {
    let finishSave!: (value: { success: true; updatedAt: string }) => void;
    vi.mocked(saveContentAction).mockImplementationOnce(
      () => new Promise((resolve) => { finishSave = resolve; }),
    );
    renderEditor();
    const title = await screen.findByLabelText('제목');

    fireEvent.change(title, { target: { value: '첫 편집' } });
    fireEvent.click(screen.getByRole('button', { name: ko.editor.actions.saveDraft }));
    await waitFor(() => expect(saveContentAction).toHaveBeenCalledTimes(1));

    // Typed while the request was in flight — the reply below cannot describe it.
    fireEvent.change(title, { target: { value: '요청 중에 더 편집' } });

    await act(async () => {
      finishSave({ success: true, updatedAt: '2026-08-01T00:00:01.000Z' });
      await Promise.resolve();
    });

    await waitFor(() =>
      expect(screen.getByText(ko.editor.saveStatus.unsaved)).toBeInTheDocument(),
    );
    expect(screen.queryByText(ko.editor.saveStatus.saved)).toBeNull();
  });

  it('offers to discard the draft when one was saved but never published', async () => {
    cleanup();
    render(
      <I18nProvider locale="ko" dictionary={ko}>
        <DynamicEditor site={{ ...site, hasUnpublishedChanges: true }} />
      </I18nProvider>,
    );

    expect(await screen.findByText(ko.editor.restoreDraft.title)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: ko.editor.restoreDraft.keep }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: ko.editor.restoreDraft.discard }),
    ).toBeInTheDocument();
  });
});
