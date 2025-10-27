"use client"

import React from 'react'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from '@/components/ui/sonner'
import { Navigation } from '@/components/Navigation'

export default function RootClients({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Navigation />
      {children}
      <Toaster />
    </SessionProvider>
  )
}
