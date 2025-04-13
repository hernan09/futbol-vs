import type { User, Team } from "./types"

// Datos de ejemplo para usar cuando Firestore no está disponible
export const mockUsers: User[] = [
  {
    id: "user1",
    email: "jugador1@ejemplo.com",
    username: "Lionel Messi",
    ratings: {
      speed: 5,
      knowledge: 5,
      strength: 3,
      power: 4,
      vision: 5,
      goalkeeping: 2,
    },
  },
  {
    id: "user2",
    email: "jugador2@ejemplo.com",
    username: "Cristiano Ronaldo",
    ratings: {
      speed: 5,
      knowledge: 4,
      strength: 5,
      power: 5,
      vision: 4,
      goalkeeping: 1,
    },
  },
  {
    id: "user3",
    email: "jugador3@ejemplo.com",
    username: "Neymar Jr",
    ratings: {
      speed: 5,
      knowledge: 4,
      strength: 3,
      power: 4,
      vision: 4,
      goalkeeping: 1,
    },
  },
  {
    id: "user4",
    email: "jugador4@ejemplo.com",
    username: "Kylian Mbappé",
    ratings: {
      speed: 5,
      knowledge: 3,
      strength: 4,
      power: 4,
      vision: 3,
      goalkeeping: 1,
    },
  },
  {
    id: "user5",
    email: "jugador5@ejemplo.com",
    username: "Robert Lewandowski",
    ratings: {
      speed: 4,
      knowledge: 5,
      strength: 4,
      power: 5,
      vision: 4,
      goalkeeping: 1,
    },
  },
  {
    id: "user6",
    email: "jugador6@ejemplo.com",
    username: "Kevin De Bruyne",
    ratings: {
      speed: 4,
      knowledge: 5,
      strength: 3,
      power: 4,
      vision: 5,
      goalkeeping: 1,
    },
  },
  {
    id: "user7",
    email: "jugador7@ejemplo.com",
    username: "Manuel Neuer",
    ratings: {
      speed: 3,
      knowledge: 5,
      strength: 4,
      power: 4,
      vision: 5,
      goalkeeping: 5,
    },
  },
  {
    id: "user8",
    email: "jugador8@ejemplo.com",
    username: "Sergio Ramos",
    ratings: {
      speed: 3,
      knowledge: 5,
      strength: 5,
      power: 4,
      vision: 4,
      goalkeeping: 2,
    },
  },
]

export const mockTeams: Team[] = [
  {
    id: "team1",
    name: "Dream Team",
    players: ["user1", "user2", "user3", "user6"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "team2",
    name: "Power Squad",
    players: ["user4", "user5", "user7", "user8"],
    createdAt: new Date().toISOString(),
  },
]

// Función para simular un retraso como en una llamada a la API real
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
