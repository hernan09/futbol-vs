"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UsersList from "@/components/users-list"
import CreateUserCard from "@/components/create-user-card" 
import TeamBuilder from "@/components/team-builder"
import { Wifi, WifiOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DashboardTabs() {
  const [activeTab, setActiveTab] = useState("users")
  const [isOffline, setIsOffline] = useState(false)

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
      </div>

      {isOffline && (
        <Alert className="mb-4 bg-amber-900 border-amber-800 text-white">
          <AlertDescription>
            Estás en modo offline. Los datos se guardarán localmente y se sincronizarán cuando vuelvas a estar en línea.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800">
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="create">Crear Usuario</TabsTrigger>
          <TabsTrigger value="teams">Equipos</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <UsersList />
        </TabsContent>
        <TabsContent value="create">
          <CreateUserCard />
        </TabsContent>
        <TabsContent value="teams">
          <TeamBuilder />
        </TabsContent>
      </Tabs>
    </div>
  )
}
