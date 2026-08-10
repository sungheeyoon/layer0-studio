import { ContentModel } from '../../entities/template.entity';

/**
 * One image asset referenced by a Site, and the slot it sits in.
 *
 * `slotKey` is a stable address for *where* in the content the reference lives
 * (`<section.id>.<fieldKey>`, plus a page/shared prefix for Multi). The save RPC
 * diffs the old and new usage sets to decide which assets a Site has stopped
 * referencing, which is what keeps ADR-0003's orphan sweep from deleting a
 * binary that is still on someone's page.
 */
export interface AssetUsage {
  assetId: string;
  slotKey: string;
}

/**
 * Domain port for "which assets does this content reference, and where".
 *
 * A port rather than a plain function because of where this is heading: after
 * ADR-0016 §5 a Value carries no `type`, so finding the images means walking the
 * Template's `fieldsSchema` — and the Library is loaded by `@/templates`, which
 * the domain must not reach into. The concrete adapter lives in
 * `src/lib/template` beside the validator, the other port with the same problem.
 *
 * It is also why `collect` is async: today's implementation is a synchronous
 * content walk, but the schema-driven one has to await `loadTemplate()`. Making
 * the seam async now means that change touches only the adapter.
 */
export interface AssetUsageCollector {
  collect(content: ContentModel): Promise<AssetUsage[]>;
}
