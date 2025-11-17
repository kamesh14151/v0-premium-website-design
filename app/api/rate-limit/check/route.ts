import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
  try {
    const { api_key_id, user_id } = await request.json();

    const sql = neon(process.env.DATABASE_URL!);

    // Get subscription plan
    const [subscription] = await sql`
      SELECT rate_limit_per_minute FROM subscription_plans
      WHERE user_id = ${user_id} AND status = 'active'
      LIMIT 1
    `;

    const rateLimit = subscription?.rate_limit_per_minute || 10; // Default 10 req/min for free

    // Get current minute request count
    const now = new Date();
    const minuteStart = new Date(now.getTime() - (now.getTime() % 60000));

    const [rateLimitRecord] = await sql`
      SELECT request_count FROM rate_limits
      WHERE api_key_id = ${api_key_id} 
      AND minute_start = ${minuteStart.toISOString()}
    `;

    const currentCount = rateLimitRecord?.request_count || 0;

    if (currentCount >= rateLimit) {
      return new Response(JSON.stringify({
        allowed: false,
        remaining: 0,
        reset_at: new Date(minuteStart.getTime() + 60000),
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Increment counter
    if (rateLimitRecord) {
      await sql`
        UPDATE rate_limits 
        SET request_count = request_count + 1
        WHERE api_key_id = ${api_key_id} AND minute_start = ${minuteStart.toISOString()}
      `;
    } else {
      await sql`
        INSERT INTO rate_limits (api_key_id, minute_start, request_count)
        VALUES (${api_key_id}, ${minuteStart.toISOString()}, 1)
      `;
    }

    return new Response(JSON.stringify({
      allowed: true,
      remaining: rateLimit - currentCount - 1,
      reset_at: new Date(minuteStart.getTime() + 60000),
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[v0] Rate limit check error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
