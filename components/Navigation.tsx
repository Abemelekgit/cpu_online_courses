'use client'

import React, { memo, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { BookOpen, User, LogOut, Settings, Globe } from 'lucide-react'
import ThemeToggle from '@/components/ui/theme-toggle'

function NavigationComponent() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    const routesToPrefetch = ['/catalog', '/my-learning', '/auth/signin', '/auth/signup']

    routesToPrefetch.forEach((path) => {
      try {
        router.prefetch(path)
      } catch {
        // Ignore prefetch errors (e.g. route not yet compiled in dev)
      }
    })

    const userRole = (session?.user as any)?.role
    if (userRole === 'ADMIN') {
      try {
        router.prefetch('/admin')
      } catch {
        // no-op if admin route prefetch fails
      }
    }
  }, [router, session?.user])

  return (
    <nav className="sticky top-0 z-50 border-b border-border/80 bg-card/90 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="transition-transform duration-150 hover:scale-[1.02] active:scale-95">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-600 to-cyan-500 flex items-center justify-center shadow-sm">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-semibold tracking-tight text-foreground">CPU Learn</span>
              </Link>
            </div>

            <div className="hidden lg:flex items-center space-x-6">
              <div>
                <Link href="/catalog" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                  Browse Courses
                </Link>
              </div>
              <div>
                <Link href="/my-learning" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                  My Learning
                </Link>
              </div>
              {session?.user && (session.user as any).role === 'ADMIN' && (
                <div>
                  <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                    Admin
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {status === 'loading' ? (
              <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="transition-transform duration-150 hover:scale-[1.03] active:scale-95">
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
                        <AvatarFallback>{session.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56 rounded-2xl" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{session.user?.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{session.user?.email}</p>
                    </div>
                  </div>

                  <DropdownMenuItem asChild>
                    <Link href="/my-learning" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      My Learning
                    </Link>
                  </DropdownMenuItem>

                  {session.user && (session.user as any).role === 'ADMIN' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Globe className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem>
                    <button onClick={() => signOut()} className="flex items-center w-full">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button className="bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 text-white border-0">
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export const Navigation = memo(NavigationComponent)
