"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Storage keys for localStorage persistence
const STORAGE_KEY = "voicegen_user"

interface UserState {
  email: string
  balance: number
  tier: "free" | "starter" | "pro"
  dailyUsed: number
  dailyLimit: number
  lastResetDate: string // ISO date string for daily reset tracking
}

interface UserContextType {
  user: UserState
  setUser: (user: UserState) => void
  useCharacters: (count: number) => boolean
  addBalance: (amount: number) => void
  getAvailableCharacters: () => number
  isLoading: boolean
}

const getDefaultUser = (): UserState => ({
  email: "user@example.com",
  balance: 2000,
  tier: "free",
  dailyUsed: 0,
  dailyLimit: 2000,
  lastResetDate: new Date().toISOString().split("T")[0],
})

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserState>(getDefaultUser())
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as UserState
        
        // Check if we need to reset daily usage (for free tier)
        const today = new Date().toISOString().split("T")[0]
        if (parsed.lastResetDate !== today && parsed.tier === "free") {
          parsed.dailyUsed = 0
          parsed.lastResetDate = today
        }
        
        setUserState(parsed)
      }
    } catch (error) {
      // If localStorage fails, use default
      console.error("Failed to load user from localStorage:", error)
    }
    setIsLoading(false)
  }, [])

  // Persist user to localStorage on changes
  const setUser = (newUser: UserState) => {
    setUserState(newUser)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
      // TODO: In production, sync with Supabase
      // await supabase.from('users').update({ balance: newUser.balance }).eq('email', newUser.email)
    } catch (error) {
      console.error("Failed to save user to localStorage:", error)
    }
  }

  const getAvailableCharacters = (): number => {
    if (user.tier === "free") {
      return user.dailyLimit - user.dailyUsed
    }
    return user.balance
  }

  const useCharacters = (count: number): boolean => {
    const available = getAvailableCharacters()
    
    if (count > available) return false

    if (user.tier === "free") {
      const newUser = { ...user, dailyUsed: user.dailyUsed + count }
      setUser(newUser)
    } else {
      const newUser = { ...user, balance: user.balance - count }
      setUser(newUser)
      // TODO: In production, call Supabase to deduct balance
      // await supabase.from('users').update({ balance: newUser.balance }).eq('email', user.email)
    }
    return true
  }

  const addBalance = (amount: number) => {
    const newUser = { ...user, balance: user.balance + amount }
    setUser(newUser)
    // TODO: In production, call Supabase to add balance
    // await supabase.from('users').update({ balance: newUser.balance }).eq('email', user.email)
  }

  return (
    <UserContext.Provider value={{ user, setUser, useCharacters, addBalance, getAvailableCharacters, isLoading }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
