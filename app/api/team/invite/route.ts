import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
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

    const { email, role, team_id } = await request.json();

    const sql = neon(process.env.DATABASE_URL!);

    // Verify user is team owner
    const [team] = await sql`
      SELECT owner_id FROM teams WHERE id = ${team_id}
    `;

    if (!team || team.owner_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create invitation
    const inviteId = crypto.randomUUID();
    await sql`
      INSERT INTO team_invites (id, team_id, email, role, status)
      VALUES (${inviteId}, ${team_id}, ${email}, ${role}, 'pending')
    `;

    // Create notification
    await sql`
      INSERT INTO notifications (user_id, type, message)
      SELECT auth.uid(), 'team_invite', ${'You have been invited to ' || (SELECT name FROM teams WHERE id = ${team_id})}
      FROM auth.users WHERE email = ${email}
    `;

    return new Response(JSON.stringify({ 
      success: true, 
      invite_id: inviteId 
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[v0] Team invite error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
