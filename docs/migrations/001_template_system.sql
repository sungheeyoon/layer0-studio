-- ============================================
-- Layer0 Studio: CMS-Based Template System v2
-- ============================================

-- 1. Templates Table (설계도)
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  category TEXT DEFAULT 'general',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),

  thumbnail_url TEXT,

  -- 🔥 핵심: 구조 + default 값
  template_json JSONB NOT NULL,

  version TEXT DEFAULT '1.0.0',

  created_by UUID REFERENCES auth.users(id),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. User Sites Table (유저 사이트)
CREATE TABLE IF NOT EXISTS public.user_sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  user_id UUID REFERENCES auth.users(id) NOT NULL,

  -- 🔥 삭제 방지
  template_id UUID REFERENCES public.templates(id) ON DELETE RESTRICT,

  site_name TEXT NOT NULL,
  domain TEXT,

  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'suspended')),

  -- 🔥 핵심: 유저가 수정한 값만 저장
  site_json JSONB NOT NULL,

  -- 🔥 핵심: 템플릿 스냅샷 (버전 고정)
  template_snapshot JSONB NOT NULL,

  published_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_templates_status ON public.templates(status);
CREATE INDEX IF NOT EXISTS idx_templates_slug ON public.templates(slug);

CREATE INDEX IF NOT EXISTS idx_user_sites_user_id ON public.user_sites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sites_template_id ON public.user_sites(template_id);

-- 4. updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER templates_updated_at
  BEFORE UPDATE ON public.templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER user_sites_updated_at
  BEFORE UPDATE ON public.user_sites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. RLS
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sites ENABLE ROW LEVEL SECURITY;

-- templates 읽기 (active만)
CREATE POLICY "read active templates"
  ON public.templates FOR SELECT
  USING (status = 'active');

-- templates 관리자 권한
CREATE POLICY "manage own templates"
  ON public.templates FOR ALL
  USING (auth.uid() = created_by);

-- user_sites 본인만
CREATE POLICY "manage own sites"
  ON public.user_sites FOR ALL
  USING (auth.uid() = user_id);