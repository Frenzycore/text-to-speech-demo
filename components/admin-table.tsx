"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Check, X, Clock, Search } from "lucide-react"
import { useState } from "react"

interface TopUpRequest {
  id: number
  email: string
  amount: number
  credits: number
  status: "pending" | "approved" | "rejected"
  date: string
  notes?: string
}

interface AdminTableProps {
  requests: TopUpRequest[]
  onApprove: (id: number) => void
  onReject: (id: number) => void
}

export function AdminTable({ requests, onApprove, onReject }: AdminTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")

  const filteredRequests = requests.filter((request) => {
    const matchesSearch = request.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: TopUpRequest["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20">
            <Clock className="h-3 w-3 mr-1" aria-hidden="true" />
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
            <Check className="h-3 w-3 mr-1" aria-hidden="true" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
            <X className="h-3 w-3 mr-1" aria-hidden="true" />
            Rejected
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Cari email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background border-border"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className={statusFilter === status ? "bg-accent text-accent-foreground" : ""}
            >
              {status === "all" ? "Semua" : status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border bg-muted/30">
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Bayar (Rp)</TableHead>
                <TableHead className="text-right">Kredit</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Tidak ada data ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((request) => (
                  <TableRow key={request.id} className="border-border">
                    <TableCell className="font-medium">{request.email}</TableCell>
                    <TableCell className="text-right">
                      {request.amount.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right">
                      {request.credits.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {request.date}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(request.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        {request.status === "pending" ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onApprove(request.id)}
                              className="h-8 w-8 text-accent hover:text-accent hover:bg-accent/10"
                              aria-label={`Approve request from ${request.email}`}
                            >
                              <Check className="h-4 w-4" aria-hidden="true" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onReject(request.id)}
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              aria-label={`Reject request from ${request.email}`}
                            >
                              <X className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
