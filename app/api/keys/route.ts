import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    // Get authenticated user from Supabase Auth (server-side)
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Connect to Neon
    const sql = neon(process.env.DATABASE_URL!);

    // Ensure user exists in Neon database
    await sql`
      INSERT INTO users (id, email, full_name, avatar_url)
      VALUES (${user.id}, ${user.email}, ${user.user_metadata?.full_name || null}, ${user.user_metadata?.avatar_url || null})
      ON CONFLICT (id) DO NOTHING
    `;

    // Generate API key
    const randomBytes = crypto.randomBytes(32).toString('hex');
    const apiKey = `nxq_${randomBytes}`;
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    // Insert API key
    const result = await sql`
      INSERT INTO api_keys (user_id, name, key_hash, key_prefix, is_active)
      VALUES (${user.id}, ${name}, ${keyHash}, ${'nxq_'}, ${true})
      RETURNING id, name, key_prefix, created_at
    `;

    return NextResponse.json({
      success: true,
      key: apiKey,
      keyData: result[0]
    });

  } catch (error: any) {
    console.error('API key creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create API key' },
      { status: 500 }
    );
  }
}

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

    // Get user's API keys
    const keys = await sql`
      SELECT id, name, key_prefix, is_active, last_used_at, created_at
      FROM api_keys
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ keys });

  } catch (error: any) {
    console.error('API keys fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('id');

    if (!keyId) {
      return NextResponse.json({ error: 'Key ID required' }, { status: 400 });
    }

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Connect to Neon
    const sql = neon(process.env.DATABASE_URL!);

    // Delete API key (only if owned by user)
    await sql`
      DELETE FROM api_keys
      WHERE id = ${keyId} AND user_id = ${user.id}
    `;

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('API key deletion error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete API key' },
      { status: 500 }
    );
  }
}
