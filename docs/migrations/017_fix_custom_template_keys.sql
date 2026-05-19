-- Migration 017: Final cleanup of custom templates after 016 (case-insensitive)
-- Date: 2026-05-19
--
-- Background: migration 016 used exact-match on category column. The dev DB
-- has custom rows whose category is either capitalized ('Medical', 'Legal') or
-- uses semantic names not in the registry ('Event' for wedding, 'Business' for
-- corporate). This migration covers both:
--   1. Case-insensitive match against the 7 registry categories
--   2. Explicit per-slug overrides for known semantic mismatches
--
-- Add new explicit overrides at the top of the CASE if more custom templates
-- surface.
--
-- Idempotent. Safe to re-run.

-- 1) Repair templates.template_json.templateKey
UPDATE templates
SET template_json = jsonb_set(
  template_json,
  '{templateKey}',
  to_jsonb(
    CASE
      -- Codegen preset rows: already correct after 016
      WHEN slug IN (
        'cafe-cozy','cafe-default','cafe-modern',
        'corporate-default','fitness-default','interior-default',
        'legal-default','medical-default','wedding-default'
      ) THEN slug

      -- Explicit per-slug overrides (for semantic category mismatches)
      WHEN slug = 'hautre-wedding-planner' THEN 'wedding-default'
      WHEN slug = 'corporate-mvp'          THEN 'corporate-default'
      -- 'arrc-clinic' and 'law-firm-tax-template' fall through to LOWER(category) below

      -- Case-insensitive registry category match
      WHEN LOWER(category) IN (
        'cafe','corporate','fitness','interior','legal','medical','wedding'
      ) THEN LOWER(category) || '-default'

      -- Else: keep current (may still be broken — admin to fix)
      ELSE template_json->>'templateKey'
    END
  )
);

-- 2) Realign user_sites.site_json.templateKey to templates.template_json.templateKey
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

-- Sanity check (after applying) — should return zero rows
-- SELECT slug, category, template_json->>'templateKey' AS template_key
-- FROM templates
-- WHERE template_json->>'templateKey' NOT IN (
--   'cafe-cozy','cafe-default','cafe-modern','corporate-default','fitness-default',
--   'interior-default','legal-default','medical-default','wedding-default'
-- );
