-- Migration 016: Repair the damage from migration 015
-- Date: 2026-05-19
--
-- Background: migration 015 mistakenly set `template_json.templateKey = slug`
-- for ALL templates rows. For admin-created custom templates whose slug is
-- something like 'hautre-wedding-planner' or 'arrc-clinic', this overwrote the
-- correct renderer key (e.g., 'wedding') with the slug, making loadTemplate()
-- return null and rendering 404s.
--
-- Repair rule:
--   - Codegen preset rows (the 9 known slugs): templateKey = slug ✓ (no-op)
--   - Other rows: try to derive from templates.category column if it matches a
--     known registry category, then map to '<category>-default'.
--   - Rows that can't be auto-recovered keep their current (broken) value;
--     admin must fix manually via the admin UI or a targeted SQL update.
--
-- After this migration, the loadTemplate() shim (release a36902b) catches any
-- remaining mismatches (e.g., bare 'wedding' → 'wedding-default').
--
-- Apply manually via Supabase dashboard SQL editor or `supabase db push`.

-- 1) Repair templates.template_json.templateKey
UPDATE templates
SET template_json = jsonb_set(
  template_json,
  '{templateKey}',
  to_jsonb(
    CASE
      -- Codegen preset rows: slug IS the templateKey
      WHEN slug IN (
        'cafe-cozy','cafe-default','cafe-modern',
        'corporate-default','fitness-default','interior-default',
        'legal-default','medical-default','wedding-default'
      ) THEN slug
      -- Admin custom rows: derive from category if it matches a known registry category
      WHEN category IN (
        'cafe','corporate','fitness','interior','legal','medical','wedding'
      ) THEN category || '-default'
      -- Else: keep whatever is there (admin will need to fix manually)
      ELSE template_json->>'templateKey'
    END
  )
);

-- 2) Realign user_sites.site_json.templateKey to templates.template_json.templateKey
--    (the actual renderer key after step 1 — NOT templates.slug as 015 did)
UPDATE user_sites
SET site_json = jsonb_set(site_json, '{templateKey}', t.template_json->'templateKey')
FROM templates t
WHERE user_sites.template_id = t.id;

-- 3) Same for template_snapshot
UPDATE user_sites
SET template_snapshot = jsonb_set(
  template_snapshot,
  '{templateKey}',
  t.template_json->'templateKey'
)
FROM templates t
WHERE user_sites.template_id = t.id
  AND user_sites.template_snapshot IS NOT NULL;

-- Sanity checks (run after applying)
-- 1) Templates with broken templateKey (not in templateMap and shim can't help)
-- SELECT slug, category, template_json->>'templateKey' AS template_key
-- FROM templates
-- WHERE template_json->>'templateKey' NOT IN (
--   'cafe-cozy','cafe-default','cafe-modern','corporate-default','fitness-default',
--   'interior-default','legal-default','medical-default','wedding-default'
-- )
-- AND (template_json->>'templateKey') || '-default' NOT IN (
--   'cafe-cozy','cafe-default','cafe-modern','corporate-default','fitness-default',
--   'interior-default','legal-default','medical-default','wedding-default'
-- );
--
-- 2) Same check for user_sites
-- SELECT id, site_json->>'templateKey' AS template_key
-- FROM user_sites
-- WHERE site_json->>'templateKey' NOT IN (
--   'cafe-cozy','cafe-default','cafe-modern','corporate-default','fitness-default',
--   'interior-default','legal-default','medical-default','wedding-default'
-- )
-- AND (site_json->>'templateKey') || '-default' NOT IN (
--   'cafe-cozy','cafe-default','cafe-modern','corporate-default','fitness-default',
--   'interior-default','legal-default','medical-default','wedding-default'
-- );
