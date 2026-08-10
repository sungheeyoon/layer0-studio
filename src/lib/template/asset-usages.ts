import {
  ContentModel,
  FieldsSchema,
  Section,
} from '@/domain/entities/template.entity';
import {
  AssetUsage,
  AssetUsageCollector,
} from '@/domain/usecases/ports/asset-usage-collector.port';
import { loadTemplate } from '@/templates/registry';
import { TemplateLibrary } from '@/templates/types';

/**
 * The concrete {@link AssetUsageCollector}: loads the Template library for the
 * Site's `templateKey` and walks the content against it. This is the seam that
 * keeps `loadTemplate()` — and with it the Template registry — out of the data
 * layer (ADR-0008); `src/data/__tests__/layering.test.ts` enforces it.
 *
 * The load is a second `loadTemplate()` call in the same save, after
 * `LibraryAwareSiteContentValidator`'s. It is not a second *load*: `templateMap`
 * entries are `() => import('./<cat>/<leaf>')` and a dynamic import resolves
 * from the module cache after the first evaluation, so the module body runs
 * once per process, not once per save. Threading one library through both
 * collaborators would mean fusing two domain ports into one, which #128
 * deliberately kept apart.
 */
export class ContentAssetUsageCollector implements AssetUsageCollector {
  async collect(content: ContentModel): Promise<AssetUsage[]> {
    const mod = await loadTemplate(content.templateKey);
    return collectAssetUsages(content, mod?.library);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Collect the image-asset usages of a Site, each keyed by a stable `slotKey`
 * so the save RPC can diff old vs new usages and sweep only true orphans.
 *
 * **The walk follows the schema, not the data** (ADR-0016 §5). A Value carries
 * no `type` of its own, so "is this field an image" is a question only the
 * Block's `fieldsSchema` can answer: for each `type: 'image'` key we read
 * `ImageValue.assetId`, and each `type: 'array'` key recurses through its
 * `itemSchema`.
 *
 * slotKey namespace (ADR-0007 Consequences, ADR-0016 §4-4):
 *   Single:        `${section.id}.${key}`
 *   Multi page:    `${page.id}.${section.id}.${key}`
 *   Multi shared:  `shared.${slot}.${section.id}.${key}`   (slot = header | footer)
 *   Array item:    `…${key}[${item.id}].${itemKey}`        (nests arbitrarily deep)
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
 * skipping arrays destroyed real user uploads roughly a day after upload. That
 * is PR #126's contract, and it holds here unchanged — only the traversal that
 * satisfies it moved from the data to the schema.
 *
 * An array slot is addressed by the item's **own id**, never its index: an
 * index points at a different item after a reorder, which would rewrite every
 * following slot key on a save that changed no images. `item.id` is a blocking
 * validation rule (`ARRAY_ITEM_ID_MISSING` / `_DUPLICATE`, ADR-0016 §4-4), so
 * on the save path it is always there; the `#<index>` fallback below only keeps
 * a stray direct caller from dropping a usage — losing one deletes a binary.
 */
export function collectAssetUsages(
  content: ContentModel,
  library: TemplateLibrary | undefined,
): AssetUsage[] {
  const usages: AssetUsage[] = [];

  /**
   * One schema against the Values stored under it. `pathOf` builds the slot key
   * for a single field key, so a Block's fields and an array item's fields walk
   * through the same code without it knowing which shape of path it is building.
   *
   * Only keys the schema declares are visited. A stored key with no descriptor
   * is content the renderer can no longer read (`validateContent` reports it as
   * the `UNKNOWN_DATA_FIELD` warning), so an asset reachable *only* through one
   * is genuinely unreferenced and the sweep collecting it is correct. This is
   * also why renaming a live field is a destructive schema change (ADR-0016 §6).
   */
  const collectFromValues = (
    schema: FieldsSchema,
    values: Record<string, unknown>,
    pathOf: (fieldKey: string) => string,
  ) => {
    for (const [fieldKey, descriptor] of Object.entries(schema)) {
      const value = values[fieldKey];
      if (value === undefined || value === null) continue;

      if (descriptor.type === 'image') {
        if (!isRecord(value)) continue;
        const { assetId } = value;
        if (typeof assetId === 'string' && assetId.length > 0) {
          usages.push({ assetId, slotKey: pathOf(fieldKey) });
        }
        continue;
      }

      if (descriptor.type === 'array') {
        if (!Array.isArray(value) || !descriptor.itemSchema) continue;
        const fieldPath = pathOf(fieldKey);
        value.forEach((item, index) => {
          if (!isRecord(item) || !isRecord(item.fields)) return;
          const id =
            typeof item.id === 'string' && item.id.length > 0 ? item.id : `#${index}`;
          collectFromValues(
            descriptor.itemSchema,
            item.fields,
            (subKey) => `${fieldPath}[${id}].${subKey}`,
          );
        });
      }
    }
  };

  /**
   * A Block dispatches to `library[type]`, so an unknown `type` has no schema
   * and contributes nothing. On the save path that state is unreachable — the
   * validator reports `UNKNOWN_COMPONENT_KEY` as a blocking error and
   * `SiteWriteUseCase.saveContent` collects only after validation passes, so a
   * Site whose Blocks cannot be resolved is never written in the first place.
   */
  const collectFromSection = (section: Section, prefix: string) => {
    const entry = library?.[section.type];
    if (!entry) return;
    collectFromValues(
      entry.meta.fieldsSchema,
      section.fields ?? {},
      (fieldKey) => `${prefix}${section.id}.${fieldKey}`,
    );
  };

  // No library — the same reasoning one level up: an unknown `templateKey` is
  // `UNKNOWN_TEMPLATE_KEY`, blocking, so a save never reaches here without one.
  if (!library) return usages;

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
