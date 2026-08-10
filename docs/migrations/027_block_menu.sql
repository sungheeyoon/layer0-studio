-- 027 — atomic write for ADR-0016 §2–§3 Block/menu migration.
CREATE OR REPLACE FUNCTION public.apply_block_menu_migration(
  p_templates JSONB,
  p_user_sites JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_expected_templates INT := jsonb_array_length(COALESCE(p_templates, '[]'::jsonb));
  v_expected_sites INT := jsonb_array_length(COALESCE(p_user_sites, '[]'::jsonb));
  v_templates INT := 0;
  v_sites INT := 0;
BEGIN
  WITH payload AS (
    SELECT (value->>'id')::uuid AS id, value->'content' AS content
    FROM jsonb_array_elements(COALESCE(p_templates, '[]'::jsonb))
  ), updated AS (
    UPDATE public.templates target SET content = payload.content
    FROM payload WHERE target.id = payload.id RETURNING 1
  ) SELECT count(*) INTO v_templates FROM updated;
  IF v_templates <> v_expected_templates THEN
    RAISE EXCEPTION 'templates: expected %, updated %; rolling back', v_expected_templates, v_templates;
  END IF;

  WITH payload AS (
    SELECT (value->>'id')::uuid AS id,
           value->'content' AS content,
           CASE WHEN jsonb_typeof(value->'snapshot') = 'null' THEN NULL ELSE value->'snapshot' END AS snapshot
    FROM jsonb_array_elements(COALESCE(p_user_sites, '[]'::jsonb))
  ), updated AS (
    UPDATE public.user_sites target
       SET content = payload.content,
           snapshot = COALESCE(payload.snapshot, target.snapshot)
      FROM payload WHERE target.id = payload.id RETURNING 1
  ) SELECT count(*) INTO v_sites FROM updated;
  IF v_sites <> v_expected_sites THEN
    RAISE EXCEPTION 'user_sites: expected %, updated %; rolling back', v_expected_sites, v_sites;
  END IF;

  RETURN jsonb_build_object('templates', v_templates, 'user_sites', v_sites);
END;
$$;

REVOKE ALL ON FUNCTION public.apply_block_menu_migration(JSONB, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.apply_block_menu_migration(JSONB, JSONB) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_block_menu_migration(JSONB, JSONB) TO service_role;

-- After verification:
-- DROP FUNCTION public.apply_block_menu_migration(JSONB, JSONB);
