"use client"

import { useState, useEffect } from "react"
import { collection, query, onSnapshot, doc, updateDoc, getDoc, enableIndexedDbPersistence } from "firebase/firestore"
import { db, auth } from "@/lib/firebase-config"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, Wifi, WifiOff } from "lucide-react"

interface UserStats {
  velocidad: number
  resistencia: number
  tecnica: number
  fuerza: number
  agilidad: number
}

interface User {
  id: string
  email: string
  username: string
  stats?: UserStats
  ratedBy?: {
    [userId: string]: UserStats
  }
}

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    // Monitorear el estado de la conexión
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    setIsOffline(!navigator.onLine)

    const q = query(collection(db, "users"))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const usersList: User[] = []
        snapshot.forEach((doc) => {
          usersList.push({ id: doc.id, ...doc.data() } as User)
        })
        setUsers(usersList)
        setLoading(false)
      },
      (err) => {
        console.error("Error fetching users:", err)
        if (err.code === 'unavailable') {
          setError("No se pudo conectar a Firestore. Los datos se mostrarán desde la caché local.")
          setIsOffline(true)
        } else {
          setError("Error al cargar los usuarios")
        }
        setLoading(false)
      }
    )

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      unsubscribe()
    }
  }, [])

  const handleRateUser = async (userId: string, stats: UserStats) => {
    try {
      const userDoc = doc(db, "users", userId)
      const userSnapshot = await getDoc(userDoc)
      
      if (!userSnapshot.exists()) {
        throw new Error("Usuario no encontrado")
      }

      const currentData = userSnapshot.data()
      const currentUser = auth.currentUser

      if (!currentUser) {
        throw new Error("Usuario no autenticado")
      }

      const updatedRatedBy = {
        ...currentData.ratedBy,
        [currentUser.uid]: stats
      }

      await updateDoc(userDoc, {
        ratedBy: updatedRatedBy
      })
    } catch (err: any) {
      console.error("Error al calificar usuario:", err)
      if (err.code === 'unavailable') {
        setError("No se pudo guardar la calificación. Se intentará nuevamente cuando se restablezca la conexión.")
      } else {
        setError("Error al guardar la calificación")
      }
    }
  }

  if (loading) {
    return <div className="text-white">Cargando usuarios...</div>
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
        {users.map((user) => (
          <Card key={user.id} className="border-slate-700 bg-slate-800 text-white">
            <CardHeader>
              <CardTitle>{user.username}</CardTitle>
              <CardDescription className="text-slate-400">{user.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Velocidad</label>
                  <Slider
                    defaultValue={[user.stats?.velocidad || 0]}
                    max={100}
                    step={1}
                    onValueChange={(value) => {
                      const newStats = {
                        ...user.stats,
                        velocidad: value[0]
                      }
                      handleRateUser(user.id, newStats as UserStats)
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Resistencia</label>
                  <Slider
                    defaultValue={[user.stats?.resistencia || 0]}
                    max={100}
                    step={1}
                    onValueChange={(value) => {
                      const newStats = {
                        ...user.stats,
                        resistencia: value[0]
                      }
                      handleRateUser(user.id, newStats as UserStats)
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Técnica</label>
                  <Slider
                    defaultValue={[user.stats?.tecnica || 0]}
                    max={100}
                    step={1}
                    onValueChange={(value) => {
                      const newStats = {
                        ...user.stats,
                        tecnica: value[0]
                      }
                      handleRateUser(user.id, newStats as UserStats)
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Fuerza</label>
                  <Slider
                    defaultValue={[user.stats?.fuerza || 0]}
                    max={100}
                    step={1}
                    onValueChange={(value) => {
                      const newStats = {
                        ...user.stats,
                        fuerza: value[0]
                      }
                      handleRateUser(user.id, newStats as UserStats)
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Agilidad</label>
                  <Slider
                    defaultValue={[user.stats?.agilidad || 0]}
                    max={100}
                    step={1}
                    onValueChange={(value) => {
                      const newStats = {
                        ...user.stats,
                        agilidad: value[0]
                      }
                      handleRateUser(user.id, newStats as UserStats)
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 