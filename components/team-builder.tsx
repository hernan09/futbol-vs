"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getAllUsers, saveTeam } from "@/lib/data-service"
import type { User, Team } from "@/lib/types"
import { Plus, X, Save } from "lucide-react"

export default function TeamBuilder() {
  const [players, setPlayers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [teamName, setTeamName] = useState("")
  const [selectedPlayers, setSelectedPlayers] = useState<User[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
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
  }, [])

  const handleAddPlayer = (player: User) => {
    if (selectedPlayers.length >= 5) {
      setMessage({ type: "error", text: "Máximo 5 jugadores por equipo" })
      return
    }

    if (selectedPlayers.some((p) => p.id === player.id)) {
      setMessage({ type: "error", text: "Jugador ya añadido al equipo" })
      return
    }

    setSelectedPlayers([...selectedPlayers, player])
    setMessage(null)
  }

  const handleRemovePlayer = (playerId: string) => {
    setSelectedPlayers(selectedPlayers.filter((p) => p.id !== playerId))
  }

  const handleSaveTeam = async () => {
    if (selectedPlayers.length < 3) {
      setMessage({ type: "error", text: "El equipo debe tener al menos 3 jugadores" })
      return
    }

    if (!teamName.trim()) {
      setMessage({ type: "error", text: "Por favor ingresa un nombre para el equipo" })
      return
    }

    setSaving(true)

    try {
      const teamId = Date.now().toString()

      const team: Team = {
        id: teamId,
        name: teamName,
        players: selectedPlayers.map((p) => p.id),
        createdAt: new Date().toISOString(),
      }

      await saveTeam(team)

      setMessage({ type: "success", text: "¡Equipo guardado exitosamente!" })
      setTeamName("")
      setSelectedPlayers([])
    } catch (error) {
      console.error("Error saving team:", error)
      setMessage({ type: "error", text: "Error al guardar el equipo" })
    } finally {
      setSaving(false)
    }
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

  if (error) {
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
    <div className="grid gap-6 p-4 md:grid-cols-2">
      <Card className="bg-slate-800 text-white">
        <CardHeader>
          <CardTitle>Jugadores Disponibles</CardTitle>
        </CardHeader>
        <CardContent className="max-h-[500px] overflow-y-auto">
          {players.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center">
              <p className="text-slate-400">No hay jugadores disponibles.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between rounded-lg border border-slate-700 p-3"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8 bg-emerald-600">
                      <AvatarFallback>{getInitials(player.username)}</AvatarFallback>
                    </Avatar>
                    <span>{player.username}</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddPlayer(player)}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-800 text-white">
        <CardHeader>
          <CardTitle>Arma Tu Equipo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label htmlFor="teamName" className="mb-2 block text-sm font-medium">
                Nombre del Equipo
              </label>
              <Input
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Ingresa el nombre del equipo"
                className="border-slate-700 bg-slate-900 text-white"
              />
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium">Jugadores Seleccionados ({selectedPlayers.length}/5)</h3>
              {selectedPlayers.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-700 p-4 text-center text-slate-400">
                  Agrega jugadores a tu equipo
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between rounded-lg border border-slate-700 p-3"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8 bg-emerald-600">
                          <AvatarFallback>{getInitials(player.username)}</AvatarFallback>
                        </Avatar>
                        <span>{player.username}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemovePlayer(player.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {message && (
              <div
                className={`rounded-lg p-2 text-sm ${
                  message.type === "success" ? "bg-emerald-900 text-emerald-200" : "bg-red-900 text-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <Button
              onClick={handleSaveTeam}
              disabled={saving || selectedPlayers.length < 3 || !teamName.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Guardando..." : "Guardar Equipo"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
