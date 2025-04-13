"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAllTeams, getAllUsers } from "@/lib/data-service"
import type { Team, User } from "@/lib/types"
import { Trophy, Users } from "lucide-react"

export default function TeamCompetition() {
  const [teams, setTeams] = useState<Team[]>([])
  const [users, setUsers] = useState<Record<string, User>>({})
  const [loading, setLoading] = useState(true)
  const [selectedTeams, setSelectedTeams] = useState<Team[]>([])
  const [results, setResults] = useState<{
    winner: Team | null
    scores: Record<string, number>
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar equipos y usuarios
        const [teamsData, usersData] = await Promise.all([getAllTeams(), getAllUsers()])

        setTeams(teamsData)

        // Convertir array de usuarios a un mapa para búsqueda más fácil
        const usersMap: Record<string, User> = {}
        usersData.forEach((user) => {
          usersMap[user.id] = user
        })
        setUsers(usersMap)
      } catch (error) {
        console.error("Error loading data:", error)
        setError("Error al cargar datos. Intenta de nuevo más tarde.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleSelectTeam = (team: Team) => {
    if (selectedTeams.some((t) => t.id === team.id)) {
      setSelectedTeams(selectedTeams.filter((t) => t.id !== team.id))
    } else if (selectedTeams.length < 2) {
      setSelectedTeams([...selectedTeams, team])
    }
  }

  const calculateTeamScore = (team: Team) => {
    let totalScore = 0
    let playerCount = 0

    team.players.forEach((playerId) => {
      const player = users[playerId]
      if (player && player.ratings) {
        const playerAverage =
          Object.values(player.ratings).reduce((sum, rating) => sum + rating, 0) / Object.values(player.ratings).length
        totalScore += playerAverage
        playerCount++
      }
    })

    // Añadir algo de aleatoriedad para hacerlo más interesante
    const randomFactor = 0.8 + Math.random() * 0.4 // Factor aleatorio entre 0.8 y 1.2

    return playerCount > 0 ? (totalScore / playerCount) * randomFactor : 0
  }

  const simulateMatch = () => {
    if (selectedTeams.length !== 2) return

    const scores: Record<string, number> = {}

    selectedTeams.forEach((team) => {
      scores[team.id] = calculateTeamScore(team)
    })

    const winner = scores[selectedTeams[0].id] > scores[selectedTeams[1].id] ? selectedTeams[0] : selectedTeams[1]

    setResults({ winner, scores })
  }

  const getTeamPlayers = (team: Team) => {
    return team.players.map((playerId) => users[playerId]?.username || "Jugador Desconocido").join(", ")
  }

  if (loading) {
    return <div className="flex justify-center p-8">Cargando equipos...</div>
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

  if (teams.length < 2) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4 text-lg">Necesitas al menos dos equipos para simular una competencia.</p>
        <p>Ve a la pestaña "Team Builder" para crear equipos primero.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        {teams.map((team) => (
          <Card
            key={team.id}
            className={`cursor-pointer transition-colors ${
              selectedTeams.some((t) => t.id === team.id)
                ? "border-emerald-500 bg-slate-700 text-white"
                : "bg-slate-800 text-white hover:bg-slate-700"
            }`}
            onClick={() => handleSelectTeam(team)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">{team.name}</h3>
                  <div className="mt-1 flex items-center text-sm text-slate-300">
                    <Users className="mr-1 h-4 w-4" />
                    <span>{team.players.length} jugadores</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{getTeamPlayers(team)}</p>
                </div>
                {selectedTeams.some((t) => t.id === team.id) && (
                  <div className="rounded-full bg-emerald-600 p-2">
                    <span className="text-xs font-bold">Seleccionado</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={simulateMatch}
          disabled={selectedTeams.length !== 2}
          className="bg-emerald-600 hover:bg-emerald-700"
          size="lg"
        >
          <Trophy className="mr-2 h-5 w-5" />
          Simular Partido
        </Button>
      </div>

      {results && (
        <Card className="border-emerald-500 bg-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-center">Resultados del Partido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 items-center gap-4 text-center">
                <div>
                  <h3 className="text-lg font-bold">{selectedTeams[0].name}</h3>
                  <p className="text-2xl font-bold">{results.scores[selectedTeams[0].id].toFixed(1)}</p>
                </div>
                <div className="text-xl font-bold">vs</div>
                <div>
                  <h3 className="text-lg font-bold">{selectedTeams[1].name}</h3>
                  <p className="text-2xl font-bold">{results.scores[selectedTeams[1].id].toFixed(1)}</p>
                </div>
              </div>

              <div className="rounded-lg bg-emerald-900 p-4 text-center">
                <h3 className="text-lg font-bold">Ganador</h3>
                <div className="mt-2 flex items-center justify-center space-x-2">
                  <Trophy className="h-6 w-6 text-yellow-400" />
                  <span className="text-xl font-bold">{results.winner?.name}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
