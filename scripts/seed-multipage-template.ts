/**
 * One-off seed: publish the `corporate-multipage` Multi fixture into the
 * `templates` catalog as an ACTIVE row so it shows on /templates and can be
 * instantiated. Idempotent (upsert by slug). Code is the source of truth, so
 * template_json is taken verbatim from the preset (cf. ADR-0002).
 *
 * Run: node --env-file=.env.local --import tsx scripts/seed-multipage-template.ts
 *
 * Note: this sets status='active' directly (bypasses the canPublishTemplates
 * review gate) — intentional for seeding the demo Multi template.
 */
import { createClient } from '@supabase/supabase-js';
import preset from '../src/templates/corporate/multipage/template';
import { library } from '../src/templates/corporate/multipage';
import { validateTemplateJson } from '../src/lib/template/validate';
import { getAvailableTemplateKeys, templateCategories } from '../src/templates/_generated';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const templateKey = 'corporate-multipage';
  const category = templateCategories[templateKey];
  const templateJson = preset.templateJson;

  // Validate against the library (code is source of truth).
  const { errors } = validateTemplateJson(templateJson, {
    availableTemplateKeys: getAvailableTemplateKeys(),
    templateLibrary: library,
  });
  if (errors.length > 0) {
    console.error('❌ Validation failed:');
    errors.forEach((e) => console.error(`  - [${e.code}] ${e.message} (${e.path})`));
    process.exit(1);
  }

  // Reuse an existing thumbnail so the catalog card isn't broken.
  const { data: ref } = await supabase
    .from('templates')
    .select('thumbnail_url')
    .eq('slug', 'corporate-default')
    .maybeSingle();
  const thumbnail_url = ref?.thumbnail_url ?? null;

  const row = {
    slug: preset.slug,
    name: preset.defaults.name,
    description: preset.defaults.description,
    category,
    template_json: templateJson,
    version: preset.version,
    thumbnail_url,
    status: 'active' as const,
  };

  const { data: existing } = await supabase
    .from('templates')
    .select('id')
    .eq('slug', preset.slug)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('templates')
      .update({ ...row, updated_at: new Date().toISOString() })
      .eq('slug', preset.slug);
    if (error) throw error;
    console.log(`✅ Updated + activated "${preset.slug}" (thumbnail=${thumbnail_url ? 'reused' : 'none'}).`);
  } else {
    const { error } = await supabase.from('templates').insert(row);
    if (error) throw error;
    console.log(`✅ Created + activated "${preset.slug}" (thumbnail=${thumbnail_url ? 'reused' : 'none'}).`);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
