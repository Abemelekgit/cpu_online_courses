"use client"

import React from 'react'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from '@/components/ui/sonner'
import { Navigation } from '@/components/Navigation'
import { ThemeProvider } from 'next-themes'

export default function RootClients({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="sunset" enableSystem>
      <SessionProvider>
        <Navigation />
        {children}
        <Toaster />
      </SessionProvider>
    </ThemeProvider>
  )
}
