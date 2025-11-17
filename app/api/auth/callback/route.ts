import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'signup' | 'email' | 'recovery' | null
  const next = searchParams.get('next') ?? '/dashboard'

  if (token_hash && type) {
    const supabase = createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      // Redirect to the intended destination or dashboard
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // If there's an error or missing params, redirect to error page
  return NextResponse.redirect(new URL('/auth/error', request.url))
}
