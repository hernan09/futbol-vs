"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { cookies } from "next/headers"
import { auth } from "@/lib/firebase-config"
import { onAuthStateChanged } from "firebase/auth"
import DashboardTabs from "@/components/dashboard-tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { WifiOff } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/")
        return
      }

      try {
        // Verificar si Firestore está disponible
        const response = await fetch("https://firestore.googleapis.com/v1/projects/futbollogin/databases/(default)/documents")
        if (!response.ok) {
          throw new Error("Firestore no está habilitado")
        }
        
        setIsLoading(false)
      } catch (err) {
        console.error("Error checking Firestore:", err)
        if (err instanceof Error) {
          if (err.message.includes("offline")) {
            setIsOffline(true)
          } else if (err.message.includes("Firestore no está habilitado")) {
            setError("Firestore no está habilitado. Por favor, habilita Firestore en la consola de Firebase.")
          } else {
            setError("Error al conectar con la base de datos. Por favor, intenta más tarde.")
          }
        }
        setIsLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Alert className="bg-red-900 border-red-800 text-white max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isOffline) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Alert className="bg-amber-900 border-amber-800 text-white max-w-md">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            Estás en modo offline. Algunas funcionalidades pueden no estar disponibles.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <DashboardTabs />
    </div>
  )
}
