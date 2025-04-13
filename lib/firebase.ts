"use server"

import { db } from "./firebase-config"
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore"
import type { User, Team } from "./types"
import { getSession } from "./auth"

export async function getAllUsers(): Promise<User[]> {
  const usersSnapshot = await getDocs(collection(db, "users"))
  return usersSnapshot.docs.map((doc) => doc.data() as User)
}

export async function getCurrentUser(): Promise<User> {
  const session = await getSession()

  if (!session) {
    throw new Error("Not authenticated")
  }

  const userDoc = await getDoc(doc(db, "users", session.id))

  if (!userDoc.exists()) {
    throw new Error("User not found")
  }

  return userDoc.data() as User
}

export async function updateUserProfile(data: Partial<User>): Promise<void> {
  const session = await getSession()

  if (!session) {
    throw new Error("Not authenticated")
  }

  const userRef = doc(db, "users", session.id)
  await updateDoc(userRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  })
}

export async function updatePlayerRatings(playerId: string, ratings: Record<string, number>): Promise<void> {
  const userRef = doc(db, "users", playerId)
  await updateDoc(userRef, {
    ratings,
    updatedAt: new Date().toISOString(),
  })
}

export async function getAllTeams(): Promise<Team[]> {
  const teamsSnapshot = await getDocs(collection(db, "teams"))
  return teamsSnapshot.docs.map((doc) => doc.data() as Team)
}

export async function saveTeam(team: Team): Promise<void> {
  await setDoc(doc(db, "teams", team.id), team)
}
