"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AdminTable } from "@/components/admin-table"
import { UserProvider } from "@/lib/user-context"
import { ToastProvider, useToast } from "@/components/toast-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Shield, Lock, UserPlus, FileText, LogOut } from "lucide-react"

// Admin password from environment variable - fallback for demo
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_TOKEN || "admin123"

// Mock top-up requests - in production this would come from Supabase
const initialRequests = [
  { id: 1, email: "user1@example.com", amount: 5000, credits: 15000, status: "pending" as const, date: "2024-01-15 14:30" },
  { id: 2, email: "user2@example.com", amount: 25000, credits: 75000, status: "pending" as const, date: "2024-01-15 12:15" },
  { id: 3, email: "user3@example.com", amount: 5000, credits: 15000, status: "approved" as const, date: "2024-01-14 09:45" },
  { id: 4, email: "user4@example.com", amount: 25000, credits: 75000, status: "rejected" as const, date: "2024-01-13 16:20" },
  { id: 5, email: "user5@example.com", amount: 5000, credits: 15000, status: "approved" as const, date: "2024-01-13 11:00" },
]

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      onLogin()
    } else {
      setError("Password salah")
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center">
            <Shield className="h-8 w-8 text-accent" aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl">Admin Panel</CardTitle>
          <CardDescription>
            Masukkan password untuk mengakses panel admin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password admin"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError("")
                  }}
                  className="pl-9 bg-background border-border"
                  autoComplete="current-password"
                />
              </div>
              {error && (
                <p className="text-sm text-destructive" role="alert">{error}</p>
              )}
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              Masuk
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Demo password: admin123
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const { showToast } = useToast()
  const [requests, setRequests] = useState(initialRequests)
  const [addBalanceEmail, setAddBalanceEmail] = useState("")
  const [addBalanceAmount, setAddBalanceAmount] = useState("")
  const [addBalanceNotes, setAddBalanceNotes] = useState("")

  const handleApprove = (id: number) => {
    setRequests(requests.map((req) => 
      req.id === id ? { ...req, status: "approved" as const } : req
    ))
    // TODO: In production, call Supabase to update request and add balance
    // await supabase.from('topup_requests').update({ status: 'approved' }).eq('id', id)
    // await supabase.from('users').update({ balance: newBalance }).eq('email', request.email)
    showToast("Request berhasil disetujui!", "success")
  }

  const handleReject = (id: number) => {
    setRequests(requests.map((req) => 
      req.id === id ? { ...req, status: "rejected" as const } : req
    ))
    // TODO: In production, call Supabase to update request
    // await supabase.from('topup_requests').update({ status: 'rejected' }).eq('id', id)
    showToast("Request ditolak", "info")
  }

  const handleAddBalance = (e: React.FormEvent) => {
    e.preventDefault()
    if (!addBalanceEmail || !addBalanceAmount) {
      showToast("Mohon isi email dan jumlah karakter", "error")
      return
    }
    
    // TODO: In production, call Supabase to add balance
    // await supabase.from('users').update({ balance: newBalance }).eq('email', addBalanceEmail)
    const newRequest = {
      id: Date.now(),
      email: addBalanceEmail,
      amount: 0,
      credits: parseInt(addBalanceAmount),
      status: "approved" as const,
      date: new Date().toLocaleString("id-ID"),
    }
    setRequests([newRequest, ...requests])
    setAddBalanceEmail("")
    setAddBalanceAmount("")
    setAddBalanceNotes("")
    showToast(`Berhasil menambahkan ${parseInt(addBalanceAmount).toLocaleString()} karakter ke ${addBalanceEmail}`, "success")
  }

  const pendingCount = requests.filter((r) => r.status === "pending").length

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Shield className="h-7 w-7 md:h-8 md:w-8 text-accent" aria-hidden="true" />
              Admin Panel
            </h1>
            <p className="text-muted-foreground mt-1">
              Kelola top-up request dan saldo pengguna
            </p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </Button>
        </div>

        <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
          {/* Add Balance Form */}
          <Card className="lg:col-span-1 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-accent" aria-hidden="true" />
                Tambah Saldo Manual
              </CardTitle>
              <CardDescription>
                Tambah saldo langsung ke akun pengguna
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddBalance} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email User</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={addBalanceEmail}
                    onChange={(e) => setAddBalanceEmail(e.target.value)}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Jumlah Karakter</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="15000"
                    value={addBalanceAmount}
                    onChange={(e) => setAddBalanceAmount(e.target.value)}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan (opsional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Keterangan tambahan..."
                    value={addBalanceNotes}
                    onChange={(e) => setAddBalanceNotes(e.target.value)}
                    className="bg-background border-border resize-none"
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  Tambah Saldo
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Top-up Requests */}
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-accent" aria-hidden="true" />
                    Top-up Request
                  </CardTitle>
                  <CardDescription>
                    Daftar permintaan top-up dari pengguna
                  </CardDescription>
                </div>
                {pendingCount > 0 && (
                  <div className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-sm font-medium px-3 py-1 rounded-full">
                    {pendingCount} pending
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <AdminTable
                requests={requests}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function AdminContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  if (!isLoggedIn) {
    return <AdminLogin onLogin={() => setIsLoggedIn(true)} />
  }

  return <AdminDashboard onLogout={() => setIsLoggedIn(false)} />
}

export default function AdminPage() {
  return (
    <UserProvider>
      <ToastProvider>
        <AdminContent />
      </ToastProvider>
    </UserProvider>
  )
}
