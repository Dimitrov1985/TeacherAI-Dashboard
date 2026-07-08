import { getCurrentUserId } from './auth'

const getTeacherKey = (userId: string) => `teacher-dashboard:${userId}:teacher`
const getAvatarKey = (userId: string) => `teacher-dashboard:${userId}:avatar`

export type TeacherProfile = {
  id: string
  fullName: string
  subject?: string
  avatarUrl?: string
}

export function loadTeacher(): TeacherProfile | null {
  const userId = getCurrentUserId()
  if (!userId) return null

  try {
    const raw = localStorage.getItem(getTeacherKey(userId))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveTeacher(teacher: TeacherProfile): void {
  const userId = getCurrentUserId()
  if (!userId) {
    console.warn('Cannot save teacher: No user logged in')
    return
  }

  localStorage.setItem(getTeacherKey(userId), JSON.stringify(teacher))
  window.dispatchEvent(new Event('teacher-changed'))
}

export function updateTeacherName(fullName: string): void {
  const teacher = loadTeacher()
  if (teacher) {
    teacher.fullName = fullName.trim()
    saveTeacher(teacher)
  }
}

export function updateTeacherProfile(updates: Partial<Omit<TeacherProfile, 'id'>>): void {
  const teacher = loadTeacher()
  if (teacher) {
    Object.assign(teacher, updates)
    saveTeacher(teacher)
  }
}

export function initializeTeacher(): void {
  const existing = loadTeacher()
  if (!existing) {
    // Create default teacher on first load
    const defaultTeacher: TeacherProfile = {
      id: '1',
      fullName: 'Teacher Name', // Will be replaced when user sets their name
      subject: '', // Will be set during registration
      avatarUrl: undefined,
    }
    saveTeacher(defaultTeacher)
  }
}

// ==================== AVATAR ====================

/**
 * Загрузить аватарку текущего учителя
 */
export function loadAvatar(): string | null {
  const userId = getCurrentUserId()
  if (!userId) return null

  try {
    return localStorage.getItem(getAvatarKey(userId))
  } catch {
    return null
  }
}

/**
 * Сохранить аватарку текущего учителя
 */
export function saveAvatar(avatarBase64: string): void {
  const userId = getCurrentUserId()
  if (!userId) {
    console.warn('Cannot save avatar: No user logged in')
    return
  }

  localStorage.setItem(getAvatarKey(userId), avatarBase64)

  // Также обновить в профиле
  const teacher = loadTeacher()
  if (teacher) {
    teacher.avatarUrl = avatarBase64
    saveTeacher(teacher)
  }

  window.dispatchEvent(new Event('avatar-changed'))
}

/**
 * Удалить аватарку текущего учителя
 */
export function deleteAvatar(): void {
  const userId = getCurrentUserId()
  if (!userId) return

  localStorage.removeItem(getAvatarKey(userId))

  // Также удалить из профиля
  const teacher = loadTeacher()
  if (teacher) {
    teacher.avatarUrl = undefined
    saveTeacher(teacher)
  }

  window.dispatchEvent(new Event('avatar-changed'))
}
