"use server"

import { cookies } from "next/headers"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth"
import { doc, setDoc, getDoc, enableIndexedDbPersistence } from "firebase/firestore"
import { auth, db } from "@/lib/firebase-config"

interface FirebaseError extends Error {
  code?: string
}

export async function getSession() {
  try {
    const cookieStore = cookies()
    const sessionCookie = (await cookieStore).get("session")
    
    if (!sessionCookie?.value) {
      return null
    }

    const parsedSession = JSON.parse(sessionCookie.value)
    const user = auth.currentUser

    if (!user || user.uid !== parsedSession.id) {
      // No eliminamos la cookie aquí, lo haremos en una Server Action
      return null
    }

    return parsedSession
  } catch (error) {
    console.error("Error al obtener la sesión:", error)
    return null
  }
}

export async function signIn(email: string, password: string, username?: string) {
  try {
    if (!auth || !db) {
      throw new Error("Firebase not initialized")
    }

    // Enable offline persistence
    try {
      await enableIndexedDbPersistence(db)
    } catch (err) {
      console.warn("Offline persistence already enabled or not supported:", err)
    }

    let userCredential
    let user

    if (username) {
      // Sign up
      userCredential = await createUserWithEmailAndPassword(auth, email, password)
      user = userCredential.user

      // Create user profile in Firestore
      try {
        await setDoc(doc(db, "users", user.uid), {
          id: user.uid,
          email: user.email,
          username: username,
          createdAt: new Date().toISOString(),
        })
      } catch (err) {
        console.error("Error creating user profile:", err)
        // Even if Firestore fails, we still have the auth user
      }
    } else {
      // Sign in
      userCredential = await signInWithEmailAndPassword(auth, email, password)
      user = userCredential.user

      // Try to get user profile from Firestore, but don't fail if offline
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (!userDoc.exists()) {
          console.warn("User profile not found in Firestore, but auth succeeded")
        }
      } catch (err) {
        console.warn("Could not fetch user profile, but auth succeeded:", err)
      }
    }

    if (!user) {
      throw new Error("Authentication failed - no user returned")
    }

    const session = {
      id: user.uid,
      email: user.email,
      name: user.displayName || "Usuario",
    }

    // La cookie se establecerá en una Server Action
    return { user: session, error: null }
  } catch (error: any) {
    console.error("Error al iniciar sesión:", error)
    // Preserve Firebase error codes
    if (error.code) {
      const firebaseError: FirebaseError = new Error(error.message)
      firebaseError.code = error.code
      return { user: null, error: firebaseError }
    }
    return { user: null, error: error.message }
  }
}

export async function signOut() {
  try {
    await auth.signOut()
    // La cookie se eliminará en una Server Action
    return { error: null }
  } catch (error: any) {
    console.error("Error al cerrar sesión:", error)
    return { error: error.message }
  }
}
