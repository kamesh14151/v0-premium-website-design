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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');

    // Connect to Neon
    const sql = neon(process.env.DATABASE_URL!);

    // Fetch requests
    const requests = await sql`
      SELECT *
      FROM request_history
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    // Calculate stats
    const totalRequests = requests.length;
    const successfulRequests = requests.filter((r: any) => r.status_code === 200).length;
    const avgResponse = totalRequests > 0
      ? requests.reduce((sum: number, r: any) => sum + (r.response_time || 0), 0) / totalRequests
      : 0;
    const totalCost = requests.reduce((sum: number, r: any) => sum + (r.cost || 0), 0);
    const errors = totalRequests - successfulRequests;

    const stats = {
      totalRequests,
      avgResponse: avgResponse / 1000, // Convert to seconds
      successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
      errors,
      totalCost,
    };

    // Generate latency chart data
    const last24Hours = requests.slice(0, Math.min(24, requests.length));
    const latencyData = [];
    for (let i = 0; i < 7; i++) {
      const startIdx = i * 3;
      const endIdx = startIdx + 3;
      const slice = last24Hours.slice(startIdx, endIdx);
      if (slice.length > 0) {
        latencyData.push({
          time: `${i * 4}:00`,
          latency: Math.round(slice.reduce((sum: number, r: any) => sum + (r.response_time || 0), 0) / slice.length),
          errors: slice.filter((r: any) => r.status_code !== 200).length,
        });
      }
    }

    return NextResponse.json({
      requests,
      stats,
      latencyData,
    });

  } catch (error: any) {
    console.error('Requests fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}
