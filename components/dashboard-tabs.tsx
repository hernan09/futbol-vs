"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UsersList from "@/components/users-list"
import UserProfile from "@/components/user-profile"
import { Button } from "@/components/ui/button"
import { LogOut, Wifi, WifiOff } from "lucide-react"
import { getAuth } from "firebase/auth"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DashboardTabs() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("users")
  const [isClient, setIsClient] = useState(false)
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Verificar si el usuario está autenticado
    const session = localStorage.getItem("session")
    if (!session) {
      router.push("/")
    }

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
  }, [router])

  const handleSignOut = async () => {
    try {
      const auth = getAuth()
      await auth.signOut()
      localStorage.removeItem("session")
      router.push("/")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  if (!isClient) {
    return <div>Cargando...</div>
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-semibold">Team Builder</h2>
          {isOffline ? (
            <WifiOff className="h-5 w-5 text-amber-500" />
          ) : (
            <Wifi className="h-5 w-5 text-emerald-500" />
          )}
        </div>
        <Button variant="destructive" size="sm" onClick={handleSignOut} className="bg-red-600 hover:bg-red-700">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>

      {isOffline && (
        <Alert className="mb-4 bg-amber-900 border-amber-800 text-white">
          <AlertDescription>
            Estás en modo offline. Los datos se guardarán localmente y se sincronizarán cuando vuelvas a estar en línea.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800">
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="profile">Mi Perfil</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <UsersList />
        </TabsContent>
        <TabsContent value="profile">
          <UserProfile />
        </TabsContent>
      </Tabs>
    </div>
  )
}
