"use client"

import { useState, useEffect } from "react"
import { UserData } from "@/lib/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trophy, Users, GripHorizontal, Info } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core"

// Componentes draggable y droppable
function DraggablePlayer({ id, children }: { id: string, children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
  });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className="cursor-grab"
    >
      {children}
    </div>
  );
}

function DroppableArea({ id, children, className }: { id: string, children: React.ReactNode, className?: string }) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });
  
  return (
    <div 
      ref={setNodeRef} 
      className={`${className} ${isOver ? 'ring-2 ring-emerald-500 ring-opacity-50 bg-slate-700/30' : ''}`}
    >
      {children}
    </div>
  );
}

export default function TeamBuilder() {
  const { toast } = useToast()
  const [users, setUsers] = useState<UserData[]>([])
  const [selectedUsers, setSelectedUsers] = useState<{[key: string]: boolean}>({})
  const [teamAPlayers, setTeamAPlayers] = useState<UserData[]>([])
  const [teamBPlayers, setTeamBPlayers] = useState<UserData[]>([])
  const [winner, setWinner] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [teamAName, setTeamAName] = useState("Equipo A")
  const [teamBName, setTeamBName] = useState("Equipo B")
  const [teamMode, setTeamMode] = useState<"auto" | "manual">("auto")
  const [draggingPlayerId, setDraggingPlayerId] = useState<string | null>(null)

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  )

  useEffect(() => {
    // Load users from localStorage
    try {
      const usersJSON = localStorage.getItem('team-builder-users')
      if (usersJSON) {
        const parsedUsers = JSON.parse(usersJSON)
        setUsers(parsedUsers)
      }
    } catch (err) {
      console.error("Error loading users:", err)
      setError("Error al cargar usuarios desde el almacenamiento local.")
    }
  }, [])

  const handleSelectUser = (userId: string, checked: boolean) => {
    setSelectedUsers(prev => ({ ...prev, [userId]: checked }))
  }

  const addPlayerToTeam = (user: UserData, team: "A" | "B") => {
    if (team === "A") {
      if (teamAPlayers.length >= 5) {
        toast({
          title: "Equipo completo",
          description: "Un equipo no puede tener más de 5 jugadores",
          variant: "destructive",
        })
        return
      }
      setTeamAPlayers(prev => [...prev, user])
    } else {
      if (teamBPlayers.length >= 5) {
        toast({
          title: "Equipo completo",
          description: "Un equipo no puede tener más de 5 jugadores",
          variant: "destructive",
        })
        return
      }
      setTeamBPlayers(prev => [...prev, user])
    }
  }

  const removePlayerFromTeam = (userId: string, team: "A" | "B") => {
    if (team === "A") {
      const player = teamAPlayers.find(p => p.id === userId)
      if (player) {
        setTeamAPlayers(prev => prev.filter(p => p.id !== userId))
      }
    } else {
      const player = teamBPlayers.find(p => p.id === userId)
      if (player) {
        setTeamBPlayers(prev => prev.filter(p => p.id !== userId))
      }
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setDraggingPlayerId(active.id as string)
  }
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over) {
      // Si no hay "over", significa que se soltó fuera de una zona válida
      // Vamos a eliminar el jugador del equipo original
      const playerId = active.id as string;
      
      // Buscar en equipo A y eliminar
      const playerInTeamA = teamAPlayers.find(user => user.id === playerId);
      if (playerInTeamA) {
        removePlayerFromTeam(playerId, "A");
        toast({
          title: "Jugador eliminado",
          description: `${playerInTeamA.alias} ha sido removido del ${teamAName}`,
        });
        setDraggingPlayerId(null);
        return;
      }
      
      // Buscar en equipo B y eliminar
      const playerInTeamB = teamBPlayers.find(user => user.id === playerId);
      if (playerInTeamB) {
        removePlayerFromTeam(playerId, "B");
        toast({
          title: "Jugador eliminado",
          description: `${playerInTeamB.alias} ha sido removido del ${teamBName}`,
        });
        setDraggingPlayerId(null);
        return;
      }
      
      setDraggingPlayerId(null);
      return;
    }
    
    const playerId = active.id as string;
    
    // Primero, encontramos al jugador que se está arrastrando
    let playerToMove: UserData | undefined;
    
    // Buscar en usuarios disponibles
    playerToMove = users.find(user => user.id === playerId);
    
    // Buscar en equipo A
    if (!playerToMove) {
      playerToMove = teamAPlayers.find(user => user.id === playerId);
      if (playerToMove) {
        // Remover del equipo A
        removePlayerFromTeam(playerId, "A");
      }
    }
    
    // Buscar en equipo B
    if (!playerToMove) {
      playerToMove = teamBPlayers.find(user => user.id === playerId);
      if (playerToMove) {
        // Remover del equipo B
        removePlayerFromTeam(playerId, "B");
      }
    }
    
    if (playerToMove) {
      // Verificar si el jugador ya está en algún equipo
      const isInTeamA = teamAPlayers.some(p => p.id === playerId);
      const isInTeamB = teamBPlayers.some(p => p.id === playerId);
      
      // Agregar al equipo según la zona de destino
      if (over.id === "team-a-dropzone") {
        // Verificar que no esté ya en el equipo A
        if (!isInTeamA) {
          addPlayerToTeam(playerToMove, "A");
        }
      } else if (over.id === "team-b-dropzone") {
        // Verificar que no esté ya en el equipo B
        if (!isInTeamB) {
          addPlayerToTeam(playerToMove, "B");
        }
      }
    }
    
    setDraggingPlayerId(null);
  }

  const createTeamsAuto = () => {
    // Get selected users
    const selectedUsersList = users.filter(user => selectedUsers[user.id])
    
    // Validate team size
    if (selectedUsersList.length < 4) {
      setError("Debes seleccionar al menos 4 jugadores para crear dos equipos balanceados (2 por equipo).")
      return
    }
    
    if (selectedUsersList.length > 10) {
      setError("No puedes seleccionar más de 10 jugadores (máximo 5 por equipo).")
      return
    }

    // Reset previous results
    setWinner(null)
    setError(null)

    // Sort users by overall rating to create balanced teams
    const sortedUsers = [...selectedUsersList].sort((a, b) => {
      const overallA = calculateOverallRating(a.stats)
      const overallB = calculateOverallRating(b.stats)
      return overallB - overallA
    })

    // Create balanced teams (alternating selection - like in school)
    const teamA: UserData[] = []
    const teamB: UserData[] = []

    // Ensure even distribution
    const maxPerTeam = Math.min(5, Math.ceil(sortedUsers.length / 2))
    
    sortedUsers.forEach((user, index) => {
      if (index % 2 === 0 && teamA.length < maxPerTeam) {
        teamA.push(user)
      } else if (teamB.length < maxPerTeam) {
        teamB.push(user)
      } else {
        teamA.push(user)
      }
    })

    setTeamAPlayers(teamA)
    setTeamBPlayers(teamB)
    setSelectedUsers({})

    toast({
      title: "Equipos creados",
      description: "Los equipos han sido creados automáticamente y balanceados",
    })
  }

  const createTeams = () => {
    if (teamMode === "auto") {
      createTeamsAuto()
    } else {
      // For manual mode, we just reset the simulation
      setWinner(null)
      setError(null)
    }
  }

  const simulateMatch = () => {
    // Validate team sizes
    if (teamAPlayers.length < 2 || teamAPlayers.length > 5) {
      setError(`${teamAName} debe tener entre 2 y 5 jugadores.`)
      return
    }

    if (teamBPlayers.length < 2 || teamBPlayers.length > 5) {
      setError(`${teamBName} debe tener entre 2 y 5 jugadores.`)
      return
    }

    // Calculate team ratings
    const teamARating = teamAPlayers.reduce((sum, user) => 
      sum + calculateOverallRating(user.stats), 0) / teamAPlayers.length
    
    const teamBRating = teamBPlayers.reduce((sum, user) => 
      sum + calculateOverallRating(user.stats), 0) / teamBPlayers.length

    // Add some randomness, but weight it based on team size differences
    const sizeBonus = (teamAPlayers.length - teamBPlayers.length) * 2 // 2 points per extra player
    const randomFactor = Math.random() * 10 - 5 // -5 to +5
    
    // Determine winner (include size bonus for smaller teams to make it fair)
    if (teamARating + randomFactor > teamBRating + sizeBonus) {
      setWinner(teamAName)
    } else {
      setWinner(teamBName)
    }

    toast({
      title: "Simulación completada",
      description: `Ratings: ${teamAName}: ${teamARating.toFixed(1)} vs ${teamBName}: ${teamBRating.toFixed(1)}. El ganador es: ${teamARating + randomFactor > teamBRating + sizeBonus ? teamAName : teamBName}`,
    })
  }

  const resetTeams = () => {
    setTeamAPlayers([])
    setTeamBPlayers([])
    setWinner(null)
    setSelectedUsers({})
  }

  const calculateOverallRating = (stats: UserData["stats"]) => {
    // Calcular el promedio de las estadísticas en escala 1-5
    const average = (stats.speed + stats.endurance + stats.technique + stats.strength + stats.agility) / 5;
    // Redondear a 1 decimal
    return Math.round(average * 10) / 10;
  }

  // Filter out players that are already in teams
  const availablePlayers = users.filter(user => 
    !teamAPlayers.some(p => p.id === user.id) && 
    !teamBPlayers.some(p => p.id === user.id)
  )

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive" className="bg-red-900 border-red-800 text-white">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Alert className="bg-blue-900 border-blue-800 text-white mb-4">
        <Info className="h-4 w-4 mr-2" />
        <AlertDescription>
          Cada equipo debe tener entre 2 y 5 jugadores para poder simular un partido.
          {teamMode === "manual" && " Arrastra y suelta los jugadores en los equipos."}
        </AlertDescription>
      </Alert>

      <Card className="border-slate-700 bg-slate-800 text-white">
        <CardHeader>
          <CardTitle>Creador de Equipos</CardTitle>
          <CardDescription className="text-slate-400">
            Configura equipos con 2 a 5 jugadores para simular partidos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-slate-300 mb-1 block">Nombre Equipo A</label>
              <Input
                value={teamAName}
                onChange={(e) => setTeamAName(e.target.value)}
                className="bg-slate-700 text-white border-slate-600"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-slate-300 mb-1 block">Nombre Equipo B</label>
              <Input
                value={teamBName}
                onChange={(e) => setTeamBName(e.target.value)}
                className="bg-slate-700 text-white border-slate-600"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-slate-300 mb-1 block">Modo de Equipo</label>
              <Select 
                value={teamMode} 
                onValueChange={(value: "auto" | "manual") => setTeamMode(value)}
              >
                <SelectTrigger className="bg-slate-700 text-white border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 text-white border-slate-700">
                  <SelectItem value="auto">Automático (balanceado)</SelectItem>
                  <SelectItem value="manual">Manual (arrastrar y soltar)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {teamMode === "manual" && (
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="pt-4">
                <h3 className="font-medium text-slate-300 mb-2">Jugadores Disponibles</h3>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {availablePlayers.map(user => (
                    <DraggablePlayer key={user.id} id={user.id}>
                      <div className="flex items-center justify-between p-2 rounded-md bg-slate-700">
                        <div className="flex items-center">
                          <GripHorizontal className="h-4 w-4 mr-2 text-slate-500" />
                          <span className="text-sm">{user.alias} - {Math.round(calculateOverallRating(user.stats))}</span>
                        </div>
                      </div>
                    </DraggablePlayer>
                  ))}
                </div>
                
                <div className="mt-2 mb-4">
                  <p className="text-xs text-slate-400 text-center">
                    Tip: Arrastra jugadores fuera de los equipos para eliminarlos
                  </p>
                </div>
                
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-center font-medium text-slate-300 mb-2">
                      {teamAName} ({teamAPlayers.length}/5)
                    </h3>
                    <DroppableArea 
                      id="team-a-dropzone"
                      className={`min-h-[150px] rounded-md border-2 border-dashed p-2 ${
                        teamAPlayers.length >= 5 
                          ? "border-red-600" 
                          : "border-blue-600"
                      } ${
                        teamAPlayers.length === 0 
                          ? "flex items-center justify-center" 
                          : "space-y-2"
                      }`}
                    >
                      {teamAPlayers.length === 0 ? (
                        <p className="text-sm text-slate-400">Arrastra jugadores aquí</p>
                      ) : (
                        teamAPlayers.map(user => (
                          <DraggablePlayer key={user.id} id={user.id}>
                            <div className="flex items-center justify-between p-2 rounded-md bg-blue-900/40">
                              <div className="flex items-center">
                                <GripHorizontal className="h-4 w-4 mr-2 text-blue-400" />
                                <span className="text-sm">{user.alias}</span>
                              </div>
                              <span className="text-sm text-blue-300">{Math.round(calculateOverallRating(user.stats))}</span>
                            </div>
                          </DraggablePlayer>
                        ))
                      )}
                    </DroppableArea>
                  </div>
                  
                  <div>
                    <h3 className="text-center font-medium text-slate-300 mb-2">
                      {teamBName} ({teamBPlayers.length}/5)
                    </h3>
                    <DroppableArea 
                      id="team-b-dropzone"
                      className={`min-h-[150px] rounded-md border-2 border-dashed p-2 ${
                        teamBPlayers.length >= 5 
                          ? "border-red-600" 
                          : "border-red-400"
                      } ${
                        teamBPlayers.length === 0 
                          ? "flex items-center justify-center" 
                          : "space-y-2"
                      }`}
                    >
                      {teamBPlayers.length === 0 ? (
                        <p className="text-sm text-slate-400">Arrastra jugadores aquí</p>
                      ) : (
                        teamBPlayers.map(user => (
                          <DraggablePlayer key={user.id} id={user.id}>
                            <div className="flex items-center justify-between p-2 rounded-md bg-red-900/40">
                              <div className="flex items-center">
                                <GripHorizontal className="h-4 w-4 mr-2 text-red-400" />
                                <span className="text-sm">{user.alias}</span>
                              </div>
                              <span className="text-sm text-red-300">{Math.round(calculateOverallRating(user.stats))}</span>
                            </div>
                          </DraggablePlayer>
                        ))
                      )}
                    </DroppableArea>
                  </div>
                </div>
              </div>
            </DndContext>
          )}
          
          {teamMode === "auto" && (
            <div className="pt-4">
              <h3 className="font-medium text-slate-300 mb-2">Seleccionar Jugadores</h3>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {users.map(user => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`user-${user.id}`} 
                      checked={selectedUsers[user.id] || false}
                      onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                    />
                    <label
                      htmlFor={`user-${user.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {user.alias} - Rating: {Math.round(calculateOverallRating(user.stats))}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button 
            onClick={createTeams}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            disabled={teamMode === "auto" && Object.values(selectedUsers).filter(Boolean).length < 4}
          >
            <Users className="mr-2 h-4 w-4" />
            {teamMode === "auto" ? "Crear Equipos Automáticamente" : "Reiniciar Equipos"}
          </Button>
          
          <Button 
            onClick={resetTeams}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Reiniciar
          </Button>
        </CardFooter>
      </Card>

      {(teamMode === "auto" && (teamAPlayers.length > 0 || teamBPlayers.length > 0)) && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-slate-700 bg-slate-800 text-white">
            <CardHeader className={`${teamAPlayers.length >= 2 && teamAPlayers.length <= 5 ? "bg-blue-900/50" : "bg-slate-700"}`}>
              <CardTitle className="flex justify-between">
                <span>{teamAName}</span>
                <span className="text-sm font-normal">{teamAPlayers.length}/5 jugadores</span>
              </CardTitle>
              <CardDescription className="text-blue-200">
                Rating: {teamAPlayers.length > 0 ? Math.round(teamAPlayers.reduce((sum, user) => sum + calculateOverallRating(user.stats), 0) / teamAPlayers.length) : 0}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {teamAPlayers.length === 0 ? (
                <div className="text-center py-4 text-slate-400">
                  No hay jugadores asignados
                </div>
              ) : (
                <ul className="space-y-2">
                  {teamAPlayers.map(user => (
                    <li key={user.id} className="flex justify-between items-center">
                      <span>{user.alias}</span>
                      <span className="text-blue-300">{Math.round(calculateOverallRating(user.stats))}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800 text-white">
            <CardHeader className={`${teamBPlayers.length >= 2 && teamBPlayers.length <= 5 ? "bg-red-900/50" : "bg-slate-700"}`}>
              <CardTitle className="flex justify-between">
                <span>{teamBName}</span>
                <span className="text-sm font-normal">{teamBPlayers.length}/5 jugadores</span>
              </CardTitle>
              <CardDescription className="text-red-200">
                Rating: {teamBPlayers.length > 0 ? Math.round(teamBPlayers.reduce((sum, user) => sum + calculateOverallRating(user.stats), 0) / teamBPlayers.length) : 0}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {teamBPlayers.length === 0 ? (
                <div className="text-center py-4 text-slate-400">
                  No hay jugadores asignados
                </div>
              ) : (
                <ul className="space-y-2">
                  {teamBPlayers.map(user => (
                    <li key={user.id} className="flex justify-between items-center">
                      <span>{user.alias}</span>
                      <span className="text-red-300">{Math.round(calculateOverallRating(user.stats))}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div>
        <Card className="border-slate-700 bg-slate-800 text-white">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Button 
                onClick={simulateMatch}
                className="bg-amber-600 hover:bg-amber-700"
                size="lg"
                disabled={
                  teamAPlayers.length < 2 || teamAPlayers.length > 5 || 
                  teamBPlayers.length < 2 || teamBPlayers.length > 5
                }
              >
                <Trophy className="mr-2 h-5 w-5" />
                Simular Partido
              </Button>
              
              {winner && (
                <Alert className="mt-4 bg-emerald-900 border-emerald-800 text-white">
                  <Trophy className="h-4 w-4 mr-2" />
                  <AlertDescription>
                    <span className="font-bold">¡Ganador: {winner}!</span> Basado en las habilidades de los jugadores,
                    {winner === teamAName ? ` ${teamAName}` : ` ${teamBName}`} tiene más probabilidades de ganar.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
