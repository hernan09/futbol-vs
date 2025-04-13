"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Info } from "lucide-react"
import { signIn } from "@/lib/auth"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOffline, setIsOffline] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Monitorear el estado de la conexión
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    setIsOffline(!navigator.onLine)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isOffline) {
        throw new Error("No se puede autenticar en modo offline")
      }

      console.log("Attempting to authenticate with:", { email, isSignUp })
      
      const result = await signIn(email, password, isSignUp ? username : undefined)
      console.log("Authentication result:", result)

      if (!result) {
        throw new Error("Authentication failed - no session returned")
      }

      // Force a hard refresh to ensure the session is properly set
      window.location.href = "/dashboard"
    } catch (err: any) {
      console.error("Detailed authentication error:", err)
      let errorMessage = "Error de autenticación"
      
      if (err.code) {
        switch (err.code) {
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
          case "auth/email-already-in-use":
            errorMessage = "Este correo electrónico ya está registrado"
            break
          case "auth/weak-password":
            errorMessage = "La contraseña debe tener al menos 6 caracteres"
            break
          default:
            errorMessage = err.message || "Error de autenticación"
        }
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-slate-700 bg-slate-800 text-white">
      <CardHeader>
        <CardTitle>{isSignUp ? "Create Account" : "Login"}</CardTitle>
        <CardDescription className="text-slate-400">
          {isSignUp ? "Enter your details to create an account" : "Enter your credentials to login"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {isOffline && (
            <Alert className="bg-amber-900 border-amber-800 text-white">
              <Info className="h-4 w-4" />
              <AlertDescription>Estás en modo offline. No puedes autenticarte sin conexión.</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-300">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-slate-700 bg-slate-900 text-white"
              placeholder="ejemplo@email.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-300">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-slate-700 bg-slate-900 text-white"
              placeholder="••••••••"
            />
          </div>

          {isSignUp && (
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-slate-300">
                Username
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={isSignUp}
                className="border-slate-700 bg-slate-900 text-white"
                placeholder="Nombre de usuario"
              />
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="bg-red-900 border-red-800 text-white">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Login"}
          </Button>
          <Button
            type="button"
            variant="link"
            className="text-slate-400 hover:text-white"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
