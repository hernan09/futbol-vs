"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore"
import type { User } from "@/lib/types"
import { UserCircle } from "lucide-react"

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const sessionData = localStorage.getItem("session")
        if (!sessionData) {
          throw new Error("No session found")
        }

        const session = JSON.parse(sessionData)
        const db = getFirestore()
        const userDoc = await getDoc(doc(db, "users", session.id))

        if (!userDoc.exists()) {
          throw new Error("User not found")
        }

        const userData = userDoc.data() as User
        setUser(userData)
        setUsername(userData.username || "")
      } catch (error) {
        console.error("Error loading user:", error)
        setError("Error al cargar el perfil. Intenta de nuevo más tarde.")
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim()) {
      setMessage({ type: "error", text: "El nombre de usuario no puede estar vacío" })
      return
    }

    setSaving(true)

    try {
      if (!user) throw new Error("No user data")

      const db = getFirestore()
      const userRef = doc(db, "users", user.id)

      await updateDoc(userRef, {
        username: username,
        updatedAt: new Date().toISOString(),
      })

      setMessage({ type: "success", text: "¡Perfil actualizado exitosamente!" })
      setUser({ ...user, username })
    } catch (error) {
      console.error("Error updating profile:", error)
      setMessage({ type: "error", text: "Error al actualizar el perfil" })
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
    return <div className="flex justify-center p-8">Cargando perfil...</div>
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

  if (!user) {
    return <div className="p-8 text-center">Error al cargar el perfil</div>
  }

  return (
    <div className="mx-auto max-w-md p-4">
      <Card className="bg-slate-800 text-white">
        <CardHeader className="text-center">
          <Avatar className="mx-auto h-20 w-20 bg-emerald-600">
            <AvatarFallback className="text-xl">{getInitials(user.username)}</AvatarFallback>
          </Avatar>
          <CardTitle className="mt-4">Mi Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium">
                Nombre de Usuario
              </label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border-slate-700 bg-slate-900 text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Email</label>
              <Input value={user.email || ""} disabled className="border-slate-700 bg-slate-900 text-slate-400" />
              <p className="text-xs text-slate-400">El email no puede ser cambiado</p>
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
              type="submit"
              disabled={saving || username === user.username}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              <UserCircle className="mr-2 h-4 w-4" />
              {saving ? "Guardando..." : "Actualizar Perfil"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
