-- ⚠️ DO NOT APPLY THIS MIGRATION. SUPERSEDED BY 016.
--
-- This file is a bug: it assumed every templates row's slug equals its renderer
-- key. That's true for the 9 codegen preset rows, but admin-created custom
-- templates have arbitrary slugs (e.g., 'hautre-wedding-planner') that are not
-- valid templateMap keys. Running this migration overwrites the correct renderer
-- key with the slug, breaking loadTemplate() and producing 404 for those sites.
--
-- If you already applied 015, run 016 to repair the damage.
-- If you haven't applied 015, skip it entirely and rely on the loadTemplate()
-- shim (release a36902b) which fixes the original problem without a migration.
--
-- ─────────────────────────────────────────────────────────────────────────────
-- Original (broken) migration body retained below for archaeology only.
-- ─────────────────────────────────────────────────────────────────────────────

-- Migration 015: Realign JSONB `templateKey` values to the new concat slug (post-#6 β model)
-- Date: 2026-05-19
--
-- Background: #6 restructured src/themes/<theme>/ into src/templates/<category>/<leaf>/.
-- The new `templateMap` keys are `<category>-<leaf>` (e.g. 'cafe-default', 'cafe-modern',
-- 'cafe-cozy'), NOT the bare category names ('cafe') that migration 013 left in JSONB.
--
-- Without this migration, loadTemplate() returns null for every existing row and the
-- site/preview/editor pages 404.
--
-- Idempotent: re-running is safe (sets each row's templateKey to the canonical slug;
-- second run is a no-op since values already match).
--
-- Apply manually via Supabase dashboard SQL editor or `supabase db push`.

-- 1) templates.template_json.templateKey ← slug (1:1 post-β)
UPDATE templates
SET template_json = jsonb_set(template_json, '{templateKey}', to_jsonb(slug))
WHERE slug IS NOT NULL;

-- 2) user_sites.site_json.templateKey ← templates.slug (via template_id FK)
UPDATE user_sites
SET site_json = jsonb_set(site_json, '{templateKey}', to_jsonb(t.slug))
FROM templates t
WHERE user_sites.template_id = t.id;

-- 3) user_sites.template_snapshot.templateKey ← templates.slug (same FK source)
UPDATE user_sites
SET template_snapshot = jsonb_set(template_snapshot, '{templateKey}', to_jsonb(t.slug))
FROM templates t
WHERE user_sites.template_id = t.id
  AND user_sites.template_snapshot IS NOT NULL;

-- Sanity checks (run after applying; all should return 0)
-- SELECT count(*) FROM templates WHERE template_json->>'templateKey' != slug;
-- SELECT count(*) FROM user_sites us
--   JOIN templates t ON us.template_id = t.id
--   WHERE us.site_json->>'templateKey' != t.slug;
-- SELECT count(*) FROM user_sites us
--   JOIN templates t ON us.template_id = t.id
--   WHERE us.template_snapshot IS NOT NULL
--     AND us.template_snapshot->>'templateKey' != t.slug;
