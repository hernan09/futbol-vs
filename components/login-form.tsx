"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { signIn } from "@/app/actions"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await signIn(email, password)
      
      if (result.error) {
        // Manejar diferentes tipos de errores de Firebase
        let errorMessage = "Error al iniciar sesión"
        if (typeof result.error === 'object' && result.error.code) {
          switch (result.error.code) {
            case "auth/invalid-credential":
              errorMessage = "Credenciales inválidas. Por favor, verifica tu email y contraseña."
              break
            case "auth/invalid-email":
              errorMessage = "El correo electrónico no es válido"
              break
            case "auth/user-disabled":
              errorMessage = "Esta cuenta ha sido deshabilitada"
              break
            case "auth/user-not-found":
              errorMessage = "No se encontró una cuenta con este correo electrónico"
              break
            case "auth/wrong-password":
              errorMessage = "Contraseña incorrecta"
              break
            default:
              errorMessage = result.error.message || "Error de autenticación"
          }
        } else if (typeof result.error === 'string') {
          errorMessage = result.error
        }
        setError(errorMessage)
        return
      }

      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white">Iniciar Sesión</h2>
        <p className="mt-2 text-sm text-slate-400">
          Ingresa tus credenciales para acceder al dashboard
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 bg-slate-800 text-white border-slate-700"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-white">
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 bg-slate-800 text-white border-slate-700"
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="bg-red-900 border-red-800 text-white">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          disabled={isLoading}
        >
          {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </Button>
      </form>
    </div>
  )
}
