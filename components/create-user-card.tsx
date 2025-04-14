"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { UserData } from "@/lib/firestore"

export default function CreateUserCard() {
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [stats, setStats] = useState({
    speed: 3,
    endurance: 3,
    technique: 3,
    strength: 3,
    agility: 3
  })
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateUser = () => {
    if (!name.trim()) {
      setError("Por favor, ingresa un nombre para el usuario")
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      // Generate a unique ID
      const userId = 'user_' + Date.now().toString()
      
      // Create user object
      const newUser: UserData = {
        id: userId,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        alias: name,
        stats: stats
      }

      // Add to local storage
      const existingUsersJSON = localStorage.getItem('team-builder-users')
      const existingUsers = existingUsersJSON ? JSON.parse(existingUsersJSON) : []
      const updatedUsers = [...existingUsers, newUser]
      localStorage.setItem('team-builder-users', JSON.stringify(updatedUsers))

      // Reset form
      setName("")
      setStats({
        speed: 3,
        endurance: 3,
        technique: 3,
        strength: 3,
        agility: 3
      })

      // Show success message
      toast({
        title: "Usuario creado",
        description: `El usuario ${name} ha sido creado exitosamente`,
        variant: "default",
      })

    } catch (err) {
      console.error("Error creating user:", err)
      setError("Error al crear el usuario. Por favor, intenta nuevamente.")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Card className="border-slate-700 bg-slate-800 text-white">
      <CardHeader>
        <CardTitle>Crear Nuevo Usuario</CardTitle>
        <CardDescription className="text-slate-400">
          Añade un nuevo jugador y configura sus habilidades
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive" className="bg-red-900 border-red-800 text-white">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Nombre del Jugador</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-700 text-white"
              placeholder="Ej: Lionel Messi"
            />
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="font-medium text-slate-300">Habilidades</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-slate-300">Velocidad</label>
                <span className="text-sm text-slate-400">{stats.speed}</span>
              </div>
              <Slider
                value={[stats.speed]}
                max={5}
                min={1}
                step={1}
                onValueChange={(value) => setStats({...stats, speed: value[0]})}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-slate-300">Resistencia</label>
                <span className="text-sm text-slate-400">{stats.endurance}</span>
              </div>
              <Slider
                value={[stats.endurance]}
                max={5}
                min={1}
                step={1}
                onValueChange={(value) => setStats({...stats, endurance: value[0]})}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-slate-300">Técnica</label>
                <span className="text-sm text-slate-400">{stats.technique}</span>
              </div>
              <Slider
                value={[stats.technique]}
                max={5}
                min={1}
                step={1}
                onValueChange={(value) => setStats({...stats, technique: value[0]})}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-slate-300">Fuerza</label>
                <span className="text-sm text-slate-400">{stats.strength}</span>
              </div>
              <Slider
                value={[stats.strength]}
                max={5}
                min={1}
                step={1}
                onValueChange={(value) => setStats({...stats, strength: value[0]})}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-slate-300">Agilidad</label>
                <span className="text-sm text-slate-400">{stats.agility}</span>
              </div>
              <Slider
                value={[stats.agility]}
                max={5}
                min={1}
                step={1}
                onValueChange={(value) => setStats({...stats, agility: value[0]})}
              />
            </div>
          </div>

          <Button
            className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700"
            onClick={handleCreateUser}
            disabled={isCreating}
          >
            {isCreating ? "Creando..." : "Crear Usuario"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 