-- 011_template_sync_audit.sql
-- Audit log for template synchronization actions

CREATE TABLE IF NOT EXISTS public.template_sync_audit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  performed_by UUID REFERENCES auth.users(id),
  occurred_at TIMESTAMPTZ DEFAULT now(),
  affected_slugs TEXT[] NOT NULL,
  dry_run BOOLEAN NOT NULL DEFAULT true,
  summary JSONB, -- { updates: number, creates: number, details: Array<{slug, action, changes}> }
  
  -- Metadata
  version TEXT -- The version of the sync script/preset version at the time
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_template_sync_audit_occurred_at ON public.template_sync_audit(occurred_at desc);

-- RLS
ALTER TABLE public.template_sync_audit ENABLE ROW LEVEL SECURITY;

-- Only admins should be able to see audit logs
-- Assuming a role-based check if available, or just restrict to specific IDs for now if role system isn't in SQL yet.
-- Given the TEMPLATE_PIPELINE_IMPROVEMENTS.md mentions app_metadata.role === 'admin',
-- we might need a function to check this in SQL if not already present.
-- For now, let's keep it simple or align with existing manage policies.

CREATE POLICY "Admins can view audit logs"
  ON public.template_sync_audit FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_app_meta_data->>'role' = 'admin')
    )
  );
