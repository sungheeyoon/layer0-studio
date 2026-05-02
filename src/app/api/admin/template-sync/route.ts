import { createClient } from '@/utils/supabase/server';
import { syncTemplates } from '@/lib/template/sync';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // 1. Security check: Only admins can sync
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const role = user.app_metadata?.role;
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin role required' }, { status: 403 });
    }

    // 2. Parse options
    const { searchParams } = new URL(request.url);
    const dryRun = searchParams.get('dryRun') !== 'false'; // default to true
    const targetSlug = searchParams.get('slug') || undefined;

    // 3. Run sync
    // For API, we use the admin client (service role) to have full access
    // but we'll use a special way to get it if needed, or just assume the server client
    // has enough permissions if the user is authenticated as admin.
    // Actually, syncTemplates might need service role for some operations.
    
    // Let's create an admin client for the actual sync
    const { createAdminClient } = await import('@/utils/supabase/server');
    const adminSupabase = await createAdminClient();

    const summary = await syncTemplates(adminSupabase, {
      dryRun,
      targetSlug
    });

    return NextResponse.json(summary);
  } catch (err: any) {
    console.error('Error in template-sync API:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
