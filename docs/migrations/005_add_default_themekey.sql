-- Migration to add default themeKey to existing site_json and template_json
-- Date: 2026-04-16

-- Update existing user_sites
UPDATE user_sites 
SET site_json = jsonb_set(site_json, '{themeKey}', '"corporate"')
WHERE site_json->>'themeKey' IS NULL;

-- Update existing templates
UPDATE templates 
SET template_json = jsonb_set(template_json, '{themeKey}', '"corporate"')
WHERE template_json->>'themeKey' IS NULL;
