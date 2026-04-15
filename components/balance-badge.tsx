"use client"

import { Badge } from "@/components/ui/badge"
import { Wallet, AlertTriangle, Sparkles } from "lucide-react"
import { useUser } from "@/lib/user-context"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { useState, useEffect } from "react"

// Format number consistently to avoid hydration mismatch
function formatNumber(num: number): string {
  return new Intl.NumberFormat("id-ID").format(num)
}

export function BalanceBadge() {
  const { user, getAvailableCharacters, isLoading } = useUser()
  const [mounted, setMounted] = useState(false)

  // Only render dynamic content after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Show skeleton during loading or before mount
  if (isLoading || !mounted) {
    return <Skeleton className="h-8 w-32" />
  }

  const available = getAvailableCharacters()
  const isLow = available <= 0
  const formattedAvailable = formatNumber(available)

  if (isLow) {
    return (
      <Link href="/pricing" aria-label="Saldo habis - klik untuk top up">
        <Badge 
          variant="destructive" 
          className="flex items-center gap-1.5 px-3 py-1.5 cursor-pointer hover:bg-destructive/90 transition-colors"
        >
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Saldo Habis - Top Up</span>
        </Badge>
      </Link>
    )
  }

  if (user.tier === "free") {
    return (
      <Link href="/dashboard" aria-label={`Saldo: ${formattedAvailable} karakter - klik untuk lihat dashboard`}>
        <Badge 
          variant="secondary" 
          className="flex items-center gap-1.5 px-3 py-1.5 cursor-pointer hover:bg-secondary/80 transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Free Tier</span>
          <span className="text-muted-foreground" aria-hidden="true">|</span>
          <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{formattedAvailable} karakter</span>
        </Badge>
      </Link>
    )
  }

  return (
    <Link href="/dashboard" aria-label={`Saldo: ${formattedAvailable} karakter - klik untuk lihat dashboard`}>
      <Badge 
        variant="outline" 
        className="flex items-center gap-1.5 px-3 py-1.5 border-accent text-accent cursor-pointer hover:bg-accent/10 transition-colors"
      >
        <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Saldo: {formattedAvailable} karakter</span>
      </Badge>
    </Link>
  )
}
