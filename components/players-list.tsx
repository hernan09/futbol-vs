"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import PlayerRatingForm from "@/components/player-rating-form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { getAllUsers } from "@/lib/data-service"
import type { User } from "@/lib/types"

export default function PlayersList() {
  const [players, setPlayers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlayer, setSelectedPlayer] = useState<User | null>(null)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    // Verificar estado de conexión
    setIsOffline(!navigator.onLine)

    const loadPlayers = async () => {
      try {
        const usersData = await getAllUsers()
        setPlayers(usersData)
      } catch (error) {
        console.error("Error loading players:", error)
        setError("Error al cargar jugadores. Intenta de nuevo más tarde.")
      } finally {
        setLoading(false)
      }
    }

    loadPlayers()

    // Monitorear cambios en la conexión
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleRatePlayer = (player: User) => {
    setSelectedPlayer(player)
    setOpen(true)
  }

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  if (loading) {
    return <div className="flex justify-center p-8">Cargando jugadores...</div>
  }

  if (error && !players.length) {
    return (
      <div className="flex justify-center p-8">
        <div className="rounded-lg bg-red-900 p-4 text-white">
          <p>{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4 bg-red-700 hover:bg-red-800">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-xl font-bold">Todos los Jugadores</h3>

      {isOffline && (
        <Alert className="bg-amber-900 border-amber-800 text-white">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Estás viendo datos almacenados localmente. Algunas actualizaciones podrían no estar disponibles.
          </AlertDescription>
        </Alert>
      )}

      {players.length === 0 ? (
        <div className="rounded-lg bg-slate-800 p-8 text-center">
          <p className="text-slate-400">No hay jugadores registrados aún.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {players.map((player) => (
            <Card key={player.id} className="bg-slate-800 text-white">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12 bg-emerald-600">
                    <AvatarFallback>{getInitials(player.username)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium">{player.username}</h4>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {player.ratings &&
                        Object.entries(player.ratings).map(([skill, rating]) => (
                          <span
                            key={skill}
                            className="inline-flex items-center rounded-full bg-slate-700 px-2 py-1 text-xs"
                          >
                            {skill}: {rating}★
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleRatePlayer(player)}
                  className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700"
                  size="sm"
                >
                  Calificar Jugador
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Calificar a {selectedPlayer?.username}</DialogTitle>
          </DialogHeader>
          {selectedPlayer && <PlayerRatingForm player={selectedPlayer} onComplete={() => setOpen(false)} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
