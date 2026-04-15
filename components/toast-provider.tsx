"use client"

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastType = "success" | "error" | "warning" | "info"

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastIdRef = useRef(0)

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    toastIdRef.current += 1
    const id = `toast-${toastIdRef.current}-${Date.now()}`
    setToasts((prev) => [...prev, { id, message, type }])
    
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container - Fixed position, respects reduced motion */}
      <div 
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            className={cn(
              "pointer-events-auto bg-card border border-border rounded-lg shadow-lg p-4",
              "flex items-start gap-3",
              "motion-safe:animate-in motion-safe:slide-in-from-right-full motion-safe:fade-in",
              "motion-reduce:opacity-100"
            )}
          >
            <div className="shrink-0 mt-0.5">{getIcon(toast.type)}</div>
            <p className="text-sm text-foreground flex-1">{toast.message}</p>
            <button
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
