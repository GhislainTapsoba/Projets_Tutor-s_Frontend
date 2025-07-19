"use client"

import { type ReactNode, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { useAuth } from "@/components/auth-context"
import { useRouter } from "next/navigation"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login")
    } else if (!isLoading && isAuthenticated && user) {
      // Optional: Redirect from /dashboard to specific role dashboard if user lands on generic /dashboard
      if (user.role === "admin" && window.location.pathname === "/dashboard") {
        router.replace("/dashboard/admin")
      } else if (user.role === "agent" && window.location.pathname === "/dashboard") {
        router.replace("/dashboard/agent/tickets")
      }
    }
  }, [isAuthenticated, isLoading, user, router])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return <DashboardShell>{children}</DashboardShell>
}
