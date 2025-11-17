 'use client'

import { useState, useEffect, Suspense } from 'react'
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

function DemoCredentialsRow({ role, email, password, onFill }: DemoRowProps) {
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
    <div className="flex items-center justify-between rounded-xl border border-white/20 bg-white/60 p-3 text-black">
      <div>
        <div className="text-sm font-medium">{role}</div>
        <div className="text-xs text-black/75">
          {email} / <span className="font-mono">{password}</span>
          {copied && <span className="ml-2 text-emerald-600">Copied!</span>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" className="rounded-lg" onClick={() => onFill({ email, password })}>
          Fill
        </Button>
        <Button size="sm" className="rounded-lg" onClick={handleCopy}>
          <Copy className="w-4 h-4" />
          <span className="sr-only">Copy credentials</span>
        </Button>
      </div>
    </div>
  )
}

function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

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

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid credentials')
      } else {
        router.push('/my-learning')
        router.refresh()
      }
    } catch (error) {
      setError('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-warm flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl flex flex-col gap-8 md:grid md:grid-cols-[1.15fr_1fr]">
        <section className="rounded-3xl border border-white/20 bg-white/60 p-6 text-black shadow-lg md:hidden">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-pink-400 text-white">
            <BookOpen className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-hero leading-tight">Welcome back to CPU Online</h1>
          <p className="mt-3 text-base text-black/80">
            Sign in to pick up where you left off. Demo credentials are ready if you need a quick start.
          </p>
        </section>

        <section className="hidden rounded-3xl border border-white/20 bg-white/60 p-8 text-black shadow-lg md:flex md:flex-col md:justify-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-pink-400 text-white">
            <BookOpen className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-hero leading-tight">Welcome back to CPU Online</h1>
          <p className="mt-4 text-base text-black/80">
            Access courses, track progress, and continue learning where you left off. Demo credentials are available for quick testing.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1">
              <Sparkles className="h-4 w-4 text-orange-500" /> Curated curriculum
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1">
              Secure accounts
            </span>
          </div>
        </section>

        <div className="flex flex-col gap-5">
          <Card className="w-full rounded-3xl border border-white/20 bg-white/90 text-black shadow-xl">
            <CardHeader className="space-y-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-pink-400 text-white">
                <BookOpen className="h-7 w-7" />
              </div>
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription className="text-black/70">
                Sign in to continue to your courses and progress.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-black">
                    <Mail className="h-4 w-4 text-black/70" /> Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="rounded-xl border border-black/10 bg-white/70 text-black placeholder:text-black/50"
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2 text-black">
                    <Lock className="h-4 w-4 text-black/70" /> Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className="rounded-xl border border-black/10 bg-white/70 text-black placeholder:text-black/50"
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

                <Button type="submit" className="w-full rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-orange-500 text-white transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-orange-500/50" disabled={isLoading}>
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

          <Card className="w-full rounded-3xl border border-white/20 bg-white/80 text-black shadow-lg">
            <CardContent className="space-y-3">
              <h3 className="text-base font-semibold">Demo accounts (seeded)</h3>
              <p className="text-sm text-black/75">
                Use these credentials to explore the dashboard quickly. Choose Fill or Copy to populate the form instantly.
              </p>

              <DemoCredentialsRow
                role="Instructor"
                email="sarah.chen@cpuonline.com"
                password="instructor123"
                onFill={(creds) => {
                  setEmail(creds.email)
                  setPassword(creds.password)
                }}
              />

              <DemoCredentialsRow
                role="Student"
                email="john.doe@student.com"
                password="student123"
                onFill={(creds) => {
                  setEmail(creds.email)
                  setPassword(creds.password)
                }}
              />
            </CardContent>
          </Card>

          <p className="text-xs text-black/70 text-center sm:text-left">
            Built for speed — the sign-in page avoids animations and heavy scripts so you can authenticate without delay.
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
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
            Loading sign-in…
          </div>
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  )
}
