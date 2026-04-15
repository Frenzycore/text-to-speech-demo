"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { UserProvider, useUser } from "@/lib/user-context"
import { ToastProvider, useToast } from "@/components/toast-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Wallet, CreditCard, History, User, Lock, Check, X } from "lucide-react"
import Link from "next/link"

// Format number consistently to avoid hydration mismatch
function formatNumber(num: number): string {
  return new Intl.NumberFormat("id-ID").format(num)
}

// Mock usage history data - in production this would come from Supabase
const mockHistory = [
  { id: 1, date: "2024-01-15 14:30", text: "Selamat datang di aplikasi VoiceGen...", characters: 245, status: "success" },
  { id: 2, date: "2024-01-15 12:15", text: "Halo, nama saya adalah asisten virtual...", characters: 189, status: "success" },
  { id: 3, date: "2024-01-14 09:45", text: "Terima kasih telah menggunakan layanan kami...", characters: 320, status: "success" },
  { id: 4, date: "2024-01-13 16:20", text: "Pengumuman penting untuk seluruh pengguna...", characters: 450, status: "failed" },
  { id: 5, date: "2024-01-13 11:00", text: "Selamat pagi, semoga hari Anda menyenangkan...", characters: 156, status: "success" },
]

function DashboardContent() {
  const { user, getAvailableCharacters, isLoading } = useUser()
  const { showToast } = useToast()
  const [email, setEmail] = useState(user.email)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const available = getAvailableCharacters()
  const showLoading = isLoading || !mounted

  const handleSaveProfile = () => {
    // TODO: In production, call Supabase to update profile
    // await supabase.from('users').update({ email }).eq('id', user.id)
    showToast("Profil berhasil disimpan!", "success")
  }

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword) {
      showToast("Mohon isi semua field", "error")
      return
    }
    // TODO: In production, call Supabase auth to change password
    // await supabase.auth.updateUser({ password: newPassword })
    showToast("Password berhasil diubah!", "success")
    setCurrentPassword("")
    setNewPassword("")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Dashboard</h1>

        <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
          {/* Balance Card */}
          <Card className="lg:col-span-1 bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wallet className="h-5 w-5 text-accent" aria-hidden="true" />
                Saldo Karakter
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showLoading ? (
                <Skeleton className="h-12 w-32 mb-2" />
              ) : (
                <div className="text-3xl md:text-4xl font-bold text-accent mb-2 tabular-nums">
                  {formatNumber(available)}
                </div>
              )}
              <p className="text-sm text-muted-foreground mb-4">
                {user.tier === "free" 
                  ? "karakter tersisa hari ini (reset harian)"
                  : "karakter tersedia"
                }
              </p>
              <Badge variant="outline" className="mb-4">
                {user.tier === "free" ? "Free Tier" : user.tier === "starter" ? "Starter" : "Pro"}
              </Badge>
              <Link href="/pricing" className="block">
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  <CreditCard className="h-4 w-4" aria-hidden="true" />
                  Top Up Saldo
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Usage History */}
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5 text-accent" aria-hidden="true" />
                Riwayat Penggunaan
              </CardTitle>
              <CardDescription>
                Riwayat generate audio terakhir Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <div className="min-w-[500px] px-4 md:px-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Teks</TableHead>
                        <TableHead className="text-right">Karakter</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockHistory.map((item) => (
                        <TableRow key={item.id} className="border-border">
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {item.date}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-sm">
                            {item.text}
                          </TableCell>
                          <TableCell className="text-right text-sm tabular-nums">
                            {formatNumber(item.characters)}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.status === "success" ? (
                              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                                <Check className="h-3 w-3 mr-1" aria-hidden="true" />
                                Berhasil
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                                <X className="h-3 w-3 mr-1" aria-hidden="true" />
                                Gagal
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Settings */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-accent" aria-hidden="true" />
                Profil
              </CardTitle>
              <CardDescription>
                Kelola informasi akun Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border-border"
                />
              </div>
              <Button onClick={handleSaveProfile} variant="outline" className="w-full">
                Simpan Perubahan
              </Button>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="h-5 w-5 text-accent" aria-hidden="true" />
                Ubah Password
              </CardTitle>
              <CardDescription>
                Perbarui password akun Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Password Saat Ini</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Password Baru</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-background border-border"
                  />
                </div>
              </div>
              <Button onClick={handleChangePassword} variant="outline" className="mt-4">
                Ubah Password
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <UserProvider>
      <ToastProvider>
        <DashboardContent />
      </ToastProvider>
    </UserProvider>
  )
}
