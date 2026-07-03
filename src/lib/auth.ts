// Утилиты для работы с аутентификацией

const AUTH_STORAGE_KEY = 'teacher-dashboard:auth'

export interface AuthUser {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
}

/**
 * Получить текущего залогиненного пользователя
 */
export function getCurrentUser(): AuthUser | null {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!stored) return null

  try {
    const parsed = JSON.parse(stored)
    return parsed
  } catch {
    return null
  }
}

/**
 * Получить ID текущего пользователя
 */
export function getCurrentUserId(): string | null {
  const user = getCurrentUser()
  return user?.id || null
}

/**
 * Проверить, залогинен ли пользователь
 */
export function isAuthenticated(): boolean {
  return getCurrentUserId() !== null
}

/**
 * Очистить данные пользователя при логауте
 * ВАЖНО: Очищает только токен/user, НЕ очищает данные пользователя из localStorage
 */
export function clearAuth(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

/**
 * Сохранить данные пользователя при логине
 */
export function saveAuth(user: AuthUser): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
}
