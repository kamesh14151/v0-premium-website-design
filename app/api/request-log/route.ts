import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { neon } from '@neondatabase/serverless';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const model = searchParams.get('model');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const sql = neon(process.env.DATABASE_URL!);
    
    let query = `
      SELECT * FROM request_history
      WHERE user_id = $1
    `;
    const params: any[] = [user.id];

    if (model) {
      query += ` AND model = $${params.length + 1}`;
      params.push(model);
    }

    if (status) {
      query += ` AND status_code = $${params.length + 1}`;
      params.push(parseInt(status));
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const requests = await sql(query, params);

    return new Response(JSON.stringify(requests), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[v0] Request log error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
