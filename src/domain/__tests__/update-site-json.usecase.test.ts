import { describe, it, expect } from 'vitest';
import { UpdateSiteJsonUseCase } from '../usecases/user-site/update-site-json.usecase';
import { FakeUserSiteRepo, makeSite, makeTemplateJson } from './fakes';
import { TemplateJson, TextTemplateField } from '../entities/template.entity';

function makeTwoPageJson(): TemplateJson {
  return {
    themeKey: 'corporate',
    globalStyles: {
      primaryColor: '#000',
      secondaryColor: '#fff',
      fontFamily: 'sans-serif',
      fontSize: '16px',
      layout: 'default',
    },
    pages: [
      {
        id: 'page-1',
        title: 'Home',
        slug: 'home',
        order: 0,
        sections: [
          {
            id: 'section-a',
            type: 'hero',
            visible: true,
            editable: true,
            data: {
              title: { type: 'text', label: 'Title', value: 'Page1 Title', editable: true },
            },
          },
        ],
      },
      {
        id: 'page-2',
        title: 'About',
        slug: 'about',
        order: 1,
        sections: [
          {
            id: 'section-b',
            type: 'text',
            visible: true,
            editable: true,
            data: {
              body: { type: 'textarea', label: 'Body', value: 'Page2 Body', editable: true },
            },
          },
        ],
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

  it('updates field when pageId is provided (targeted page lookup)', async () => {
    const siteJson = makeTwoPageJson();
    const repo = new FakeUserSiteRepo([makeSite({ id: 'site-1', userId: 'user-1', siteJson })]);
    const uc = new UpdateSiteJsonUseCase(repo);
    const result = await uc.executeFieldUpdate('site-1', 'section-a', 'title', 'Updated', 'user-1', 'page-1');
    expect((result.siteJson.pages[0].sections[0].data.title as TextTemplateField).value).toBe('Updated');
  });

  it('finds section across all pages when pageId is omitted', async () => {
    const siteJson = makeTwoPageJson();
    const repo = new FakeUserSiteRepo([makeSite({ id: 'site-1', userId: 'user-1', siteJson })]);
    const uc = new UpdateSiteJsonUseCase(repo);
    // section-b lives on page-2; no pageId given
    const result = await uc.executeFieldUpdate('site-1', 'section-b', 'body', 'Updated Body', 'user-1');
    expect((result.siteJson.pages[1].sections[0].data.body as TextTemplateField).value).toBe('Updated Body');
  });

  it('throws UNKNOWN when section is not found on the specified page', async () => {
    const siteJson = makeTwoPageJson();
    const repo = new FakeUserSiteRepo([makeSite({ id: 'site-1', userId: 'user-1', siteJson })]);
    const uc = new UpdateSiteJsonUseCase(repo);
    await expect(uc.executeFieldUpdate('site-1', 'section-b', 'body', 'New', 'user-1', 'page-1'))
      .rejects.toMatchObject({ code: 'UNKNOWN' });
  });

  it('throws UNKNOWN when section is not found (no pageId, cross-page scan)', async () => {
    const siteJson = makeTwoPageJson();
    const repo = new FakeUserSiteRepo([makeSite({ id: 'site-1', userId: 'user-1', siteJson })]);
    const uc = new UpdateSiteJsonUseCase(repo);
    await expect(uc.executeFieldUpdate('site-1', 'missing-section', 'body', 'New', 'user-1'))
      .rejects.toMatchObject({ code: 'UNKNOWN' });
  });

  it('throws UNKNOWN when field key does not exist in section data', async () => {
    const siteJson = makeTwoPageJson();
    const repo = new FakeUserSiteRepo([makeSite({ id: 'site-1', userId: 'user-1', siteJson })]);
    const uc = new UpdateSiteJsonUseCase(repo);
    await expect(uc.executeFieldUpdate('site-1', 'section-a', 'missing-field', 'New', 'user-1'))
      .rejects.toMatchObject({ code: 'UNKNOWN' });
  });

  it('does not mutate the original siteJson object (structuredClone guard)', async () => {
    const siteJson = makeTemplateJson();
    const originalValue = (siteJson.pages[0].sections[0].data.title as TextTemplateField).value;
    const repo = new FakeUserSiteRepo([makeSite({ id: 'site-1', userId: 'user-1', siteJson })]);
    const uc = new UpdateSiteJsonUseCase(repo);
    await uc.executeFieldUpdate('site-1', 'section-1', 'title', 'Changed', 'user-1', 'page-1');
    expect((siteJson.pages[0].sections[0].data.title as TextTemplateField).value).toBe(originalValue);
  });

  it('throws UNSUPPORTED_FIELD_TYPE when trying to update an array field directly', async () => {
    const siteJson = makeTemplateJson({
      pages: [
        {
          id: 'page-1',
          title: 'Home',
          slug: 'home',
          order: 0,
          sections: [
            {
              id: 'section-1',
              type: 'menu',
              visible: true,
              editable: true,
              data: {
                items: { type: 'array', label: 'Items', items: [] }
              }
            }
          ]
        }
      ]
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
      pages: [
        {
          id: 'page-1',
          title: 'Home',
          slug: 'home',
          order: 0,
          sections: [
            {
              id: 'section-1',
              type: 'menu',
              visible: true,
              editable: true,
              data: {
                items: {
                  type: 'array',
                  label: 'Items',
                  items: [
                    { title: { type: 'text', label: 'Title', value: 'Item 1' } }
                  ]
                }
              }
            }
          ]
        }
      ]
    });
    const repo = new FakeUserSiteRepo([makeSite({ id: 'site-1', userId: 'user-1' })]);
    const uc = new UpdateSiteJsonUseCase(repo);

    const result = await uc.execute('site-1', siteJsonWithArray, 'user-1');

    expect(result.siteJson).toEqual(siteJsonWithArray);
    const itemsField = result.siteJson.pages[0].sections[0].data.items as any;
    expect(itemsField.type).toBe('array');
    expect(itemsField.items).toHaveLength(1);
  });
});

