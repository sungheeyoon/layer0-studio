-- 020_normalize_template_categories.sql
--
-- Two cleanups, applied together:
--
-- 1. Remove the `corporate-multipage` template (the minimal Multi example).
--    Its renderer code is deleted; this drops the matching DB row. The generic
--    Multi infrastructure (renderMultiSite, [[...slug]] routing) stays.
--
-- 2. Normalize `category` to the canonical form: Capitalized first token of the
--    slug (templateKey = `<category>-<leaf>`). The DB had a mix of legacy and
--    inconsistent slugs — `food` (cafe), `Business` (corporate-default), `Event`
--    (wedding), and lowercase `interior`/`outdoor`/`fitness`/`cafe`. Code is the
--    source of truth (ADR-0002): the generator now emits Capitalized categories
--    (templateCategories) and `syncTemplates` reconciles `category` on UPDATE, so
--    this is the one-time repair of rows already in the DB. `categoryLabel()`
--    lowercases before i18n lookup, so labels keep resolving.
--
-- Idempotent: re-running is a no-op once rows already match.
--
-- NOTE (applied to prod 2026-06-29): corporate-multipage had one dependent
-- user_site ("muttiii", the Acme demo) blocking the delete via FK. It was a
-- throwaway demo and was deleted first (confirmed with the owner).

DELETE FROM public.user_sites
WHERE template_id = (SELECT id FROM public.templates WHERE slug = 'corporate-multipage');

DELETE FROM public.templates
WHERE slug = 'corporate-multipage';

UPDATE public.templates
SET category = initcap(split_part(slug, '-', 1)),
    updated_at = now()
WHERE category IS DISTINCT FROM initcap(split_part(slug, '-', 1));
