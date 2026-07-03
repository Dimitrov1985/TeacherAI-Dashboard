import { getCurrentUserId } from './auth'

const getTeacherKey = (userId: string) => `teacher-dashboard:${userId}:teacher`

export type TeacherProfile = {
  id: string
  fullName: string
  subject?: string
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
    }
    saveTeacher(defaultTeacher)
  }
}
