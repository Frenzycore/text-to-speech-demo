"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BalanceBadge } from "@/components/balance-badge"
import { Volume2, CreditCard, LayoutDashboard, Shield, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

const navItems = [
  { href: "/", label: "Text to Speech", icon: Volume2 },
  { href: "/pricing", label: "Harga", icon: CreditCard },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin", label: "Admin", icon: Shield },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between" aria-label="Main navigation">
        <Link 
          href="/" 
          className="flex items-center gap-2 font-semibold text-lg"
          aria-label="VoiceGen - Home"
        >
          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
            <Volume2 className="h-5 w-5 text-accent-foreground" aria-hidden="true" />
          </div>
          <span>VoiceGen</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "gap-2",
                    isActive && "bg-secondary text-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </div>

        <div className="hidden md:block">
          <BalanceBadge />
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </Button>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div 
          id="mobile-menu"
          className="md:hidden border-t border-border bg-background"
          role="menu"
        >
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  onClick={() => setMobileMenuOpen(false)}
                  role="menuitem"
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-2",
                      isActive && "bg-secondary text-foreground"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
            <div className="pt-2 border-t border-border">
              <BalanceBadge />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
