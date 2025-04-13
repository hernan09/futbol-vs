"use server"

import { cookies } from "next/headers"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth"
import { doc, setDoc, getDoc, enableIndexedDbPersistence } from "firebase/firestore"
import { auth, db } from "./firebase-config"

interface FirebaseError extends Error {
  code?: string
}

export async function getSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value

  if (!session) return null

  try {
    const parsedSession = JSON.parse(session)
    // Verify the session is still valid with Firebase
    const user = auth.currentUser
    if (!user || user.uid !== parsedSession.id) {
      await cookieStore.delete("session")
      return null
    }
    return parsedSession
  } catch (error) {
    console.error("Session parsing error:", error)
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

    // Set session cookie
    const session = {
      id: user.uid,
      email: user.email,
    }

    const cookieStore = await cookies()
    await cookieStore.set("session", JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
      sameSite: "lax"
    })

    return session
  } catch (error: any) {
    console.error("Authentication error:", error)
    // Preserve Firebase error codes
    if (error.code) {
      const firebaseError: FirebaseError = new Error(error.message)
      firebaseError.code = error.code
      throw firebaseError
    }
    throw error
  }
}

export async function signOut() {
  try {
    if (!auth) {
      throw new Error("Firebase not initialized")
    }

    await auth.signOut()
    const cookieStore = await cookies()
    await cookieStore.delete("session")
  } catch (error) {
    console.error("Sign out error:", error)
    throw error
  }
}
