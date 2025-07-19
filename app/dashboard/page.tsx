"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-context"

export default function DashboardHomePage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === "admin") {
        router.replace("/dashboard/admin")
      } else if (user.role === "agent") {
        router.replace("/dashboard/agent/tickets")
      } else {
        // Handle other roles or default to a generic page
        router.replace("/dashboard/client") // Example for client
      }
    } else if (!isLoading && !isAuthenticated) {
      router.replace("/auth/login")
    }
  }, [user, isLoading, isAuthenticated, router])

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-bold">Redirecting...</h1>
      <p className="text-gray-500 dark:text-gray-400">Please wait while we direct you to your dashboard.</p>
    </div>
  )
}
