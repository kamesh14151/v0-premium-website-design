import { neon } from '@neondatabase/serverless';

// Server-side Neon client
export function getNeonClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not found');
  }
  return neon(process.env.DATABASE_URL);
}

// For edge runtime
export async function queryNeon(sql: string, params: any[] = []) {
  const client = getNeonClient();
  try {
    const result = await client(sql, params);
    return { data: result, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}
