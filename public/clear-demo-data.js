// Скрипт для очистки старых демо-данных
// Выполните в консоли браузера (F12)

(function clearDemoData() {
  console.log('🧹 Очистка старых демо-данных...')

  // Старые ключи БЕЗ userId
  const oldKeys = [
    'teacher-dashboard:students',
    'teacher-dashboard:grades',
    'teacher-dashboard:attendance',
  ]

  let removed = 0
  oldKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key)
      removed++
      console.log(`❌ Удалён: ${key}`)
    }
  })

  if (removed > 0) {
    console.log(`✅ Удалено ${removed} старых ключей`)
    console.log('🔄 Перезагрузите страницу: location.reload()')
  } else {
    console.log('✨ Старых данных не найдено - всё чисто!')
  }

  // Показать все текущие ключи
  const allKeys = Object.keys(localStorage)
    .filter(key => key.startsWith('teacher-dashboard'))

  if (allKeys.length > 0) {
    console.log('\n📦 Текущие ключи в localStorage:')
    allKeys.forEach(key => console.log(`  - ${key}`))
  }
})()
