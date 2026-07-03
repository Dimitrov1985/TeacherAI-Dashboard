import type { GeneratedLessonPlan } from '../data/lessonDetails'
import { getCurrentUserId } from './auth'

const getStorageKey = (userId: string) => `teacher-dashboard:${userId}:lesson-plans`

export type SavedLessonPlan = {
  id: string
  plan: GeneratedLessonPlan
  grade: string
  createdAt: string
  linkedLessonId?: string // ID урока из Weekly Schedule
}

export function loadLessonPlans(): SavedLessonPlan[] {
  const userId = getCurrentUserId()
  if (!userId) return []

  const raw = localStorage.getItem(getStorageKey(userId))
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveLessonPlan(plan: GeneratedLessonPlan, grade: string): SavedLessonPlan {
  const userId = getCurrentUserId()
  if (!userId) {
    throw new Error('Cannot save lesson plan: No user logged in')
  }

  const lessonPlan: SavedLessonPlan = {
    id: `lesson-${Date.now()}`,
    plan,
    grade,
    createdAt: new Date().toISOString(),
  }
  const plans = loadLessonPlans()
  plans.unshift(lessonPlan)
  localStorage.setItem(getStorageKey(userId), JSON.stringify(plans))
  return lessonPlan
}

export function deleteLessonPlan(id: string): void {
  const userId = getCurrentUserId()
  if (!userId) return

  const plans = loadLessonPlans().filter(p => p.id !== id)
  localStorage.setItem(getStorageKey(userId), JSON.stringify(plans))
}

export function linkLessonPlan(planId: string, lessonId: string): void {
  const userId = getCurrentUserId()
  if (!userId) return

  const plans = loadLessonPlans()
  const updatedPlans = plans.map(p =>
    p.id === planId ? { ...p, linkedLessonId: lessonId } : p
  )
  localStorage.setItem(getStorageKey(userId), JSON.stringify(updatedPlans))
}

export function unlinkLessonPlan(planId: string): void {
  const userId = getCurrentUserId()
  if (!userId) return

  const plans = loadLessonPlans()
  const updatedPlans = plans.map(p =>
    p.id === planId ? { ...p, linkedLessonId: undefined } : p
  )
  localStorage.setItem(getStorageKey(userId), JSON.stringify(updatedPlans))
}
