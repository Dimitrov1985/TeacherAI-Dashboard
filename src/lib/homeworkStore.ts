// lib/homeworkStore.ts — хранение домашних заданий в localStorage с привязкой к userId
import { getCurrentUserId } from './auth'

export interface HomeworkSubmission {
  studentId: string
  done: boolean
  grade: number | null
}

export interface Homework {
  id: string
  title: string
  description?: string   // Детальное описание задания
  subject: string
  classId: string        // ID класса из referencesStore
  className: string      // Название класса (для отображения)
  due: string            // текст дедлайна, напр. "до 10 июля" или ISO дата
  submissions: HomeworkSubmission[]
  createdAt: number
}

function getStorageKey(): string {
  const userId = getCurrentUserId()
  return userId ? `teacher-dashboard:${userId}:homework` : 'teacher-dashboard:homework'
}

export function loadHomework(): Homework[] {
  const raw = localStorage.getItem(getStorageKey())
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Homework[]) : []
  } catch {
    return []
  }
}

function saveAll(list: Homework[]): void {
  localStorage.setItem(getStorageKey(), JSON.stringify(list))
  window.dispatchEvent(new Event('homework-changed'))
}

export function addHomework(hw: Homework): void {
  const list = loadHomework()
  list.unshift(hw)
  saveAll(list)
}

export function updateHomework(id: string, patch: Partial<Homework>): void {
  const list = loadHomework().map((hw) => (hw.id === id ? { ...hw, ...patch } : hw))
  saveAll(list)
}

export function deleteHomework(id: string): void {
  saveAll(loadHomework().filter((hw) => hw.id !== id))
}

// отметить/снять "сдал" для студента
export function toggleSubmission(hwId: string, studentId: string): void {
  const list = loadHomework().map((hw) => {
    if (hw.id !== hwId) return hw
    const submissions = hw.submissions.map((s) => {
      if (s.studentId !== studentId) return s
      const done = !s.done
      return { ...s, done, grade: done ? s.grade : null } // снял сдачу → убираем оценку
    })
    return { ...hw, submissions }
  })
  saveAll(list)
}

// поставить/снять оценку (только если сдал)
export function setSubmissionGrade(hwId: string, studentId: string, grade: number): void {
  const list = loadHomework().map((hw) => {
    if (hw.id !== hwId) return hw
    const submissions = hw.submissions.map((s) => {
      if (s.studentId !== studentId || !s.done) return s
      return { ...s, grade: s.grade === grade ? null : grade } // повторный клик снимает
    })
    return { ...hw, submissions }
  })
  saveAll(list)
}
