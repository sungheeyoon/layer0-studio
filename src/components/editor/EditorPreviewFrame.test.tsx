// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { PREVIEW_VIEWPORTS } from './EditorPreviewFrame';
import EditorPreviewFrame from './EditorPreviewFrame';
import type { ContentModel } from '@/domain/entities/template.entity';

afterEach(() => {
  cleanup();
  document.head.querySelectorAll('[data-test-preview-source]').forEach((node) => node.remove());
});

const content: ContentModel = {
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
};

function TestRenderer() {
  return <main style={{ minHeight: 3000 }}>Preview</main>;
}

describe('Editor Preview viewport contract', () => {
  it('supports the desktop and mobile logical viewports used by the Editor switcher', () => {
    expect(PREVIEW_VIEWPORTS.desktop).toEqual({ width: 1440, height: 900 });
    expect(PREVIEW_VIEWPORTS.mobile).toEqual({ width: 390, height: 844 });
  });

  it('keeps existing iframe stylesheet nodes while newly loaded styles are mirrored', async () => {
    const sourceStyle = document.createElement('style');
    sourceStyle.dataset.testPreviewSource = '';
    sourceStyle.textContent = 'body { min-height: 3000px; }';
    document.head.appendChild(sourceStyle);

    const { container } = render(
      <EditorPreviewFrame
        TemplateRenderer={TestRenderer}
        content={content}
        selectedSectionId={null}
        onSectionClick={() => {}}
        themeVariables={{}}
        viewport="desktop"
      />,
    );

    const iframe = container.querySelector('iframe');
    await waitFor(() => {
      expect(iframe?.contentDocument?.head.querySelector('[data-test-preview-source]')).not.toBeNull();
    });
    const originalClone = iframe?.contentDocument?.head.querySelector('[data-test-preview-source]');
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    if (iframe?.contentDocument) iframe.contentDocument.body.scrollTop = 640;

    const lateStyle = document.createElement('style');
    lateStyle.dataset.testPreviewSource = '';
    lateStyle.textContent = 'main { display: block; }';
    document.head.appendChild(lateStyle);
    await waitFor(() => {
      expect(iframe?.contentDocument?.head.querySelectorAll('[data-test-preview-source]')).toHaveLength(2);
    });
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    expect(iframe?.contentDocument?.head.querySelector('[data-test-preview-source]')).toBe(originalClone);
    expect(iframe?.contentDocument?.body.scrollTop).toBe(640);
  });

  it('preserves scroll for live edits and starts a newly selected Page at the top', async () => {
    const { container, rerender } = render(
      <EditorPreviewFrame
        TemplateRenderer={TestRenderer}
        content={content}
        selectedSectionId={null}
        activePageId="page-a"
        onSectionClick={() => {}}
        themeVariables={{}}
        viewport="desktop"
      />,
    );
    const iframe = container.querySelector('iframe');
    await waitFor(() => expect(iframe?.contentDocument?.body.textContent).toContain('Preview'));
    iframe!.contentDocument!.body.scrollTop = 500;

    rerender(
      <EditorPreviewFrame
        TemplateRenderer={TestRenderer}
        content={{ ...content, globalStyles: { ...content.globalStyles, fontSize: '17px' } }}
        selectedSectionId="block-a"
        activePageId="page-a"
        onSectionClick={() => {}}
        themeVariables={{}}
        viewport="desktop"
      />,
    );
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    expect(iframe!.contentDocument!.body.scrollTop).toBe(500);

    rerender(
      <EditorPreviewFrame
        TemplateRenderer={TestRenderer}
        content={content}
        selectedSectionId={null}
        activePageId="page-b"
        onSectionClick={() => {}}
        themeVariables={{}}
        viewport="desktop"
      />,
    );
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    expect(iframe!.contentDocument!.body.scrollTop).toBe(0);
  });
});
