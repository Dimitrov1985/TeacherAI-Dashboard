import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type User = {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (data: SignupData) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => void
  isAuthenticated: boolean
  loading: boolean
}

type SignupData = {
  firstName: string
  lastName: string
  email: string
  password: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'teacher-dashboard:auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load user from localStorage
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setUser(parsed)
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    setLoading(false)
  }, [])

  async function login(email: string, password: string) {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Generate unique userId from email (hash-like approach)
    const userId = `user-${btoa(email).replace(/=/g, '').substring(0, 12)}`

    // Check if user already exists in a separate registry
    const existingUsersKey = 'teacher-dashboard:users-registry'
    const registryRaw = localStorage.getItem(existingUsersKey)
    const registry: Record<string, User> = registryRaw ? JSON.parse(registryRaw) : {}

    let userData: User

    if (registry[email]) {
      // User exists - load their data
      userData = registry[email]
      console.log('✅ Existing user logged in:', email, '→ userId:', userData.id)
    } else {
      // New user - create account
      userData = {
        id: userId,
        firstName: email.split('@')[0], // Use email prefix as default name
        lastName: '',
        email: email,
      }
      registry[email] = userData
      localStorage.setItem(existingUsersKey, JSON.stringify(registry))
      console.log('🆕 New user created:', email, '→ userId:', userId)
    }

    setUser(userData)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
  }

  async function signup(data: SignupData) {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Generate unique userId from email
    const userId = `user-${btoa(data.email).replace(/=/g, '').substring(0, 12)}`

    const userData: User = {
      id: userId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
    }

    // Save to registry
    const existingUsersKey = 'teacher-dashboard:users-registry'
    const registryRaw = localStorage.getItem(existingUsersKey)
    const registry: Record<string, User> = registryRaw ? JSON.parse(registryRaw) : {}
    registry[data.email] = userData
    localStorage.setItem(existingUsersKey, JSON.stringify(registry))

    console.log('🆕 User registered:', data.email, '→ userId:', userId)

    setUser(userData)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
  }

  function logout() {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
    // ВАЖНО: НЕ очищаем данные пользователя (students, grades, etc.)
    // Они остаются в localStorage и загрузятся при повторном логине
  }

  function updateProfile(data: Partial<User>) {
    if (!user) return

    const updated = { ...user, ...data }
    setUser(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
