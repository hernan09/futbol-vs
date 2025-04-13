"use client"

import { useState, useEffect } from "react"
import { auth } from "@/lib/firebase-config"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wifi, WifiOff, Pencil } from "lucide-react"
import { UserData, getAllUsers, updateUserStats, updateUserAlias, createUserProfile } from "@/lib/firestore"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function UsersList() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOffline, setIsOffline] = useState(false)
  const [editingAlias, setEditingAlias] = useState<{ [key: string]: boolean }>({})
  const [newAlias, setNewAlias] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const currentUser = auth.currentUser
        if (!currentUser) {
          throw new Error("Usuario no autenticado")
        }

        const result = await getAllUsers()
        if (result.length === 0) {
          // Si no hay usuarios, creamos uno para el usuario actual
          const userData: UserData = {
            id: currentUser.uid,
            email: currentUser.email || "",
            alias: currentUser.email || "",
            stats: {
              speed: 0,
              endurance: 0,
              technique: 0,
              strength: 0,
              agility: 0
            }
          }
          
          // Crear el perfil del usuario
          const createResult = await createUserProfile(currentUser.uid, currentUser.email || "")
          if (!createResult.success) {
            throw new Error("Error al crear el perfil de usuario")
          }
          
          setUsers([userData])
        } else {
          setUsers(result)
        }
      } catch (err: any) {
        console.error("Error loading users:", err)
        if (err.code === "unavailable") {
          setIsOffline(true)
        } else if (err.code === "permission-denied") {
          setError("No tienes permisos para acceder a los datos. Por favor, inicia sesión nuevamente.")
        } else if (err.message?.includes("Firestore no está habilitado")) {
          setError("Firestore no está habilitado. Por favor, habilita Firestore en la consola de Firebase.")
        } else if (err.message === "Usuario no autenticado") {
          setError("Debes iniciar sesión para ver los usuarios.")
        } else {
          setError("Error al cargar usuarios. Por favor, intenta más tarde.")
        }
      } finally {
        setLoading(false)
      }
    }

    loadUsers()

    const handleOnline = () => {
      setIsOffline(false)
      loadUsers()
    }
    const handleOffline = () => setIsOffline(true)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    setIsOffline(!navigator.onLine)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleRateUser = async (userId: string, stats: UserData["stats"]) => {
    try {
      const result = await updateUserStats(userId, stats)
      if (result.success) {
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId 
              ? { ...user, stats } 
              : user
          )
        )
      } else {
        setError("Error al guardar la calificación. Por favor, intenta más tarde.")
      }
    } catch (err: any) {
      console.error("Error al calificar usuario:", err)
      if (err.code === "permission-denied") {
        setError("No tienes permisos para calificar usuarios. Por favor, inicia sesión nuevamente.")
      } else {
        setError("Error al guardar la calificación. Por favor, intenta más tarde.")
      }
    }
  }

  const handleEditAlias = (userId: string) => {
    setEditingAlias(prev => ({ ...prev, [userId]: true }))
    setNewAlias(prev => ({ ...prev, [userId]: users.find(u => u.id === userId)?.alias || "" }))
  }

  const handleSaveAlias = async (userId: string) => {
    try {
      const result = await updateUserAlias(userId, newAlias[userId])
      if (result.success) {
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId 
              ? { ...user, alias: newAlias[userId] } 
              : user
          )
        )
        setEditingAlias(prev => ({ ...prev, [userId]: false }))
      } else {
        setError("Error al guardar el alias. Por favor, intenta más tarde.")
      }
    } catch (err: any) {
      console.error("Error al guardar alias:", err)
      if (err.code === "permission-denied") {
        setError("No tienes permisos para modificar el alias. Por favor, inicia sesión nuevamente.")
      } else {
        setError("Error al guardar el alias. Por favor, intenta más tarde.")
      }
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-white">Cargando usuarios...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {isOffline && (
        <Alert className="bg-amber-900 border-amber-800 text-white">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            Estás en modo offline. Los datos se mostrarán desde la caché local y se sincronizarán cuando se restablezca la conexión.
          </AlertDescription>
        </Alert>
      )}

      {!isOffline && (
        <Alert className="bg-emerald-900 border-emerald-800 text-white">
          <Wifi className="h-4 w-4" />
          <AlertDescription>
            Puedes calificar a otros usuarios en las diferentes categorías. Las calificaciones serán visibles para todos.
          </AlertDescription>
        </Alert>
      )}

      {error && !isOffline && (
        <Alert variant="destructive" className="bg-red-900 border-red-800 text-white">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {users.length === 0 ? (
          <div className="col-span-full text-center text-white">
            <p>No hay usuarios registrados aún.</p>
          </div>
        ) : (
          users.map((user) => (
            <Card key={user.id} className="border-slate-700 bg-slate-800 text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  {editingAlias[user.id] ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={newAlias[user.id] || ""}
                        onChange={(e) => setNewAlias(prev => ({ ...prev, [user.id]: e.target.value }))}
                        className="bg-slate-700 text-white"
                      />
                      <Button 
                        onClick={() => handleSaveAlias(user.id)}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        Guardar
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CardTitle>{user.alias}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditAlias(user.id)}
                        className="text-slate-400 hover:text-white"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <CardDescription className="text-slate-400">{user.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Velocidad</label>
                    <Slider
                      defaultValue={[user.stats.speed]}
                      max={100}
                      step={1}
                      onValueChange={(value) => {
                        const newStats = {
                          ...user.stats,
                          speed: value[0]
                        }
                        handleRateUser(user.id, newStats)
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Resistencia</label>
                    <Slider
                      defaultValue={[user.stats.endurance]}
                      max={100}
                      step={1}
                      onValueChange={(value) => {
                        const newStats = {
                          ...user.stats,
                          endurance: value[0]
                        }
                        handleRateUser(user.id, newStats)
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Técnica</label>
                    <Slider
                      defaultValue={[user.stats.technique]}
                      max={100}
                      step={1}
                      onValueChange={(value) => {
                        const newStats = {
                          ...user.stats,
                          technique: value[0]
                        }
                        handleRateUser(user.id, newStats)
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Fuerza</label>
                    <Slider
                      defaultValue={[user.stats.strength]}
                      max={100}
                      step={1}
                      onValueChange={(value) => {
                        const newStats = {
                          ...user.stats,
                          strength: value[0]
                        }
                        handleRateUser(user.id, newStats)
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Agilidad</label>
                    <Slider
                      defaultValue={[user.stats.agility]}
                      max={100}
                      step={1}
                      onValueChange={(value) => {
                        const newStats = {
                          ...user.stats,
                          agility: value[0]
                        }
                        handleRateUser(user.id, newStats)
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 