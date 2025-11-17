import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { api_key } = await request.json();

    if (!api_key) {
      return new Response(JSON.stringify({ error: 'API key required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const keyHash = crypto.createHash('sha256').update(api_key).digest('hex');
    const sql = neon(process.env.DATABASE_URL!);

    const [keyRecord] = await sql`
      SELECT id, user_id, name, revoked, created_at 
      FROM api_keys 
      WHERE key_hash = ${keyHash} AND revoked = false
    `;

    if (!keyRecord) {
      return new Response(JSON.stringify({ valid: false, error: 'Invalid API key' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update last_used_at
    await sql`
      UPDATE api_keys 
      SET last_used_at = now() 
      WHERE id = ${keyRecord.id}
    `;

    return new Response(JSON.stringify({
      valid: true,
      key_id: keyRecord.id,
      user_id: keyRecord.user_id,
      name: keyRecord.name,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[v0] Key validation error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
