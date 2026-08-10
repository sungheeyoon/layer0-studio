import { ContentModel } from '@/domain/entities/template.entity';

export interface AssetUsage {
  asset_id: string;
  slot_key: string;
}

/**
 * Collect the image-asset usages of a Site, each keyed by a stable `slot_key`
 * so the save RPC can diff old vs new usages and sweep only true orphans.
 *
 * slot_key namespace (ADR-0007 Consequences):
 *   Single:        `${section.id}.${key}`
 *   Multi page:    `${page.id}.${section.id}.${key}`
 *   Multi shared:  `shared.${slot}.${section.id}.${key}`   (slot = header | footer)
 *   Array item:    `…${key}[${index}].${itemKey}`          (nests arbitrarily deep)
 *
 * The Multi branch walks `shared.header` / `shared.footer` (which belong to no
 * Page) in addition to every page's sections, so assets placed in a shared
 * header/footer are tracked and never mis-swept.
 *
 * **Array fields must be traversed, not skipped.** An image nested in an array
 * item that never reaches `asset_usages` has no usage row at all, and
 * `sweep_orphaned_assets` (migration 008) queues exactly that — an `active`
 * asset older than an hour with no usage — for binary deletion. Five shipped
 * Templates declare `image` inside an `itemSchema` (academy Teachers, cafe
 * MenuBento, medical-clinic Doctors + Gallery, outdoor CollectionGrid), so
 * skipping arrays destroyed real user uploads roughly a day after upload.
 *
 * The `[index]` in an array slot_key is positional and therefore changes when
 * items are reordered. That is safe: the RPC diffs old vs new usages by
 * `asset_id`, never by `slot_key`, so a moved item is not mistaken for a
 * removed one. ADR-0016 replaces the index with a permanent `item.id`.
 */
export function collectAssetUsages(content: ContentModel): AssetUsage[] {
  const usages: AssetUsage[] = [];

  /** Walk one `fields` record, recursing through array items. */
  const collectFromFields = (
    fields: Record<string, unknown> | undefined,
    prefix: string,
  ) => {
    if (!fields) return;
    for (const [key, field] of Object.entries(fields)) {
      const f = field as {
        type?: string;
        assetId?: string;
        items?: Array<Record<string, unknown>>;
      };

      if (f.type === 'image' && f.assetId) {
        usages.push({ asset_id: f.assetId, slot_key: `${prefix}${key}` });
      } else if (f.type === 'array' && Array.isArray(f.items)) {
        f.items.forEach((item, index) => {
          collectFromFields(item, `${prefix}${key}[${index}].`);
        });
      }
    }
  };

  const collectFromSection = (
    section: { id: string; fields?: Record<string, unknown> },
    prefix: string,
  ) => {
    collectFromFields(section.fields, `${prefix}${section.id}.`);
  };

  if (content && content.mode === 'single') {
    for (const section of content.sections ?? []) {
      collectFromSection(section, '');
    }
  } else if (content && content.mode === 'multi') {
    for (const slot of ['header', 'footer'] as const) {
      for (const section of content.shared?.[slot] ?? []) {
        collectFromSection(section, `shared.${slot}.`);
      }
    }
    for (const page of content.pages ?? []) {
      for (const section of page.sections ?? []) {
        collectFromSection(section, `${page.id}.`);
      }
    }
  }

  return usages;
}
