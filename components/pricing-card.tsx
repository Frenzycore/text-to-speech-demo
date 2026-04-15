"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Sparkles, Zap, Crown } from "lucide-react"
import { cn } from "@/lib/utils"

interface PricingCardProps {
  title: string
  price: string
  description: string
  features: string[]
  popular?: boolean
  tier: "free" | "starter" | "pro"
  onSelect: () => void
}

const tierIcons = {
  free: Sparkles,
  starter: Zap,
  pro: Crown,
}

export function PricingCard({ title, price, description, features, popular, tier, onSelect }: PricingCardProps) {
  const Icon = tierIcons[tier]

  return (
    <Card className={cn(
      "relative flex flex-col bg-card border-border transition-all duration-200 hover:border-accent/50",
      popular && "border-accent ring-1 ring-accent"
    )}>
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-accent text-accent-foreground text-xs font-medium px-3 py-1 rounded-full">
            Populer
          </span>
        </div>
      )}
      
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
          <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-muted-foreground">{description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="text-center mb-6">
          <span className="text-3xl font-bold">{price}</span>
        </div>

        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" aria-hidden="true" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          onClick={onSelect}
          className={cn(
            "w-full",
            popular 
              ? "bg-accent hover:bg-accent/90 text-accent-foreground" 
              : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
          )}
        >
          {tier === "free" ? "Paket Aktif" : "Beli Sekarang"}
        </Button>
      </CardFooter>
    </Card>
  )
}
