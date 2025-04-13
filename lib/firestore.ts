import { db } from "@/lib/firebase-config"
import { doc, setDoc, getDoc, getDocs, collection, updateDoc } from "firebase/firestore"

export interface UserData {
  id: string
  email: string
  alias: string
  stats: {
    speed: number
    endurance: number
    technique: number
    strength: number
    agility: number
  }
}

export async function createUserProfile(userId: string, email: string) {
  try {
    const userRef = doc(db, "usuarios", userId)
    const userData: Omit<UserData, "id"> = {
      email,
      alias: email,
      stats: {
        speed: 0,
        endurance: 0,
        technique: 0,
        strength: 0,
        agility: 0
      }
    }
    
    await setDoc(userRef, userData)
    return { success: true }
  } catch (error) {
    console.error("Error creating user profile:", error)
    return { success: false, error }
  }
}

export async function updateUserAlias(userId: string, newAlias: string) {
  try {
    const userRef = doc(db, "usuarios", userId)
    await updateDoc(userRef, {
      alias: newAlias
    })
    return { success: true }
  } catch (error) {
    console.error("Error updating user alias:", error)
    return { success: false, error }
  }
}

export async function getUserProfile(userId: string): Promise<UserData | null> {
  try {
    const userRef = doc(db, "usuarios", userId)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      return { id: userId, ...userSnap.data() } as UserData
    }
    return null
  } catch (error) {
    console.error("Error getting user profile:", error)
    return null
  }
}

export async function getAllUsers(): Promise<UserData[]> {
  try {
    const usersRef = collection(db, "usuarios")
    const usersSnap = await getDocs(usersRef)
    
    return usersSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UserData[]
  } catch (error) {
    console.error("Error getting all users:", error)
    return []
  }
}

export async function updateUserStats(userId: string, stats: Partial<UserData["stats"]>) {
  try {
    const userRef = doc(db, "usuarios", userId)
    await updateDoc(userRef, {
      stats: {
        ...stats
      }
    })
    return { success: true }
  } catch (error) {
    console.error("Error updating user stats:", error)
    return { success: false, error }
  }
} 