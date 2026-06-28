// Test file to verify Word export functionality
import { exportLessonPlanToWord } from './exportToWord'
import type { LessonPlan } from './exportToWord'

const testPlan: LessonPlan = {
  title: 'Тестовый план урока по математике',
  objectives: [
    'Понять основы арифметики',
    'Научиться решать уравнения',
    'Развить логическое мышление',
  ],
  flashcards: [
    { front: 'Что такое сумма?', back: 'Результат сложения чисел' },
    { front: 'Что такое произведение?', back: 'Результат умножения чисел' },
    { front: '2 + 2 = ?', back: '4' },
    { front: '5 × 3 = ?', back: '15' },
    { front: 'Что такое переменная?', back: 'Буква, обозначающая неизвестное число' },
  ],
  activities: [
    'Решение задач у доски',
    'Групповая работа с карточками',
    'Практическая работа в тетрадях',
  ],
  materialsNeeded: [
    'Учебник математики',
    'Рабочая тетрадь',
    'Карточки с задачами',
    'Калькуляторы',
  ],
}

// This function can be called from browser console for testing
export async function runTest() {
  console.log('Testing Word export...')
  try {
    await exportLessonPlanToWord(testPlan)
    console.log('✓ Export successful!')
  } catch (error) {
    console.error('✗ Export failed:', error)
  }
}
