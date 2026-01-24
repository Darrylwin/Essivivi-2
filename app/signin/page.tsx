"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SigninForm } from "@/components/signin-form"
import { useAuth } from "@/lib/hooks"
import { toast } from "sonner"

export default function SigninPage() {
  const router = useRouter()
  const { isAuthenticated, isRestored, restoreSession, login } = useAuth()

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  useEffect(() => {
    if (isRestored && isAuthenticated) {
      router.push("/dashboard/overview")
    }
  }, [isRestored, isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get("email") || "")
    const password = String(fd.get("password") || "")

    try {
      await login({ email, password })
      router.push("/dashboard/overview")
    } catch (err) {
      // simple error handling; replace with nicer UI if desired
      console.error(err)
      // requires: import { toast } from "react-hot-toast"
      toast.error("Échec de la connexion. Vérifiez vos identifiants.")
    }
  }

  return (
    <div className="w-full max-w-sm md:max-w-3xl">
      <SigninForm onSubmit={(e) => { void handleSubmit(e as React.FormEvent<HTMLFormElement>) }} />
    </div>
  )
}
