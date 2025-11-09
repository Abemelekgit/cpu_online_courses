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
import { motion } from 'framer-motion'
import Link from 'next/link'

type DemoCreds = {
  email: string
  password: string
}

function DemoCredentialsRow({ role, email, password, onFill }: { role: string; email: string; password: string; onFill: (creds: DemoCreds) => void }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${email}\t${password}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (e) {
      // noop
    }
  }

  return (
    <div className="flex items-center justify-between mb-3">
      <div>
        <div className="text-sm font-medium">{role}</div>
        <div className="text-xs text-muted-foreground">{email} / <span className="font-mono">{password}</span></div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" onClick={() => onFill({ email, password })}>
          Fill
        </Button>
        <Button size="sm" onClick={handleCopy}>
          <Copy className="w-4 h-4" />
          <span className="sr-only">Copy</span>
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
        // Redirect based on role - will be handled by middleware
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
    <div className="min-h-screen gradient-warm flex items-center justify-center relative overflow-hidden">
      {/* Floating decorative elements */}
      <motion.div
        className="absolute top-20 left-20 w-32 h-32 bg-orange-200/20 rounded-full"
        animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-24 h-24 bg-pink-200/20 rounded-full"
        animate={{ y: [0, 20, 0], rotate: [0, -180, -360] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-10 w-16 h-16 bg-teal-200/20 rounded-full"
        animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="w-full max-w-5xl relative z-10 px-6"
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left hero / intro */}
          <div className="hidden md:flex flex-col gap-6 pr-6">
            <div className="hero-illustration p-6 h-full flex flex-col justify-center items-start rounded-2xl">
              <div className="mb-4 w-20 h-20 bg-gradient-to-br from-orange-400 to-pink-400 rounded-3xl flex items-center justify-center accent-glow">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-hero leading-tight">Welcome back to CPU Online</h1>
              <p className="text-lg text-muted-foreground max-w-sm mt-2">Access courses, track progress, and continue learning where you left off. Fast sign in with seeded demo accounts for testing.</p>
              <div className="mt-6 flex items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 py-1 px-3 text-sm"> <Sparkles className="w-4 h-4 text-orange-500" /> Curated curriculum</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 py-1 px-3 text-sm">Secure accounts</span>
              </div>
            </div>
          </div>
          <Card className="glass-border border-0 shadow-2xl p-8">
            <CardHeader className="text-left p-0">
                <motion.div
                  className="mb-4 w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-400 rounded-2xl flex items-center justify-center accent-glow"
                  whileHover={{ rotate: 5, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                >
                  <BookOpen className="w-8 h-8 text-white" />
                </motion.div>
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription className="text-muted-foreground">
                Sign in to continue to your courses and progress.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.12 }}
                >
                  <Label htmlFor="email" className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /> Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="rounded-xl"
                    placeholder="you@example.com"
                  />
                </motion.div>
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.18 }}
                >
                  <Label htmlFor="password" className="flex items-center gap-2"><Lock className="w-4 h-4 text-muted-foreground" /> Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="rounded-xl"
                    placeholder="••••••••"
                  />
                </motion.div>

                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <Alert className="rounded-xl">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>{successMessage}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <Alert variant="destructive" className="rounded-xl">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.24 }}
                >
                  <Button type="submit" className="w-full gradient-accent rounded-xl" disabled={isLoading}>
                    {isLoading ? (
                      <motion.div className="flex items-center gap-2" animate={{ opacity: [0.6, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Signing in...
                      </motion.div>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </motion.div>
              </form>

              <motion.div className="mt-4 flex justify-between items-center text-sm text-gray-600" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <p>
                  Don't have an account?{' '}
                  <Link href="/auth/signup" className="font-medium text-orange-600 hover:text-orange-500 transition-colors">
                    Sign up
                  </Link>
                </p>
              </motion.div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-0 shadow-lg p-6 hero-illustration">
              <CardContent>
                <h3 className="text-lg font-semibold">Demo accounts (seeded)</h3>
                <p className="text-sm text-muted-foreground mb-3">Click Fill to populate the form or Copy to copy credentials to clipboard.</p>

                <DemoCredentialsRow
                  role="Instructor"
                  email="sarah.chen@cpuonline.com"
                  password="instructor123"
                  onFill={(creds) => {
                    setEmail(creds.email); setPassword(creds.password)
                  }}
                />

                <DemoCredentialsRow
                  role="Student"
                  email="john.doe@student.com"
                  password="student123"
                  onFill={(creds) => {
                    setEmail(creds.email); setPassword(creds.password)
                  }}
                />
              </CardContent>
            </Card>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <p className="text-xs text-muted-foreground">Built with care — your progress and course data are saved to the seeded demo database.</p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen gradient-warm flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading...
          </motion.p>
        </motion.div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}
