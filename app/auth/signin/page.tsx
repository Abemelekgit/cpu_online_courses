 'use client'

import { useState, useEffect, Suspense, memo, useCallback } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, BookOpen, Copy, Mail, Lock, Sparkles } from 'lucide-react'
import Link from 'next/link'

type DemoCreds = {
  email: string
  password: string
}

type DemoRowProps = {
  role: string
  email: string
  password: string
  onFill: (creds: DemoCreds) => void
}

const DemoCredentialsRow = memo(function DemoCredentialsRow({ role, email, password, onFill }: DemoRowProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${email}\t${password}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (error) {
      // clipboard access can fail in some browsers; ignore
    }
  }

  return (
    <div className="flex items-center justify-between rounded-lg sm:rounded-xl border border-white/20 bg-white/60 p-2.5 sm:p-3 text-black">
      <div className="min-w-0 flex-1">
        <div className="text-xs sm:text-sm font-medium truncate">{role}</div>
        <div className="text-[10px] sm:text-xs text-black/75 truncate">
          {email} / <span className="font-mono">{password}</span>
          {copied && <span className="ml-2 text-emerald-600 font-medium">Copied!</span>}
        </div>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ml-2">
        <Button size="sm" variant="outline" className="rounded-lg h-8 text-xs px-2 sm:px-3" onClick={() => onFill({ email, password })}>
          Fill
        </Button>
        <Button size="sm" className="rounded-lg h-8 px-2 sm:px-2.5" onClick={handleCopy}>
          <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="sr-only">Copy credentials</span>
        </Button>
      </div>
    </div>
  )
})

function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFill = useCallback((creds: DemoCreds) => {
    setEmail(creds.email)
    setPassword(creds.password)
  }, [])

  useEffect(() => {
    const message = searchParams.get('message')
    if (message) {
      setSuccessMessage(message)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid credentials')
        setIsLoading(false)
      } else {
        // Navigate immediately without waiting
        router.push('/my-learning')
      }
    } catch (error) {
      setError('Something went wrong')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-warm flex items-center justify-center px-4 py-8 sm:py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl flex flex-col gap-5 md:gap-6 md:grid md:grid-cols-[1.15fr_1fr]">
        <section className="rounded-2xl sm:rounded-3xl border border-white/20 bg-white/60 p-4 sm:p-5 text-black shadow-lg md:hidden">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-pink-400 text-white">
            <BookOpen className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-hero leading-tight">Welcome back</h1>
          <p className="mt-2 text-sm sm:text-base text-black/80">
            Sign in to continue your learning.
          </p>
        </section>

        <section className="hidden rounded-3xl border border-white/20 bg-white/60 p-6 md:p-8 text-black shadow-lg md:flex md:flex-col md:justify-center">
          <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-pink-400 text-white">
            <BookOpen className="h-8 w-8" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-hero leading-tight">Welcome back to CPU Online</h1>
          <p className="mt-3 text-sm lg:text-base text-black/80">
            Access courses, track progress, and continue learning where you left off.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1">
              <Sparkles className="h-4 w-4 text-orange-500" /> Curated curriculum
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1">
              Secure accounts
            </span>
          </div>
        </section>

        <div className="flex flex-col gap-3 md:gap-4">
          <Card className="w-full rounded-2xl sm:rounded-3xl border border-white/20 bg-white/90 text-black shadow-xl">
            <CardHeader className="space-y-2 p-4 sm:p-5">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-400 to-pink-400 text-white">
                <BookOpen className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <CardTitle className="text-xl sm:text-2xl">Welcome Back</CardTitle>
              <CardDescription className="text-sm sm:text-base text-black/70">
                Sign in to continue to your courses.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-5 pt-2">
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4" autoComplete="on">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-black text-sm">
                    <Mail className="h-4 w-4 text-black/70" /> Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="h-11 sm:h-12 rounded-xl border border-black/10 bg-white/70 text-black placeholder:text-black/50"
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2 text-black text-sm">
                    <Lock className="h-4 w-4 text-black/70" /> Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className="h-11 sm:h-12 rounded-xl border border-black/10 bg-white/70 text-black placeholder:text-black/50"
                    autoComplete="current-password"
                    placeholder="••••••••"
                  />
                </div>

                {successMessage && (
                  <Alert className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{successMessage}</AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive" className="rounded-xl border border-red-200 bg-red-50 text-red-900">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 sm:h-12 rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-orange-500 text-white transition-all hover:shadow-lg hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              <p className="text-sm text-black/70 text-center sm:text-left">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="font-medium text-orange-600 hover:text-orange-500">
                  Sign up
                </Link>
              </p>
            </CardContent>
          </Card>

          <Card className="w-full rounded-2xl sm:rounded-3xl border border-white/20 bg-white/80 text-black shadow-lg">
            <CardContent className="space-y-2.5 sm:space-y-3 p-4 sm:p-5">
              <h3 className="text-sm sm:text-base font-semibold">Demo accounts</h3>
              <p className="text-xs sm:text-sm text-black/75">
                Quick testing credentials. Click Fill or Copy.
              </p>

              <DemoCredentialsRow role="Instructor" email="sarah.chen@cpuonline.com" password="instructor123" onFill={handleFill} />

              <DemoCredentialsRow role="Student" email="john.doe@student.com" password="student123" onFill={handleFill} />
            </CardContent>
          </Card>

          <p className="text-xs text-black/70 text-center sm:text-left px-1">
            Optimized for instant loading and smooth navigation.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen gradient-warm flex items-center justify-center">
          <div className="text-center text-black">
            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
            <p className="text-sm">Loading…</p>
          </div>
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  )
}
