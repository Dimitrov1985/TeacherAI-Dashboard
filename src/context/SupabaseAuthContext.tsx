import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

type AuthUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
}

type AuthContextType = {
  user: AuthUser | null
  session: Session | null
  login: (email: string, password: string) => Promise<void>
  signup: (data: SignupData) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: Partial<AuthUser>) => Promise<void>
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

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Загрузить текущую сессию
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        loadUserProfile(session.user)
      } else {
        setLoading(false)
      }
    })

    // Подписаться на изменения auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        loadUserProfile(session.user)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadUserProfile(authUser: User) {
    try {
      // Загрузить профиль из таблицы teachers
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (error) {
        console.error('Error loading profile:', error)
        // Если профиля нет - создать
        if (error.code === 'PGRST116') {
          await createUserProfile(authUser)
          return
        }
      }

      if (data) {
        setUser({
          id: data.id,
          email: data.email,
          firstName: data.first_name,
          lastName: data.last_name,
          avatar: data.avatar_url || undefined,
        })
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error)
    } finally {
      setLoading(false)
    }
  }

  async function createUserProfile(authUser: User) {
    const firstName = authUser.email?.split('@')[0] || 'Teacher'
    const lastName = ''

    const { error } = await supabase.from('teachers').insert({
      id: authUser.id,
      email: authUser.email!,
      first_name: firstName,
      last_name: lastName,
    })

    if (error) {
      console.error('Error creating profile:', error)
    } else {
      setUser({
        id: authUser.id,
        email: authUser.email!,
        firstName,
        lastName,
      })
    }
  }

  async function login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    // User будет загружен через onAuthStateChange
  }

  async function signup(formData: SignupData) {
    // Создать auth пользователя с метаданными
    // Профиль в таблице teachers создастся автоматически через trigger
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
        },
      },
    })

    if (error) {
      throw error
    }

    // User будет загружен через onAuthStateChange
    // Профиль создастся автоматически через database trigger
  }

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }

  async function updateProfile(data: Partial<AuthUser>) {
    if (!user) return

    const updates: any = {}
    if (data.firstName !== undefined) updates.first_name = data.firstName
    if (data.lastName !== undefined) updates.last_name = data.lastName
    if (data.avatar !== undefined) updates.avatar_url = data.avatar

    const { error } = await supabase
      .from('teachers')
      .update(updates)
      .eq('id', user.id)

    if (error) {
      throw error
    }

    // Обновить локальное состояние
    setUser({ ...user, ...data })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
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

export function useSupabaseAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useSupabaseAuth must be used within SupabaseAuthProvider')
  }
  return context
}
