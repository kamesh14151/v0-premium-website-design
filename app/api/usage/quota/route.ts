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

    // Get subscription plan
    const [subscription] = await sql`
      SELECT sp.*, st.tokens_per_month, st.requests_per_minute
      FROM subscription_plans sp
      JOIN subscription_tiers st ON sp.plan_name = st.name
      WHERE sp.user_id = ${user.id} AND sp.status = 'active'
      LIMIT 1
    `;

    // Get current month usage
    const currentMonth = new Date().toISOString().slice(0, 7);
    const [usage] = await sql`
      SELECT * FROM usage_metrics
      WHERE user_id = ${user.id} AND month = ${currentMonth}
    `;

    // Calculate remaining quota
    const totalTokens = usage?.total_tokens || 0;
    const remainingTokens = (subscription?.tokens_per_month || 100000) - totalTokens;
    const tokenPercentage = (totalTokens / (subscription?.tokens_per_month || 100000)) * 100;

    return new Response(JSON.stringify({
      current_plan: subscription?.plan_name || 'Free',
      tokens_limit: subscription?.tokens_per_month || 100000,
      tokens_used: totalTokens,
      tokens_remaining: Math.max(0, remainingTokens),
      token_percentage: Math.min(100, tokenPercentage),
      requests_limit: subscription?.requests_per_minute || 10,
      current_month: currentMonth,
      period_start: subscription?.current_period_start,
      period_end: subscription?.current_period_end,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[v0] Quota check error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
