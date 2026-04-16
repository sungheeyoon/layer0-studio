-- ✅ INSERT policy for templates
CREATE POLICY "insert template"
ON public.templates FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- ✅ INSERT policy for user_sites
CREATE POLICY "insert own site"
ON public.user_sites FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ✅ domain unique
ALTER TABLE public.user_sites
ADD CONSTRAINT unique_domain UNIQUE (domain);

-- (optional) slug lower unique
CREATE UNIQUE INDEX idx_templates_slug_lower
ON public.templates (lower(slug));