'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function AuthError() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Authentication Error</h1>
          <p className="text-muted-foreground">
            There was a problem confirming your email. The link may have expired or already been used.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button onClick={() => router.push('/auth/login')}>
            Go to Login
          </Button>
          <Button variant="outline" onClick={() => router.push('/')}>
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
