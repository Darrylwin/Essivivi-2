"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isRestored, restoreSession } = useAuth()

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  useEffect(() => {
    if (!isRestored) return
    if (isAuthenticated) router.push("/dashboard")
    else router.push("/signin")
  }, [isRestored, isAuthenticated, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Redirection en cours…</p>
    </div>
  )
}
