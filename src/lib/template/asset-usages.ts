import { ContentModel } from '@/domain/entities/template.entity';

export interface AssetUsage {
  asset_id: string;
  slot_key: string;
}

/**
 * Collect the image-asset usages of a Site, each keyed by a stable `slot_key`
 * so the save RPC can diff old vs new usages and sweep only true orphans.
 *
 * slot_key namespace (ADR-0007, PLAN_multipage §6 (F)):
 *   Single:        `${section.id}.${key}`
 *   Multi page:    `${page.id}.${section.id}.${key}`
 *   Multi shared:  `shared.${slot}.${section.id}.${key}`   (slot = header | footer)
 *
 * The Multi branch walks `shared.header` / `shared.footer` (which belong to no
 * Page) in addition to every page's sections, so assets placed in a shared
 * header/footer are tracked and never mis-swept.
 */
export function collectAssetUsages(siteJson: ContentModel): AssetUsage[] {
  const usages: AssetUsage[] = [];

  const collectFromSection = (
    section: { id: string; data?: Record<string, unknown> },
    prefix: string,
  ) => {
    if (!section.data) return;
    for (const [key, field] of Object.entries(section.data)) {
      const f = field as { type?: string; assetId?: string };
      if (f.type === 'image' && f.assetId) {
        usages.push({ asset_id: f.assetId, slot_key: `${prefix}${section.id}.${key}` });
      }
    }
  };

  if (siteJson && siteJson.mode === 'single') {
    for (const section of siteJson.sections ?? []) {
      collectFromSection(section, '');
    }
  } else if (siteJson && siteJson.mode === 'multi') {
    for (const slot of ['header', 'footer'] as const) {
      for (const section of siteJson.shared?.[slot] ?? []) {
        collectFromSection(section, `shared.${slot}.`);
      }
    }
    for (const page of siteJson.pages ?? []) {
      for (const section of page.sections ?? []) {
        collectFromSection(section, `${page.id}.`);
      }
    }
  }

  return usages;
}
