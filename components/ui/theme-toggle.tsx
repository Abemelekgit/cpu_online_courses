"use client"

import React from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Sun, Moon, Globe, Droplet } from 'lucide-react'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8">
          <Globe className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <div className="flex items-center gap-2"><Sun className="w-4 h-4" /> System</div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <div className="flex items-center gap-2"><Sun className="w-4 h-4" /> Light</div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <div className="flex items-center gap-2"><Moon className="w-4 h-4" /> Dark</div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('ocean')}>
          <div className="flex items-center gap-2"><Droplet className="w-4 h-4" /> Ocean</div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('sunset')}>
          <div className="flex items-center gap-2"><Sun className="w-4 h-4" /> Sunset</div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
