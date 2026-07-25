import { describe, it, expect } from 'vitest';
import { indexIssues, fieldIssueKey, EMPTY_ISSUE_INDEX } from '../content-issues';
import type { ValidationIssue } from '@/lib/template/validate';

const issue = (code: string, path?: string): ValidationIssue => ({
  code,
  message: code,
  path,
});

describe('indexIssues', () => {
  it('indexes a globalStyles issue by its key', () => {
    const index = indexIssues([issue('NON_HEX_COLOR', 'globalStyles.primaryColor')]);
    expect(index.globalStyles).toEqual({ primaryColor: ['NON_HEX_COLOR'] });
  });

  // The three Section path shapes — Single, Multi page, Multi shared — differ only
  // in their prefix, so the indexer matches the tail.
  it.each([
    ['Single', 'sections[id=hero].fields.accent'],
    ['Multi page', 'pages[slug=about].sections[id=hero].fields.accent'],
    ['Multi shared', 'shared.header.sections[id=hero].fields.accent'],
  ])('indexes a Section field issue for %s', (_label, path) => {
    const index = indexIssues([issue('INVALID_COLOR_FIELD', path)]);
    expect(index.fields).toEqual({ [fieldIssueKey('hero', 'accent')]: ['INVALID_COLOR_FIELD'] });
  });

  it('collects several issues on one field', () => {
    const index = indexIssues([
      issue('INVALID_COLOR_FIELD', 'sections[id=hero].fields.accent'),
      issue('INSECURE_URL', 'sections[id=hero].fields.accent'),
    ]);
    expect(index.fields[fieldIssueKey('hero', 'accent')]).toEqual([
      'INVALID_COLOR_FIELD',
      'INSECURE_URL',
    ]);
  });

  // Authoring feedback must not surface under a User's colour picker.
  it('drops codes that are not user-actionable', () => {
    const index = indexIssues([
      issue('UNKNOWN_DATA_FIELD', 'sections[id=hero].fields.legacy'),
      issue('UNKNOWN_LAYOUT', 'globalStyles.layout'),
    ]);
    expect(index).toEqual(EMPTY_ISSUE_INDEX);
  });

  it('drops issues with no path', () => {
    expect(indexIssues([issue('INVALID_COLOR')])).toEqual(EMPTY_ISSUE_INDEX);
  });

  // Array-item fields render inside ArrayFieldEditor, which has no anchor for a
  // message — the tail match must not mistake one for a top-level field.
  it('does not index a nested array-item path as a Section field', () => {
    const index = indexIssues([
      issue('INVALID_COLOR_FIELD', 'sections[id=menu].fields.items.items[0].fields.accent'),
    ]);
    expect(index.fields).toEqual({});
  });

  it('returns an empty index for no issues', () => {
    expect(indexIssues([])).toEqual(EMPTY_ISSUE_INDEX);
  });
});
