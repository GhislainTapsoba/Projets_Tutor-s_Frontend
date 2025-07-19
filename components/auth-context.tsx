"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import Cookies from "js-cookie"
import { apiFetch } from "@/lib/api"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface User {
  id: number
  name: string
  email: string
  role: "admin" | "agent" | "client" // Assuming roles are defined like this
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, user: User) => void
  logout: () => void
  fetchUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedToken = Cookies.get("authToken")
    if (storedToken) {
      setToken(storedToken)
      fetchUser(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchUser = async (authToken?: string) => {
    setIsLoading(true)
    try {
      const userData = await apiFetch<User>("/user", { token: authToken || token })
      setUser(userData)
    } catch (error) {
      console.error("Failed to fetch user:", error)
      logout() // Clear invalid token
    } finally {
      setIsLoading(false)
    }
  }

  const login = (newToken: string, newUser: User) => {
    Cookies.set("authToken", newToken, { expires: 7 }) // Store for 7 days
    setToken(newToken)
    setUser(newUser)
    toast({
      title: "Login Successful",
      description: `Welcome, ${newUser.name}!`,
    })
    // Redirect based on role
    if (newUser.role === "admin") {
      router.push("/dashboard/admin")
    } else if (newUser.role === "agent") {
      router.push("/dashboard/agent/tickets")
    } else {
      router.push("/dashboard") // Default for other roles or clients
    }
  }

  const logout = async () => {
    if (token) {
      try {
        await apiFetch("/auth/logout", { method: "POST", token })
      } catch (error) {
        console.error("Logout failed on server:", error)
        toast({
          title: "Logout Error",
          description: "Could not log out from server, but local session cleared.",
          variant: "destructive",
        })
      }
    }
    Cookies.remove("authToken")
    setToken(null)
    setUser(null)
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
    router.push("/auth/login")
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
