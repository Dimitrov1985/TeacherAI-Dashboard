// Типы для системы домашних заданий (упрощенная версия)

export type { Homework, HomeworkSubmission } from '../lib/homeworkStore'

// Дополнительные утилиты
export function parseDueDate(due: string): Date | null {
  try {
    return new Date(due)
  } catch {
    return null
  }
}

export function isOverdue(due: string): boolean {
  const dueDate = parseDueDate(due)
  if (!dueDate) return false
  return dueDate < new Date()
}

export function getDaysUntilDue(due: string): number | null {
  const dueDate = parseDueDate(due)
  if (!dueDate) return null
  const now = new Date()
  const diff = dueDate.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
