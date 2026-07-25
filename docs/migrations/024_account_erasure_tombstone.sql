-- 024_account_erasure_tombstone.sql
-- Implements #117 / ADR-0014: Account Erasure pipeline, Tombstone-first.
--
-- Problem: deleteAccountAction deletes `assets` rows directly. sweep_orphaned_assets
-- (008) finds orphans by scanning public.assets — once the row is gone the asset can
-- never be found again, and the cron worker (route.ts) assembles the storage path from
-- the asset row, so the path can't be reconstructed either. `user_assets` is a public
-- bucket (006), so the leaked file stays open to anyone who has the URL.
--
-- Fix: a Tombstone table that holds ONLY the storage path (no FK to `assets`), fed by a
-- BEFORE DELETE trigger that fires however the row dies (explicit DELETE, or future
-- ON DELETE CASCADE from auth.users). Once the invariant "a path is recorded before its
-- row disappears" is enforced by the trigger, it's finally safe to CASCADE
-- assets.user_id / user_sites.user_id — order matters: trigger first, CASCADE second.
-- Skipping the trigger and adding CASCADE alone would just give this same bug a DB-level
-- reincarnation (auth user delete silently sweeping asset rows with no path recorded).
--
-- templates.created_by / template_sync_audit.performed_by already went to
-- ON DELETE SET NULL in 023 (fixes #116) — not repeated here.

-- ============================================================
-- 1. Tombstone table — outlives the row it was recorded for
-- ============================================================
CREATE TABLE IF NOT EXISTS public.asset_tombstones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bucket TEXT NOT NULL,
  path TEXT NOT NULL,

  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'done', 'failed')),
  retry_count INT NOT NULL DEFAULT 0,
  last_error TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_asset_tombstones_status ON public.asset_tombstones(status);

CREATE TRIGGER asset_tombstones_updated_at
  BEFORE UPDATE ON public.asset_tombstones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.asset_tombstones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "backend only tombstones"
  ON public.asset_tombstones FOR ALL
  USING (false);

-- ============================================================
-- 2. BEFORE DELETE trigger on assets — record the path first
-- ============================================================
-- Not reusing cleanup_queue: cleanup_queue.asset_id references assets
-- ON DELETE CASCADE (006:37), so the queue entry dies together with the row
-- it exists to clean up. A tombstone must not reference the thing it outlives.
CREATE OR REPLACE FUNCTION public.tombstone_asset_before_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.asset_tombstones (bucket, path, status)
  VALUES ('user_assets', OLD.user_id || '/' || OLD.id || '/' || OLD.filename, 'pending');

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS assets_tombstone_before_delete ON public.assets;
CREATE TRIGGER assets_tombstone_before_delete
  BEFORE DELETE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.tombstone_asset_before_delete();

-- ============================================================
-- 3. CASCADE — safe now that the trigger runs first
-- ============================================================
-- Verify constraint names before applying (never explicitly named in 001/006):
--   SELECT conname, conrelid::regclass, confdeltype FROM pg_constraint
--   WHERE conname IN ('assets_user_id_fkey', 'user_sites_user_id_fkey');
ALTER TABLE public.assets
  DROP CONSTRAINT assets_user_id_fkey,
  ADD CONSTRAINT assets_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_sites
  DROP CONSTRAINT user_sites_user_id_fkey,
  ADD CONSTRAINT user_sites_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================================
-- 4. account_deletions — the erasure request record
-- ============================================================
-- Deliberately NOT a FK to auth.users: this row is the audit trail of the
-- request itself and must survive the auth principal it was about.
CREATE TABLE IF NOT EXISTS public.account_deletions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done', 'failed')),
  retry_count INT NOT NULL DEFAULT 0,
  last_error TEXT,

  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_account_deletions_status ON public.account_deletions(status);

CREATE TRIGGER account_deletions_updated_at
  BEFORE UPDATE ON public.account_deletions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.account_deletions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "backend only account deletions"
  ON public.account_deletions FOR ALL
  USING (false);

-- ============================================================
-- 5. request_account_erasure — the single commit point
-- ============================================================
-- One transaction: request record -> delete assets/user_sites (trigger fires
-- per row, tombstones queued) -> return the storage paths just tombstoned, so
-- the caller can attempt an inline best-effort drain immediately.
CREATE OR REPLACE FUNCTION public.request_account_erasure(p_user_id UUID)
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_paths TEXT[];
BEGIN
  INSERT INTO public.account_deletions (user_id, requested_at, status)
  VALUES (p_user_id, now(), 'pending');

  WITH deleted_assets AS (
    DELETE FROM public.assets
    WHERE user_id = p_user_id
    RETURNING user_id, id, filename
  )
  SELECT COALESCE(array_agg(user_id::text || '/' || id::text || '/' || filename), ARRAY[]::text[])
  INTO v_paths
  FROM deleted_assets;

  DELETE FROM public.user_sites WHERE user_id = p_user_id;

  RETURN v_paths;
END;
$$;
