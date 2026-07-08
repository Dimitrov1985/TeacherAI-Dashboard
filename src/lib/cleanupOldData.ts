/**
 * Очистка старых данных (без userId) после миграции
 *
 * После миграции в localStorage могут остаться старые ключи,
 * которые мешают правильной работе счётчиков
 */

import { getCurrentUserId } from './auth'

/**
 * Удалить все старые ключи (без userId)
 */
export function cleanupOldDataKeys(): void {
  const userId = getCurrentUserId()
  if (!userId) {
    console.warn('No user logged in, skipping cleanup')
    return
  }

  console.log('🧹 Cleaning up old data keys...')

  const oldKeys = [
    'teacher-dashboard:students',
    'teacher-dashboard:grades',
    'teacher-dashboard:attendance',
    'teacher-dashboard:classes',
    'teacher-dashboard:subjects',
    'teacher-dashboard:periods',
    'teacher-dashboard:teachers',
    'teacher-dashboard:lesson-plans',
    'teacher-dashboard:calendar-notes',
    'teacher-dashboard:calendar-events',
    'teacher-dashboard:teacher',
    'teacher-dashboard:avatar-image', // Старая аватарка без userId
  ]

  let deletedCount = 0

  // Удалить основные старые ключи
  oldKeys.forEach(key => {
    if (localStorage.getItem(key) !== null) {
      localStorage.removeItem(key)
      deletedCount++
      console.log(`  ✓ Removed old key: ${key}`)
    }
  })

  // Удалить старые journal ключи (без userId)
  const journalKeysToDelete: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('journal_') && !key.includes(`journal_${userId}_`)) {
      journalKeysToDelete.push(key)
    }
  }

  journalKeysToDelete.forEach(key => {
    localStorage.removeItem(key)
    deletedCount++
    console.log(`  ✓ Removed old journal key: ${key}`)
  })

  // Удалить старые materials ключи (без userId)
  const materialsKeysToDelete: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('teacher-dashboard:materials:') && !key.includes(`:${userId}:`)) {
      materialsKeysToDelete.push(key)
    }
  }

  materialsKeysToDelete.forEach(key => {
    localStorage.removeItem(key)
    deletedCount++
    console.log(`  ✓ Removed old materials key: ${key}`)
  })

  if (deletedCount > 0) {
    console.log(`✅ Cleanup complete! Removed ${deletedCount} old keys`)

    // Отправить события для обновления UI
    window.dispatchEvent(new Event('students-changed'))
    window.dispatchEvent(new Event('grades-changed'))
    window.dispatchEvent(new Event('references-changed'))
  } else {
    console.log('✅ No old keys found, everything is clean')
  }
}

/**
 * Проверить, есть ли старые ключи
 */
export function hasOldDataKeys(): boolean {
  const oldKeys = [
    'teacher-dashboard:students',
    'teacher-dashboard:grades',
    'teacher-dashboard:classes',
  ]

  return oldKeys.some(key => localStorage.getItem(key) !== null)
}

/**
 * Проверить данные в localStorage (для отладки)
 */
export function checkOldData(): void {
  const userId = getCurrentUserId()
  console.log('Current userId:', userId)
  console.log('Has old data keys:', hasOldDataKeys())

  // Показать все ключи
  const allKeys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) allKeys.push(key)
  }

  console.log('\n📦 All localStorage keys:')
  allKeys.sort().forEach(key => {
    const isOld = !key.includes(userId || 'xxx')
    console.log(`${isOld ? '❌' : '✅'} ${key}`)
  })
}

// Экспорт в глобальный объект для доступа из консоли
if (typeof window !== 'undefined') {
  ;(window as any).cleanupOldData = cleanupOldDataKeys
  ;(window as any).checkOldData = checkOldData
}
