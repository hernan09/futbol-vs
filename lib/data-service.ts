import { getFirestore, collection, getDocs, doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { mockUsers, mockTeams, delay } from "./mock-data"
import type { User, Team } from "./types"

// Variable para controlar si usamos datos simulados
const USE_MOCK_DATA = true

// Función para obtener todos los usuarios
export async function getAllUsers(): Promise<User[]> {
  try {
    // Intentar cargar desde localStorage primero
    const cachedUsers = localStorage.getItem("cachedUsers")
    if (cachedUsers) {
      return JSON.parse(cachedUsers)
    }

    // Si estamos usando datos simulados o hay un error de Firestore
    if (USE_MOCK_DATA) {
      // Simular un retraso para que parezca una llamada a la API
      await delay(800)
      // Guardar en localStorage para uso futuro
      localStorage.setItem("cachedUsers", JSON.stringify(mockUsers))
      return mockUsers
    }

    // Intentar obtener datos reales de Firestore
    const db = getFirestore()
    const usersSnapshot = await getDocs(collection(db, "users"))
    const usersData = usersSnapshot.docs.map((doc) => doc.data() as User)

    // Guardar en localStorage para uso offline
    localStorage.setItem("cachedUsers", JSON.stringify(usersData))
    return usersData
  } catch (error) {
    console.error("Error fetching users:", error)

    // Si hay un error, intentar usar datos en caché
    const cachedUsers = localStorage.getItem("cachedUsers")
    if (cachedUsers) {
      return JSON.parse(cachedUsers)
    }

    // Si no hay caché, usar datos simulados
    return mockUsers
  }
}

// Función para obtener un usuario por ID
export async function getUserById(userId: string): Promise<User | null> {
  try {
    // Intentar cargar desde localStorage primero
    const cachedUsers = localStorage.getItem("cachedUsers")
    if (cachedUsers) {
      const users = JSON.parse(cachedUsers) as User[]
      const user = users.find((u) => u.id === userId)
      if (user) return user
    }

    // Si estamos usando datos simulados o hay un error de Firestore
    if (USE_MOCK_DATA) {
      await delay(500)
      const user = mockUsers.find((u) => u.id === userId)
      return user || null
    }

    // Intentar obtener datos reales de Firestore
    const db = getFirestore()
    const userDoc = await getDoc(doc(db, "users", userId))

    if (!userDoc.exists()) {
      return null
    }

    return userDoc.data() as User
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error)

    // Si hay un error, intentar usar datos en caché
    const cachedUsers = localStorage.getItem("cachedUsers")
    if (cachedUsers) {
      const users = JSON.parse(cachedUsers) as User[]
      const user = users.find((u) => u.id === userId)
      if (user) return user
    }

    // Si no hay caché, buscar en datos simulados
    return mockUsers.find((u) => u.id === userId) || null
  }
}

// Función para obtener el usuario actual
export async function getCurrentUser(): Promise<User | null> {
  try {
    // Obtener ID de usuario de la sesión
    const sessionData = localStorage.getItem("session")
    if (!sessionData) {
      return null
    }

    const session = JSON.parse(sessionData)
    return getUserById(session.id)
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Función para actualizar las calificaciones de un jugador
export async function updatePlayerRatings(playerId: string, ratings: Record<string, number>): Promise<void> {
  try {
    // Si estamos usando datos simulados
    if (USE_MOCK_DATA) {
      await delay(600)

      // Actualizar en la caché local
      const cachedUsers = localStorage.getItem("cachedUsers")
      if (cachedUsers) {
        const users = JSON.parse(cachedUsers) as User[]
        const userIndex = users.findIndex((u) => u.id === playerId)

        if (userIndex >= 0) {
          users[userIndex].ratings = ratings
          users[userIndex].updatedAt = new Date().toISOString()
          localStorage.setItem("cachedUsers", JSON.stringify(users))
        }
      }

      return
    }

    // Actualizar en Firestore
    const db = getFirestore()
    await updateDoc(doc(db, "users", playerId), {
      ratings,
      updatedAt: new Date().toISOString(),
    })

    // También actualizar en la caché local
    const cachedUsers = localStorage.getItem("cachedUsers")
    if (cachedUsers) {
      const users = JSON.parse(cachedUsers) as User[]
      const userIndex = users.findIndex((u) => u.id === playerId)

      if (userIndex >= 0) {
        users[userIndex].ratings = ratings
        users[userIndex].updatedAt = new Date().toISOString()
        localStorage.setItem("cachedUsers", JSON.stringify(users))
      }
    }
  } catch (error) {
    console.error(`Error updating ratings for user ${playerId}:`, error)

    // Actualizar solo en la caché local si hay un error
    const cachedUsers = localStorage.getItem("cachedUsers")
    if (cachedUsers) {
      const users = JSON.parse(cachedUsers) as User[]
      const userIndex = users.findIndex((u) => u.id === playerId)

      if (userIndex >= 0) {
        users[userIndex].ratings = ratings
        users[userIndex].updatedAt = new Date().toISOString()
        localStorage.setItem("cachedUsers", JSON.stringify(users))
      }
    }
  }
}

// Función para actualizar el perfil de usuario
export async function updateUserProfile(userId: string, data: Partial<User>): Promise<void> {
  try {
    // Si estamos usando datos simulados
    if (USE_MOCK_DATA) {
      await delay(600)

      // Actualizar en la caché local
      const cachedUsers = localStorage.getItem("cachedUsers")
      if (cachedUsers) {
        const users = JSON.parse(cachedUsers) as User[]
        const userIndex = users.findIndex((u) => u.id === userId)

        if (userIndex >= 0) {
          users[userIndex] = { ...users[userIndex], ...data, updatedAt: new Date().toISOString() }
          localStorage.setItem("cachedUsers", JSON.stringify(users))
        }
      }

      return
    }

    // Actualizar en Firestore
    const db = getFirestore()
    await updateDoc(doc(db, "users", userId), {
      ...data,
      updatedAt: new Date().toISOString(),
    })

    // También actualizar en la caché local
    const cachedUsers = localStorage.getItem("cachedUsers")
    if (cachedUsers) {
      const users = JSON.parse(cachedUsers) as User[]
      const userIndex = users.findIndex((u) => u.id === userId)

      if (userIndex >= 0) {
        users[userIndex] = { ...users[userIndex], ...data, updatedAt: new Date().toISOString() }
        localStorage.setItem("cachedUsers", JSON.stringify(users))
      }
    }
  } catch (error) {
    console.error(`Error updating profile for user ${userId}:`, error)

    // Actualizar solo en la caché local si hay un error
    const cachedUsers = localStorage.getItem("cachedUsers")
    if (cachedUsers) {
      const users = JSON.parse(cachedUsers) as User[]
      const userIndex = users.findIndex((u) => u.id === userId)

      if (userIndex >= 0) {
        users[userIndex] = { ...users[userIndex], ...data, updatedAt: new Date().toISOString() }
        localStorage.setItem("cachedUsers", JSON.stringify(users))
      }
    }
  }
}

// Función para obtener todos los equipos
export async function getAllTeams(): Promise<Team[]> {
  try {
    // Intentar cargar desde localStorage primero
    const cachedTeams = localStorage.getItem("cachedTeams")
    if (cachedTeams) {
      return JSON.parse(cachedTeams)
    }

    // Si estamos usando datos simulados o hay un error de Firestore
    if (USE_MOCK_DATA) {
      await delay(800)
      localStorage.setItem("cachedTeams", JSON.stringify(mockTeams))
      return mockTeams
    }

    // Intentar obtener datos reales de Firestore
    const db = getFirestore()
    const teamsSnapshot = await getDocs(collection(db, "teams"))
    const teamsData = teamsSnapshot.docs.map((doc) => doc.data() as Team)

    // Guardar en localStorage para uso offline
    localStorage.setItem("cachedTeams", JSON.stringify(teamsData))
    return teamsData
  } catch (error) {
    console.error("Error fetching teams:", error)

    // Si hay un error, intentar usar datos en caché
    const cachedTeams = localStorage.getItem("cachedTeams")
    if (cachedTeams) {
      return JSON.parse(cachedTeams)
    }

    // Si no hay caché, usar datos simulados
    return mockTeams
  }
}

// Función para guardar un equipo
export async function saveTeam(team: Team): Promise<void> {
  try {
    // Si estamos usando datos simulados
    if (USE_MOCK_DATA) {
      await delay(600)

      // Actualizar en la caché local
      const cachedTeams = localStorage.getItem("cachedTeams")
      let teams: Team[] = []

      if (cachedTeams) {
        teams = JSON.parse(cachedTeams)
      }

      // Verificar si el equipo ya existe
      const existingIndex = teams.findIndex((t) => t.id === team.id)

      if (existingIndex >= 0) {
        teams[existingIndex] = team
      } else {
        teams.push(team)
      }

      localStorage.setItem("cachedTeams", JSON.stringify(teams))
      return
    }

    // Guardar en Firestore
    const db = getFirestore()
    await setDoc(doc(db, "teams", team.id), team)

    // También actualizar en la caché local
    const cachedTeams = localStorage.getItem("cachedTeams")
    let teams: Team[] = []

    if (cachedTeams) {
      teams = JSON.parse(cachedTeams)
    }

    // Verificar si el equipo ya existe
    const existingIndex = teams.findIndex((t) => t.id === team.id)

    if (existingIndex >= 0) {
      teams[existingIndex] = team
    } else {
      teams.push(team)
    }

    localStorage.setItem("cachedTeams", JSON.stringify(teams))
  } catch (error) {
    console.error(`Error saving team ${team.id}:`, error)

    // Guardar solo en la caché local si hay un error
    const cachedTeams = localStorage.getItem("cachedTeams")
    let teams: Team[] = []

    if (cachedTeams) {
      teams = JSON.parse(cachedTeams)
    }

    // Verificar si el equipo ya existe
    const existingIndex = teams.findIndex((t) => t.id === team.id)

    if (existingIndex >= 0) {
      teams[existingIndex] = team
    } else {
      teams.push(team)
    }

    localStorage.setItem("cachedTeams", JSON.stringify(teams))
  }
}
