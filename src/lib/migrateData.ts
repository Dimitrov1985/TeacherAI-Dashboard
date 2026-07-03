/**
 * Миграция данных из старого формата (без userId) в новый формат (с userId)
 * Вызывается один раз при первом логине после обновления
 */

import { getCurrentUserId } from './auth'

const OLD_KEYS = [
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
]

/**
 * Проверить, нужна ли миграция
 */
function needsMigration(): boolean {
  // Проверяем, есть ли старые ключи без userId
  return OLD_KEYS.some(key => localStorage.getItem(key) !== null)
}

/**
 * Выполнить миграцию данных для текущего пользователя
 */
export function migrateUserData(): void {
  const userId = getCurrentUserId()
  if (!userId) {
    console.log('No user logged in, skipping migration')
    return
  }

  if (!needsMigration()) {
    console.log('No old data found, skipping migration')
    return
  }

  console.log('🔄 Migrating data to new format with userId...')

  try {
    // Миграция основных данных
    migrateKey('teacher-dashboard:students', `teacher-dashboard:${userId}:students`)
    migrateKey('teacher-dashboard:grades', `teacher-dashboard:${userId}:grades`)
    migrateKey('teacher-dashboard:attendance', `teacher-dashboard:${userId}:attendance`)
    migrateKey('teacher-dashboard:classes', `teacher-dashboard:${userId}:classes`)
    migrateKey('teacher-dashboard:subjects', `teacher-dashboard:${userId}:subjects`)
    migrateKey('teacher-dashboard:periods', `teacher-dashboard:${userId}:periods`)
    migrateKey('teacher-dashboard:teachers', `teacher-dashboard:${userId}:teachers`)
    migrateKey('teacher-dashboard:lesson-plans', `teacher-dashboard:${userId}:lesson-plans`)
    migrateKey('teacher-dashboard:calendar-notes', `teacher-dashboard:${userId}:calendar-notes`)
    migrateKey('teacher-dashboard:calendar-events', `teacher-dashboard:${userId}:calendar-events`)
    migrateKey('teacher-dashboard:teacher', `teacher-dashboard:${userId}:teacher`)

    // Миграция journal данных (они имеют формат journal_classId_subjectId)
    migrateJournalData(userId)

    // Миграция materials данных (они имеют формат teacher-dashboard:materials:lessonId)
    migrateMaterialsData(userId)

    console.log('✅ Migration completed successfully')

    // Отправляем события для обновления UI
    window.dispatchEvent(new Event('students-changed'))
    window.dispatchEvent(new Event('grades-changed'))
    window.dispatchEvent(new Event('attendance-changed'))
    window.dispatchEvent(new Event('references-changed'))
    window.dispatchEvent(new Event('teacher-changed'))
  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

/**
 * Мигрировать один ключ
 */
function migrateKey(oldKey: string, newKey: string): void {
  const data = localStorage.getItem(oldKey)
  if (data) {
    localStorage.setItem(newKey, data)
    localStorage.removeItem(oldKey)
    console.log(`  ✓ Migrated ${oldKey} → ${newKey}`)
  }
}

/**
 * Мигрировать journal данные
 */
function migrateJournalData(userId: string): void {
  const keysToMigrate: string[] = []

  // Найти все journal ключи
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('journal_') && !key.includes(userId)) {
      keysToMigrate.push(key)
    }
  }

  // Мигрировать каждый journal ключ
  keysToMigrate.forEach(oldKey => {
    const parts = oldKey.split('_')
    if (parts.length === 3) {
      // journal_classId_subjectId → journal_userId_classId_subjectId
      const [, classId, subjectId] = parts
      const newKey = `journal_${userId}_${classId}_${subjectId}`
      migrateKey(oldKey, newKey)
    }
  })
}

/**
 * Мигрировать materials данные
 */
function migrateMaterialsData(userId: string): void {
  const keysToMigrate: string[] = []

  // Найти все materials ключи
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('teacher-dashboard:materials:') && !key.includes(userId)) {
      keysToMigrate.push(key)
    }
  }

  // Мигрировать каждый materials ключ
  keysToMigrate.forEach(oldKey => {
    const lessonId = oldKey.replace('teacher-dashboard:materials:', '')
    const newKey = `teacher-dashboard:${userId}:materials:${lessonId}`
    migrateKey(oldKey, newKey)
  })
}

/**
 * Проверить, была ли миграция выполнена для этого пользователя
 */
export function wasMigrated(userId: string): boolean {
  return localStorage.getItem(`migration-done-${userId}`) === 'true'
}

/**
 * Отметить миграцию как выполненную
 */
export function markMigrationDone(userId: string): void {
  localStorage.setItem(`migration-done-${userId}`, 'true')
}
