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
    
    // Get summary stats for the current month
    const currentMonth = new Date().toISOString().slice(0, 7);

    const [usage] = await sql`
      SELECT 
        COALESCE(total_requests, 0) as total_requests,
        COALESCE(total_tokens, 0) as total_tokens,
        COALESCE(total_cost, 0) as total_cost,
        COALESCE(api_calls, 0) as api_calls
      FROM usage_metrics
      WHERE user_id = ${user.id} AND month = ${currentMonth}
    `;

    const latestRequests = await sql`
      SELECT 
        model,
        tokens_total,
        status_code,
        response_time_ms,
        cost,
        created_at
      FROM request_history
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 24
    `;

    const successCount = latestRequests.filter((r: any) => r.status_code === 200).length;
    const successRate = latestRequests.length > 0 
      ? ((successCount / latestRequests.length) * 100).toFixed(1)
      : 0;

    const avgLatency = latestRequests.length > 0
      ? (latestRequests.reduce((sum: number, r: any) => sum + (r.response_time_ms || 0), 0) / latestRequests.length).toFixed(0)
      : 0;

    return new Response(JSON.stringify({
      total_requests: usage?.total_requests || 0,
      total_tokens: usage?.total_tokens || 0,
      total_cost: usage?.total_cost || 0,
      api_calls: usage?.api_calls || 0,
      success_rate: successRate,
      avg_latency_ms: avgLatency,
      recent_requests: latestRequests,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[v0] Analytics error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
