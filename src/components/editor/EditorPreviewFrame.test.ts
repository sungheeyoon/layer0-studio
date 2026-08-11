import { describe, expect, it } from 'vitest';
import { PREVIEW_VIEWPORTS } from './EditorPreviewFrame';

describe('Editor Preview viewport contract', () => {
  it('supports the desktop and mobile logical viewports used by the Editor switcher', () => {
    expect(PREVIEW_VIEWPORTS.desktop).toEqual({ width: 1440, height: 900 });
    expect(PREVIEW_VIEWPORTS.mobile).toEqual({ width: 390, height: 844 });
  });
});
