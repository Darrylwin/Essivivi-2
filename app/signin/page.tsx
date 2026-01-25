"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SigninForm } from "@/components/signin-form"
import { useAuth } from "@/lib/hooks"
import { toast } from "sonner"

export default function SigninPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, login } = useAuth()

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, isLoading, router])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement | HTMLDivElement>) => {
    e.preventDefault()
    const form = e.currentTarget as HTMLElement
    const email = (form.querySelector('[name="email"]') as HTMLInputElement)?.value || ""
    const mot_de_passe = (form.querySelector('[name="password"]') as HTMLInputElement)?.value || ""

    ;(async () => {
      try {
        // Note: On utilise mot_de_passe, pas password
        await login({ email, mot_de_passe })
        router.push("/dashboard")
      } catch (err: unknown) {
        console.error("Login error:", err)
        const errorMessage = (err as { message?: string })?.message || "Échec de la connexion. Vérifiez vos identifiants."
        toast.error(errorMessage)
      }
    })()
  }

  // Si déjà authentifié, ne pas afficher le formulaire
  if (isLoading || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Chargement…</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm md:max-w-3xl">
      <SigninForm onSubmit={handleSubmit} />
    </div>
  )
}