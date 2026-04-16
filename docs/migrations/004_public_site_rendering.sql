-- docs/migrations/004_public_site_rendering.sql

-- 1. domain 기반 빠른 조회를 위한 unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_sites_domain 
  ON public.user_sites(domain) 
  WHERE domain IS NOT NULL;

-- 2. 비로그인 사용자도 active + domain 설정된 사이트를 읽을 수 있도록 RLS 정책 추가
-- (이미 존재하는 정책이 있다면 충돌 방지를 위해 체크)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_sites' AND policyname = 'read active published sites'
    ) THEN
        CREATE POLICY "read active published sites" 
          ON public.user_sites FOR SELECT 
          USING (status = 'active' AND domain IS NOT NULL);
    END IF;
END $$;
