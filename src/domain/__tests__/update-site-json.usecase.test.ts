import { describe, it, expect } from 'vitest';
import { UpdateSiteJsonUseCase } from '../usecases/user-site/update-site-json.usecase';
import { FakeUserSiteRepo, makeSite, makeTemplateJson } from './fakes';
import {
  TemplateJson,
  SinglePageTemplate,
  TextTemplateField,
  ArrayTemplateField,
} from '../entities/template.entity';

// All current Sites are Single (ADR-0007) — sections live at the top level.
const asSingle = (json: TemplateJson) => json as SinglePageTemplate;

function makeTwoSectionJson(): TemplateJson {
  return {
    mode: 'single',
    templateKey: 'corporate',
    globalStyles: {
      primaryColor: '#000',
      secondaryColor: '#fff',
      fontFamily: 'sans-serif',
      fontSize: '16px',
      layout: 'default',
    },
    sections: [
      {
        id: 'section-a',
        type: 'hero',
        visible: true,
        nav: { visible: false, label: 'Hero' },
        data: {
          title: { type: 'text', label: 'Title', value: 'Section1 Title', editable: true },
        },
      },
      {
        id: 'section-b',
        type: 'text',
        visible: true,
        nav: { visible: false, label: 'Text' },
        data: {
          body: { type: 'textarea', label: 'Body', value: 'Section2 Body', editable: true },
        },
      },
    ],
  };
}

describe('UpdateSiteJsonUseCase.executeFieldUpdate', () => {
  it('throws SITE_NOT_FOUND when site does not exist', async () => {
    const uc = new UpdateSiteJsonUseCase(new FakeUserSiteRepo([]));
    await expect(uc.executeFieldUpdate('missing', 'section-a', 'title', 'New', 'user-1')).rejects.toMatchObject({ code: 'SITE_NOT_FOUND' });
  });

  it('throws SITE_ACCESS_DENIED for non-owner', async () => {
    const repo = new FakeUserSiteRepo([makeSite({ id: 'site-1', userId: 'user-1' })]);
    const uc = new UpdateSiteJsonUseCase(repo);
    await expect(uc.executeFieldUpdate('site-1', 'section-1', 'title', 'New', 'user-2')).rejects.toMatchObject({ code: 'SITE_ACCESS_DENIED' });
  });

  it('updates a field by section id (flat lookup)', async () => {
    const siteJson = makeTwoSectionJson();
    const repo = new FakeUserSiteRepo([makeSite({ id: 'site-1', userId: 'user-1', siteJson })]);
    const uc = new UpdateSiteJsonUseCase(repo);
    const result = await uc.executeFieldUpdate('site-1', 'section-a', 'title', 'Updated', 'user-1');
    expect((asSingle(result.siteJson).sections[0].data.title as TextTemplateField).value).toBe('Updated');
  });

  it('finds any section by id regardless of order', async () => {
    const siteJson = makeTwoSectionJson();
    const repo = new FakeUserSiteRepo([makeSite({ id: 'site-1', userId: 'user-1', siteJson })]);
    const uc = new UpdateSiteJsonUseCase(repo);
    const result = await uc.executeFieldUpdate('site-1', 'section-b', 'body', 'Updated Body', 'user-1');
    expect((asSingle(result.siteJson).sections[1].data.body as TextTemplateField).value).toBe('Updated Body');
  });

  it('throws UNKNOWN when section is not found', async () => {
    const siteJson = makeTwoSectionJson();
    const repo = new FakeUserSiteRepo([makeSite({ id: 'site-1', userId: 'user-1', siteJson })]);
    const uc = new UpdateSiteJsonUseCase(repo);
    await expect(uc.executeFieldUpdate('site-1', 'missing-section', 'body', 'New', 'user-1'))
      .rejects.toMatchObject({ code: 'UNKNOWN' });
  });

  it('throws UNKNOWN when field key does not exist in section data', async () => {
    const siteJson = makeTwoSectionJson();
    const repo = new FakeUserSiteRepo([makeSite({ id: 'site-1', userId: 'user-1', siteJson })]);
    const uc = new UpdateSiteJsonUseCase(repo);
    await expect(uc.executeFieldUpdate('site-1', 'section-a', 'missing-field', 'New', 'user-1'))
      .rejects.toMatchObject({ code: 'UNKNOWN' });
  });

  it('does not mutate the original siteJson object (structuredClone guard)', async () => {
    const siteJson = makeTemplateJson();
    const originalValue = (asSingle(siteJson).sections[0].data.title as TextTemplateField).value;
    const repo = new FakeUserSiteRepo([makeSite({ id: 'site-1', userId: 'user-1', siteJson })]);
    const uc = new UpdateSiteJsonUseCase(repo);
    await uc.executeFieldUpdate('site-1', 'section-1', 'title', 'Changed', 'user-1');
    expect((asSingle(siteJson).sections[0].data.title as TextTemplateField).value).toBe(originalValue);
  });

  it('throws UNSUPPORTED_FIELD_TYPE when trying to update an array field directly', async () => {
    const siteJson = makeTemplateJson({
      sections: [
        {
          id: 'section-1',
          type: 'menu',
          visible: true,
          nav: { visible: false, label: 'Menu' },
          data: {
            items: { type: 'array', label: 'Items', items: [] },
          },
        },
      ],
    });
    const repo = new FakeUserSiteRepo([makeSite({ id: 'site-1', userId: 'user-1', siteJson })]);
    const uc = new UpdateSiteJsonUseCase(repo);

    await expect(uc.executeFieldUpdate('site-1', 'section-1', 'items', '[]', 'user-1'))
      .rejects.toMatchObject({ code: 'UNSUPPORTED_FIELD_TYPE' });
  });
});

describe('UpdateSiteJsonUseCase.execute', () => {
  it('updates the entire siteJson and preserves array fields', async () => {
    const siteJsonWithArray: TemplateJson = makeTemplateJson({
      sections: [
        {
          id: 'section-1',
          type: 'menu',
          visible: true,
          nav: { visible: false, label: 'Menu' },
          data: {
            items: {
              type: 'array',
              label: 'Items',
              items: [
                { title: { type: 'text', label: 'Title', value: 'Item 1' } },
              ],
            },
          },
        },
      ],
    });
    const repo = new FakeUserSiteRepo([makeSite({ id: 'site-1', userId: 'user-1' })]);
    const uc = new UpdateSiteJsonUseCase(repo);

    const result = await uc.execute('site-1', siteJsonWithArray, 'user-1');

    expect(result.siteJson).toEqual(siteJsonWithArray);
    const itemsField = asSingle(result.siteJson).sections[0].data.items as ArrayTemplateField;
    expect(itemsField.type).toBe('array');
    expect(itemsField.items).toHaveLength(1);
  });
});
