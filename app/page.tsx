"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, restoreSession } = useAuth()

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  useEffect(() => {
    if (isLoading) return
    
    if (isAuthenticated) {
      router.push("/dashboard")
    } else {
      router.push("/signin")
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Redirection en cours…</p>
    </div>
  )
}