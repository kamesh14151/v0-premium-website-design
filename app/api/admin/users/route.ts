import { neon } from '@neondatabase/serverless';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const sql = neon(process.env.DATABASE_URL!);

    const users = await sql`
      SELECT 
        p.id,
        p.email,
        p.full_name,
        p.company,
        p.created_at,
        COUNT(DISTINCT rh.id) as total_requests,
        SUM(rh.tokens_total) as total_tokens,
        SUM(rh.cost) as total_cost
      FROM profiles p
      LEFT JOIN request_history rh ON p.id = rh.user_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [total] = await sql`SELECT COUNT(*) as count FROM profiles`;

    return new Response(JSON.stringify({
      users,
      total: total[0]?.count || 0,
      limit,
      offset,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[v0] Get users error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
