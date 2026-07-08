/**
 * Скрипт для подсчёта студентов в localStorage
 * Скопируй и выполни в консоли браузера
 */

// Получить текущий userId
const authData = localStorage.getItem('teacher-dashboard:auth')
const userId = authData ? JSON.parse(authData).id : null

console.log('==========================================')
console.log('📊 СТАТИСТИКА СТУДЕНТОВ В БАЗЕ ДАННЫХ')
console.log('==========================================')
console.log('Current userId:', userId)
console.log('------------------------------------------')

if (!userId) {
  console.log('❌ Пользователь не залогинен!')
} else {
  // Правильный ключ с userId
  const correctKey = `teacher-dashboard:${userId}:students`
  const studentsData = localStorage.getItem(correctKey)

  console.log('Ключ студентов:', correctKey)
  console.log('Данные найдены:', !!studentsData)

  if (studentsData) {
    try {
      const students = JSON.parse(studentsData)
      console.log('\n✅ ВСЕГО СТУДЕНТОВ В БАЗЕ:', students.length)
      console.log('\n📋 Список студентов:')

      // Группируем по классам
      const byClass = {}
      students.forEach(student => {
        const className = student.classId || 'Без класса'
        if (!byClass[className]) {
          byClass[className] = []
        }
        byClass[className].push(student)
      })

      // Выводим по классам
      Object.keys(byClass).sort().forEach(className => {
        const classStudents = byClass[className]
        console.log(`\n  ${className}: ${classStudents.length} студентов`)
        classStudents.forEach((s, idx) => {
          console.log(`    ${idx + 1}. ${s.firstName} ${s.lastName} (ID: ${s.studentId})`)
        })
      })

    } catch (e) {
      console.log('❌ Ошибка парсинга данных:', e)
    }
  } else {
    console.log('❌ Студенты не найдены в localStorage')
  }
}

// Проверяем старые ключи
console.log('\n------------------------------------------')
console.log('🔍 ПРОВЕРКА СТАРЫХ КЛЮЧЕЙ (без userId):')
console.log('------------------------------------------')

const oldKey = 'teacher-dashboard:students'
const oldData = localStorage.getItem(oldKey)

if (oldData) {
  console.log('⚠️  Найден старый ключ:', oldKey)
  try {
    const oldStudents = JSON.parse(oldData)
    console.log('   Студентов в старом ключе:', oldStudents.length)
    console.log('   ⚠️  ВНИМАНИЕ: Это дубликаты! Нужно удалить.')
  } catch (e) {
    console.log('   Ошибка чтения старых данных')
  }
} else {
  console.log('✅ Старых ключей нет')
}

console.log('\n==========================================')
console.log('Для очистки старых данных выполни:')
console.log('cleanupOldData()')
console.log('==========================================\n')
