/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SigninForm({
  className,
  onSubmit,
  ...props
}: React.ComponentProps<"div"> & { onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void }) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={onSubmit} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Connexion administrateur</h1>
                <p className="text-balance text-muted-foreground">
                  Connectez-vous pour accéder au tableau de bord administrateur
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="admin@example.com" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input id="password" name="password" type="password" required />
              </div>

              <Button type="submit" className="w-full">
                Se connecter
              </Button>

              <div className="text-center text-sm">
                <a href="/signin" className="underline underline-offset-4">Retour</a>
              </div>
            </div>
          </form>

          <div className="relative hidden bg-muted md:block">
            <img
              src="favicon.ico"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>

      <div className="text-balance text-center text-xs text-muted-foreground">
        En vous connectant, vous acceptez nos <a href="#">Conditions d&apos;utilisation</a>.
      </div>
    </div>
  )
}

export default SigninForm
