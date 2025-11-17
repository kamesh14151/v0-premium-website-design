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

    const sql = neon(process.env.DATABASE_URL!);

    // Get user subscription
    const [subscription] = await sql`
      SELECT sp.*, st.features, st.tokens_per_month, st.requests_per_minute, st.team_members
      FROM subscription_plans sp
      JOIN subscription_tiers st ON sp.plan_name = st.name
      WHERE sp.user_id = ${user.id} AND sp.status = 'active'
      LIMIT 1
    `;

    // Get usage this month
    const currentMonth = new Date().toISOString().slice(0, 7);
    const [usage] = await sql`
      SELECT * FROM usage_metrics
      WHERE user_id = ${user.id} AND month = ${currentMonth}
    `;

    return new Response(JSON.stringify({
      subscription,
      usage,
      current_month: currentMonth,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[v0] Get subscription error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

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

    const { plan_name } = await request.json();

    const sql = neon(process.env.DATABASE_URL!);

    // Update subscription
    await sql`
      UPDATE subscription_plans
      SET plan_name = ${plan_name}, updated_at = now()
      WHERE user_id = ${user.id}
    `;

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[v0] Update subscription error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
