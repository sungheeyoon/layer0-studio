-- Migration 013: Rename JSONB key `themeKey` → `templateKey`
-- Date: 2026-05-19
--
-- Background: post-grilling (Q6-3-a), the "theme" concept is replaced by
-- "template" (per-template directory model, β). The JSONB key in
-- templates.template_json, user_sites.site_json, and user_sites.template_snapshot
-- is renamed from `themeKey` to `templateKey` to match the new vocabulary.
--
-- Pattern: jsonb_set adds the new key with the same value, then `-` drops the old.
-- WHERE clause skips rows that have already been migrated (idempotent).
--
-- Apply manually via Supabase dashboard SQL editor or `supabase db push`.

-- 1) templates.template_json
UPDATE templates
SET template_json = jsonb_set(template_json, '{templateKey}', template_json->'themeKey') - 'themeKey'
WHERE template_json ? 'themeKey';

-- 2) user_sites.site_json
UPDATE user_sites
SET site_json = jsonb_set(site_json, '{templateKey}', site_json->'themeKey') - 'themeKey'
WHERE site_json ? 'themeKey';

-- 3) user_sites.template_snapshot (may be NULL for some rows; guard with IS NOT NULL)
UPDATE user_sites
SET template_snapshot = jsonb_set(template_snapshot, '{templateKey}', template_snapshot->'themeKey') - 'themeKey'
WHERE template_snapshot IS NOT NULL
  AND template_snapshot ? 'themeKey';

-- Sanity checks (run after applying to confirm zero leftover keys)
-- SELECT count(*) FROM templates WHERE template_json ? 'themeKey';          -- expect 0
-- SELECT count(*) FROM user_sites WHERE site_json ? 'themeKey';             -- expect 0
-- SELECT count(*) FROM user_sites WHERE template_snapshot ? 'themeKey';     -- expect 0
-- SELECT count(*) FROM templates WHERE template_json ? 'templateKey';       -- expect = total templates count
