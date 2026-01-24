export const metadata = {
  title: "Connexion",
}

export default function SigninLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-6 md:p-10">
      {children}
    </div>
  )
}
