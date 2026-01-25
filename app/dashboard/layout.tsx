"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useAuth } from "@/lib/hooks"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/signin")
    }
  }, [isAuthenticated, isLoading, router])

  // Afficher un loader pendant le chargement
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Chargement de la session…</p>
      </div>
    )
  }

  // Rediriger si non authentifié
  if (!isAuthenticated) {
    return null // Redirection gérée par useEffect
  }

  // Afficher le layout admin si authentifié
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}