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

    // Check if user is admin (you'd typically store this in a roles table)
    const sql = neon(process.env.DATABASE_URL!);

    // Get system metrics
    const [totalUsers] = await sql`SELECT COUNT(*) as count FROM auth.users`;
    const [totalRequests] = await sql`SELECT COUNT(*) as count FROM request_history`;
    const [totalTokens] = await sql`SELECT SUM(tokens_total) as total FROM request_history`;
    const [totalCost] = await sql`SELECT SUM(cost) as total FROM request_history`;

    const topModels = await sql`
      SELECT model, COUNT(*) as usage_count, SUM(tokens_total) as total_tokens
      FROM request_history
      GROUP BY model
      ORDER BY usage_count DESC
      LIMIT 5
    `;

    const errorRate = await sql`
      SELECT 
        ROUND(100.0 * SUM(CASE WHEN status_code != 200 THEN 1 ELSE 0 END) / COUNT(*), 2) as error_percentage
      FROM request_history
    `;

    return new Response(JSON.stringify({
      total_users: totalUsers[0]?.count || 0,
      total_requests: totalRequests[0]?.count || 0,
      total_tokens: totalTokens[0]?.total || 0,
      total_cost: totalCost[0]?.total || 0,
      top_models: topModels,
      error_rate: errorRate[0]?.error_percentage || 0,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[v0] Admin stats error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
