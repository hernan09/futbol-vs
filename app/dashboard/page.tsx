"use client"

import { useState } from "react"
import DashboardTabs from "@/components/dashboard-tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { WifiOff } from "lucide-react"

export default function DashboardPage() {
  const [isOffline, setIsOffline] = useState(false)

  // Check if offline
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => setIsOffline(false))
    window.addEventListener('offline', () => setIsOffline(true))
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
