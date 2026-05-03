-- Migration 012: Remove section.order from template_json and site_json
-- Also removes section.order from template_snapshot in user_sites

-- Update templates
UPDATE templates
SET template_json = (
  SELECT jsonb_set(
    template_json,
    '{pages}',
    (
      SELECT jsonb_agg(
        jsonb_set(
          page,
          '{sections}',
          (
            SELECT jsonb_agg(section - 'order')
            FROM jsonb_array_elements(page->'sections') AS section
          )
        )
      )
      FROM jsonb_array_elements(template_json->'pages') AS page
    )
  )
);

-- Update user_sites
UPDATE user_sites
SET site_json = (
  SELECT jsonb_set(
    site_json,
    '{pages}',
    (
      SELECT jsonb_agg(
        jsonb_set(
          page,
          '{sections}',
          (
            SELECT jsonb_agg(section - 'order')
            FROM jsonb_array_elements(page->'sections') AS section
          )
        )
      )
      FROM jsonb_array_elements(site_json->'pages') AS page
    )
  )
);

UPDATE user_sites
SET template_snapshot = (
  SELECT jsonb_set(
    template_snapshot,
    '{pages}',
    (
      SELECT jsonb_agg(
        jsonb_set(
          page,
          '{sections}',
          (
            SELECT jsonb_agg(section - 'order')
            FROM jsonb_array_elements(page->'sections') AS section
          )
        )
      )
      FROM jsonb_array_elements(template_snapshot->'pages') AS page
    )
  )
);
