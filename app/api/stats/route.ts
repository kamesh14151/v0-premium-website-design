import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { neon } from '@neondatabase/serverless';

export async function GET(request: Request) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Connect to Neon
    const sql = neon(process.env.DATABASE_URL!);

    // Get API calls count
    const apiCallsResult = await sql`
      SELECT COUNT(*) as count
      FROM request_history
      WHERE user_id = ${user.id}
    `;
    const apiCalls = parseInt(apiCallsResult[0]?.count || '0');

    // Get active API keys count
    const activeKeysResult = await sql`
      SELECT COUNT(*) as count
      FROM api_keys
      WHERE user_id = ${user.id} AND is_active = true
    `;
    const activeKeys = parseInt(activeKeysResult[0]?.count || '0');

    // Get average latency
    const latencyResult = await sql`
      SELECT AVG(response_time) as avg_latency
      FROM request_history
      WHERE user_id = ${user.id} AND response_time IS NOT NULL
      LIMIT 100
    `;
    const avgLatency = Math.round(parseFloat(latencyResult[0]?.avg_latency || '0'));

    // Get total cost this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const costResult = await sql`
      SELECT SUM(cost) as total_cost
      FROM request_history
      WHERE user_id = ${user.id}
      AND created_at >= ${startOfMonth.toISOString()}
    `;
    const costThisMonth = parseFloat(costResult[0]?.total_cost || '0');

    // Calculate quota used (assuming 100k requests per month limit)
    const quotaLimit = 100000;
    const quotaUsed = Math.min(Math.round((apiCalls / quotaLimit) * 100), 100);

    // Get weekly chart data
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekDataResult = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as calls,
        SUM(total_tokens) as tokens,
        AVG(response_time) as latency
      FROM request_history
      WHERE user_id = ${user.id}
      AND created_at >= ${weekAgo.toISOString()}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // Process weekly chart data
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        name: date.toLocaleDateString('en-US', { weekday: 'short' })
      };
    });

    const chartData = last7Days.map(({ date, name }) => {
      const dayData = weekDataResult.find((r: any) => r.date === date);
      return {
        name,
        calls: parseInt(dayData?.calls || '0'),
        tokens: parseInt(dayData?.tokens || '0'),
        latency: Math.round(parseFloat(dayData?.latency || '0'))
      };
    });

    // Get model distribution
    const modelDataResult = await sql`
      SELECT model, COUNT(*) as count
      FROM request_history
      WHERE user_id = ${user.id}
      AND created_at >= ${weekAgo.toISOString()}
      GROUP BY model
      ORDER BY count DESC
      LIMIT 5
    `;

    const colors = ['#2563eb', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b'];
    const modelDistribution = modelDataResult.length > 0
      ? modelDataResult.map((row: any, idx: number) => ({
          name: row.model || 'Unknown',
          value: parseInt(row.count),
          fill: colors[idx % colors.length]
        }))
      : [{ name: 'No data', value: 1, fill: '#2563eb' }];

    return NextResponse.json({
      stats: {
        apiCalls,
        activeKeys,
        quotaUsed,
        avgLatency,
        uptime: 99.98,
        costThisMonth,
      },
      chartData,
      modelDistribution,
    });

  } catch (error: any) {
    console.error('Stats fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
