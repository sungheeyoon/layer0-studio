-- ============================================
-- Layer0 Studio: Asset & Storage System
-- ============================================

-- 1. Assets Table (에셋 메타데이터)
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size BIGINT NOT NULL,
  
  -- pending: 업로드 대기/업로드 중
  -- active: 정상적으로 사이트에 연결되어 사용 중
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active')),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Asset Usages Table (에셋 레퍼런스 및 스왑 감지용)
CREATE TABLE IF NOT EXISTS public.asset_usages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE NOT NULL,
  site_id UUID REFERENCES public.user_sites(id) ON DELETE CASCADE NOT NULL,
  slot_key TEXT NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(asset_id, site_id, slot_key)
);

-- 3. Cleanup Queue (비동기 삭제 파이프라인 큐)
CREATE TABLE IF NOT EXISTS public.cleanup_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE NOT NULL,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'done', 'failed')),
  retry_count INT DEFAULT 0,
  last_error TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(asset_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON public.assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON public.assets(status);
CREATE INDEX IF NOT EXISTS idx_asset_usages_site_id ON public.asset_usages(site_id);
CREATE INDEX IF NOT EXISTS idx_cleanup_queue_status ON public.cleanup_queue(status);

-- triggers for updated_at
CREATE TRIGGER assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER cleanup_queue_updated_at
  BEFORE UPDATE ON public.cleanup_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleanup_queue ENABLE ROW LEVEL SECURITY;

-- assets policies
CREATE POLICY "manage own assets"
  ON public.assets FOR ALL
  USING (auth.uid() = user_id);

-- usage policies
CREATE POLICY "manage own asset usages"
  ON public.asset_usages FOR ALL
  USING (
    site_id IN (
      SELECT id FROM public.user_sites WHERE user_id = auth.uid()
    )
  );

-- Backend mostly service_role
CREATE POLICY "backend only cleanup"
  ON public.cleanup_queue FOR ALL
  USING (false);

-- 4. Storage Bucket Setup
INSERT INTO storage.buckets (id, name, public) VALUES ('user_assets', 'user_assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS (Assume storage schema RLS is configured elsewhere but add basic policies)
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'user_assets' );

CREATE POLICY "Users can upload their own assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'user_assets'
    AND auth.uid() = owner
  );

CREATE POLICY "Users can manage their own assets"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'user_assets'
    AND auth.uid() = owner
  );
