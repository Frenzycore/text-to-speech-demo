"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PricingCard } from "@/components/pricing-card"
import { UserProvider } from "@/lib/user-context"
import { ToastProvider, useToast } from "@/components/toast-provider"
import { Info, MessageCircle, Mail } from "lucide-react"

const pricingPlans = [
  {
    tier: "free" as const,
    title: "Free",
    price: "Gratis",
    description: "Untuk mencoba fitur dasar",
    features: [
      "2.000 karakter per hari",
      "Reset harian otomatis",
      "Suara Standard Indonesia",
      "Akses audio player basic",
    ],
  },
  {
    tier: "starter" as const,
    title: "Starter",
    price: "Rp5.000",
    description: "Untuk penggunaan reguler",
    features: [
      "15.000 karakter",
      "Berlaku 30 hari",
      "Semua pilihan suara",
      "Kontrol kecepatan & pitch",
      "Download audio MP3",
    ],
    popular: true,
  },
  {
    tier: "pro" as const,
    title: "Pro",
    price: "Rp25.000",
    description: "Untuk kebutuhan profesional",
    features: [
      "75.000 karakter",
      "Berlaku 60 hari",
      "Semua pilihan suara",
      "Kontrol kecepatan & pitch",
      "Download audio MP3",
      "Prioritas support",
    ],
  },
]

function PricingContent() {
  const { showToast } = useToast()

  const handleSelectPlan = (tier: string) => {
    if (tier === "free") {
      showToast("Anda sudah menggunakan paket Free!", "info")
    } else {
      // Open WhatsApp with pre-filled message
      const message = encodeURIComponent(`Halo, saya ingin membeli paket ${tier === "starter" ? "Starter" : "Pro"} VoiceGen.`)
      window.open(`https://wa.me/6281234567890?text=${message}`, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            Pilih Paket yang Sesuai
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Mulai gratis, upgrade kapanpun sesuai kebutuhan Anda.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto mb-8 md:mb-12">
          {pricingPlans.map((plan) => (
            <PricingCard
              key={plan.tier}
              tier={plan.tier}
              title={plan.title}
              price={plan.price}
              description={plan.description}
              features={plan.features}
              popular={plan.popular}
              onSelect={() => handleSelectPlan(plan.tier)}
            />
          ))}
        </div>

        {/* Payment Info Banner */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 md:p-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <Info className="h-5 w-5 text-accent" aria-hidden="true" />
              </div>
              <div className="space-y-3">
                <h2 className="font-semibold">Cara Pembayaran</h2>
                <p className="text-sm text-muted-foreground">
                  Pembayaran dilakukan secara manual via WhatsApp atau Email. 
                  Saldo akan ditambahkan ke akun Anda setelah verifikasi admin.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a 
                    href="https://wa.me/6281234567890" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
                    aria-label="WhatsApp: +62 812-3456-7890 (opens in new tab)"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    WhatsApp: +62 812-3456-7890
                  </a>
                  <a 
                    href="mailto:frenzy.lux@gmail.com" 
                    className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
                    aria-label="Email: frenzy.lux@gmail.com"
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    frenzy.lux@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function PricingPage() {
  return (
    <UserProvider>
      <ToastProvider>
        <PricingContent />
      </ToastProvider>
    </UserProvider>
  )
}
