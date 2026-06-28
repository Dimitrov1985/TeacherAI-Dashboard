import type { GeneratedLessonPlan } from '../data/lessonDetails'

const STORAGE_KEY = 'teacher-dashboard:lesson-plans'

export type SavedLessonPlan = {
  id: string
  plan: GeneratedLessonPlan
  grade: string
  createdAt: string
  linkedLessonId?: string // ID урока из Weekly Schedule
}

export function loadLessonPlans(): SavedLessonPlan[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveLessonPlan(plan: GeneratedLessonPlan, grade: string): SavedLessonPlan {
  const lessonPlan: SavedLessonPlan = {
    id: `lesson-${Date.now()}`,
    plan,
    grade,
    createdAt: new Date().toISOString(),
  }
  const plans = loadLessonPlans()
  plans.unshift(lessonPlan)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans))
  return lessonPlan
}

export function deleteLessonPlan(id: string): void {
  const plans = loadLessonPlans().filter(p => p.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans))
}

export function linkLessonPlan(planId: string, lessonId: string): void {
  const plans = loadLessonPlans()
  const updatedPlans = plans.map(p =>
    p.id === planId ? { ...p, linkedLessonId: lessonId } : p
  )
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlans))
}

export function unlinkLessonPlan(planId: string): void {
  const plans = loadLessonPlans()
  const updatedPlans = plans.map(p =>
    p.id === planId ? { ...p, linkedLessonId: undefined } : p
  )
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlans))
}
