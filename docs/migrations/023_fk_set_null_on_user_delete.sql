-- 023_fk_set_null_on_user_delete.sql
-- Fixes #116: templates.created_by / template_sync_audit.performed_by reference
-- auth.users with no ON DELETE rule (defaults to NO ACTION). Deleting a user who
-- has ever published a template hits this FK violation *after* user_sites/assets
-- rows have already been deleted (settings/actions.ts is not transactional),
-- leaving the account alive with no sites/assets and the UI showing only UNKNOWN.
--
-- Both columns are nullable. SET NULL (not CASCADE) is intentional: the account
-- can go away, but the audit trail of "this template was published at some point"
-- should not. See ADR-0014 decision #2.
--
-- Verify constraint names before applying — they were never explicitly named in
-- 001_template_system.sql / 011_template_sync_audit.sql, so Postgres auto-derived
-- them as `<table>_<column>_fkey`. Confirm with:
--
--   SELECT conname, conrelid::regclass, confrelid::regclass, confdeltype
--   FROM pg_constraint
--   WHERE conname IN ('templates_created_by_fkey', 'template_sync_audit_performed_by_fkey');
--
-- confdeltype 'a' = NO ACTION (the bug), 'n' = SET NULL (post-fix expectation).

ALTER TABLE public.templates
  DROP CONSTRAINT templates_created_by_fkey,
  ADD CONSTRAINT templates_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.template_sync_audit
  DROP CONSTRAINT template_sync_audit_performed_by_fkey,
  ADD CONSTRAINT template_sync_audit_performed_by_fkey
    FOREIGN KEY (performed_by) REFERENCES auth.users(id) ON DELETE SET NULL;
