"use server"

import { cookies } from "next/headers"
import { signIn as firebaseSignIn, signOut as firebaseSignOut } from "@/lib/auth"

export async function setSessionCookie(session: any) {
  try {
    const cookieStore = await cookies()
    await cookieStore.set("session", JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
      sameSite: "lax"
    })
  } catch (error) {
    console.error("Error setting session cookie:", error)
    throw new Error("Error al establecer la sesión")
  }
}

export async function deleteSessionCookie() {
  try {
    const cookieStore = await cookies()
    await cookieStore.delete("session")
  } catch (error) {
    console.error("Error deleting session cookie:", error)
    throw new Error("Error al eliminar la sesión")
  }
}

export async function signIn(email: string, password: string) {
  try {
    const result = await firebaseSignIn(email, password)
    
    if (result.error) {
      return { user: null, error: result.error }
    }
    
    if (result.user) {
      await setSessionCookie(result.user)
    }
    
    return { user: result.user, error: null }
  } catch (error: any) {
    console.error("Error in signIn action:", error)
    return { user: null, error: error.message || "Error al iniciar sesión" }
  }
}

export async function signOut() {
  try {
    const result = await firebaseSignOut()
    await deleteSessionCookie()
    return { error: null }
  } catch (error: any) {
    console.error("Error in signOut action:", error)
    return { error: error.message || "Error al cerrar sesión" }
  }
} 