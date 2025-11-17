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
    const team_id = searchParams.get('team_id');

    const sql = neon(process.env.DATABASE_URL!);

    // Get team members with profile info
    const members = await sql`
      SELECT 
        tm.id,
        tm.user_id,
        tm.role,
        tm.created_at,
        p.email,
        p.full_name,
        p.company
      FROM team_members tm
      JOIN profiles p ON tm.user_id = p.id
      WHERE tm.team_id = ${team_id}
      ORDER BY tm.created_at DESC
    `;

    return new Response(JSON.stringify(members), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[v0] Get team members error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
