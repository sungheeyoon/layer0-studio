-- Migration to add default themeKey to existing site_json and template_json
-- Date: 2026-04-16
--
-- NOTE (2026-05-19): The `themeKey` JSONB key written by this migration was later
-- renamed to `templateKey` by migration 013. This file is preserved for historical
-- accuracy; the column shape it produced no longer matches the current code.

-- Update existing user_sites
UPDATE user_sites 
SET site_json = jsonb_set(site_json, '{themeKey}', '"corporate"')
WHERE site_json->>'themeKey' IS NULL;

-- Update existing templates
UPDATE templates 
SET template_json = jsonb_set(template_json, '{themeKey}', '"corporate"')
WHERE template_json->>'themeKey' IS NULL;
