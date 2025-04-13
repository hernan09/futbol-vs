export interface User {
  id: string
  email?: string
  username: string
  ratings?: Record<string, number>
}

export interface Team {
  id: string
  name: string
  players: string[] // Array of user IDs
  createdAt: string
}
