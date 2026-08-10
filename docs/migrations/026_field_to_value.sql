-- 026 — Field → Value JSONB migration: the atomic write (ADR-0016 §8-1)
--
-- WHAT
--   One function that takes the *already transformed and already validated*
--   content for every row and writes all three columns — templates.content,
--   user_sites.content, user_sites.snapshot — in a single transaction.
--
-- WHY A FUNCTION
--   The transform runs in Node (it needs the Template libraries to validate
--   against), but supabase-js has no transaction: N `update()` calls are N
--   transactions, so a failure halfway leaves the database in a shape no
--   deployed version of the code can read. A plpgsql function body is one
--   transaction — either every row lands or none does. That is the whole
--   requirement of §8-1 step 6, and the reason the runner never writes directly.
--
--   The row-count assertions below are the second half of it: if the payload
--   names a row that no longer exists (deleted between the read and the write),
--   the RAISE aborts the function and rolls back everything already updated.
--
-- ORDER OF OPERATIONS (the runner enforces, this function assumes)
--   The payload has already been validated against the new Template libraries.
--   This function does not re-validate — it is the write, not the gate.
--
-- SAFETY
--   Not callable by anon/authenticated. It overwrites the content of arbitrary
--   rows, so it is service-role only and is expected to be dropped once the
--   migration has run (see the runbook's cleanup step).
--
-- NOTE ON updated_at
--   `user_sites_updated_at` / `templates_updated_at` (migration 001) bump
--   `updated_at` on every UPDATE. That is deliberate here: `updated_at` is the
--   optimistic-concurrency token (ADR-0004), so any editor tab still holding a
--   pre-migration token gets STALE_VERSION and a Conflict modal instead of
--   silently writing legacy-shaped content back over the migrated row.

CREATE OR REPLACE FUNCTION public.apply_field_value_migration(
  p_templates  JSONB,  -- [{ "id": "<uuid>", "content": {…} }, …]
  p_user_sites JSONB   -- [{ "id": "<uuid>", "content": {…}, "snapshot": {…}|null }, …]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_expected_templates  INT := jsonb_array_length(COALESCE(p_templates, '[]'::jsonb));
  v_expected_user_sites INT := jsonb_array_length(COALESCE(p_user_sites, '[]'::jsonb));
  v_updated_templates   INT := 0;
  v_updated_user_sites  INT := 0;
BEGIN
  IF v_expected_templates > 0 THEN
    WITH payload AS (
      SELECT (value->>'id')::uuid AS id, value->'content' AS content
      FROM jsonb_array_elements(p_templates)
    ), upd AS (
      UPDATE public.templates t
         SET content = p.content
        FROM payload p
       WHERE t.id = p.id
      RETURNING 1
    )
    SELECT count(*) INTO v_updated_templates FROM upd;

    IF v_updated_templates <> v_expected_templates THEN
      RAISE EXCEPTION
        'templates: expected to update % row(s), updated % — aborting, nothing is written',
        v_expected_templates, v_updated_templates;
    END IF;
  END IF;

  IF v_expected_user_sites > 0 THEN
    WITH payload AS (
      SELECT (value->>'id')::uuid AS id,
             value->'content'  AS content,
             -- `->` keeps SQL NULL for a JSON null, so a site that never had a
             -- snapshot keeps its NULL instead of gaining a 'null' JSONB.
             CASE WHEN jsonb_typeof(value->'snapshot') = 'null' THEN NULL
                  ELSE value->'snapshot' END AS snapshot
      FROM jsonb_array_elements(p_user_sites)
    ), upd AS (
      UPDATE public.user_sites s
         SET content  = p.content,
             snapshot = COALESCE(p.snapshot, s.snapshot)
        FROM payload p
       WHERE s.id = p.id
      RETURNING 1
    )
    SELECT count(*) INTO v_updated_user_sites FROM upd;

    IF v_updated_user_sites <> v_expected_user_sites THEN
      RAISE EXCEPTION
        'user_sites: expected to update % row(s), updated % — aborting, nothing is written',
        v_expected_user_sites, v_updated_user_sites;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'templates',  v_updated_templates,
    'user_sites', v_updated_user_sites
  );
END;
$$;

REVOKE ALL ON FUNCTION public.apply_field_value_migration(JSONB, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.apply_field_value_migration(JSONB, JSONB) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_field_value_migration(JSONB, JSONB) TO service_role;

-- Cleanup after the migration has run and been verified:
--   DROP FUNCTION public.apply_field_value_migration(JSONB, JSONB);
