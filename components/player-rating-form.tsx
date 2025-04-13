"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { updatePlayerRatings } from "@/lib/data-service"
import type { User } from "@/lib/types"

interface PlayerRatingFormProps {
  player: User
  onComplete: () => void
}

const SKILLS = [
  { id: "speed", label: "Velocidad" },
  { id: "knowledge", label: "Conocimiento" },
  { id: "strength", label: "Fuerza" },
  { id: "power", label: "Potencia" },
  { id: "vision", label: "Visión" },
  { id: "goalkeeping", label: "Atajadas" },
]

export default function PlayerRatingForm({ player, onComplete }: PlayerRatingFormProps) {
  const [ratings, setRatings] = useState<Record<string, number>>(() => {
    // Initialize with existing ratings or defaults
    const initialRatings: Record<string, number> = {}
    SKILLS.forEach((skill) => {
      initialRatings[skill.id] = player.ratings?.[skill.id] || 3
    })
    return initialRatings
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRatingChange = (skillId: string, value: number) => {
    setRatings((prev) => ({
      ...prev,
      [skillId]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await updatePlayerRatings(player.id, ratings)
      onComplete()
    } catch (error) {
      console.error("Error updating ratings:", error)
      setError("Error al guardar las calificaciones. Intenta de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {SKILLS.map((skill) => (
        <div key={skill.id} className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor={skill.id} className="text-sm font-medium">
              {skill.label}
            </label>
            <span className="text-sm font-bold">{ratings[skill.id]}★</span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              id={skill.id}
              type="range"
              min="1"
              max="5"
              step="1"
              value={ratings[skill.id]}
              onChange={(e) => handleRatingChange(skill.id, Number.parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      ))}

      {error && <div className="rounded-md bg-red-900 p-3 text-sm text-white">{error}</div>}

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onComplete}
          className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
          {submitting ? "Guardando..." : "Guardar Calificaciones"}
        </Button>
      </div>
    </form>
  )
}
