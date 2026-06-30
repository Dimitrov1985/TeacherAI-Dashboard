import type { Student, Grade, Attendance } from './students'

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'student-1',
    firstName: 'Анна',
    lastName: 'Иванова',
    middleName: 'Петровна',
    className: '10А',
    dateOfBirth: '2008-03-15',
    email: 'anna.ivanova@example.com',
    phone: '+7 (999) 123-45-67',
    parentName: 'Иванова Мария Сергеевна',
    parentPhone: '+7 (999) 123-45-68',
    notes: 'Отличница, активно участвует в олимпиадах',
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    id: 'student-2',
    firstName: 'Дмитрий',
    lastName: 'Смирнов',
    middleName: 'Александрович',
    className: '10А',
    dateOfBirth: '2008-07-22',
    email: 'dmitry.smirnov@example.com',
    phone: '+7 (999) 234-56-78',
    parentName: 'Смирнов Александр Иванович',
    parentPhone: '+7 (999) 234-56-79',
    notes: 'Хорошо успевает по математике и физике',
    createdAt: Date.now() - 86400000 * 25,
  },
  {
    id: 'student-3',
    firstName: 'Елена',
    lastName: 'Петрова',
    className: '10А',
    dateOfBirth: '2008-11-05',
    email: 'elena.petrova@example.com',
    notes: 'Творческая личность, увлекается литературой',
    createdAt: Date.now() - 86400000 * 20,
  },
  {
    id: 'student-4',
    firstName: 'Максим',
    lastName: 'Козлов',
    middleName: 'Викторович',
    className: '9Б',
    dateOfBirth: '2009-01-18',
    phone: '+7 (999) 345-67-89',
    parentName: 'Козлова Ольга Николаевна',
    parentPhone: '+7 (999) 345-67-90',
    notes: 'Спортсмен, капитан школьной команды по футболу',
    createdAt: Date.now() - 86400000 * 15,
  },
  {
    id: 'student-5',
    firstName: 'Ольга',
    lastName: 'Новикова',
    className: '9Б',
    dateOfBirth: '2009-04-12',
    email: 'olga.novikova@example.com',
    notes: 'Староста класса, ответственная',
    createdAt: Date.now() - 86400000 * 10,
  },
]

export const INITIAL_GRADES: Grade[] = [
  // Анна Иванова
  { id: 'grade-1', studentId: 'student-1', subject: 'Математика', grade: 5, date: '2024-06-25', type: 'exam', topic: 'Тригонометрия' },
  { id: 'grade-2', studentId: 'student-1', subject: 'Физика', grade: 5, date: '2024-06-24', type: 'test', topic: 'Электричество' },
  { id: 'grade-3', studentId: 'student-1', subject: 'Химия', grade: 5, date: '2024-06-23', type: 'classwork' },
  { id: 'grade-4', studentId: 'student-1', subject: 'Литература', grade: 5, date: '2024-06-22', type: 'homework' },

  // Дмитрий Смирнов
  { id: 'grade-5', studentId: 'student-2', subject: 'Математика', grade: 5, date: '2024-06-25', type: 'exam' },
  { id: 'grade-6', studentId: 'student-2', subject: 'Физика', grade: 4, date: '2024-06-24', type: 'test' },
  { id: 'grade-7', studentId: 'student-2', subject: 'История', grade: 4, date: '2024-06-23', type: 'classwork' },
  { id: 'grade-8', studentId: 'student-2', subject: 'Английский', grade: 3, date: '2024-06-22', type: 'homework' },

  // Елена Петрова
  { id: 'grade-9', studentId: 'student-3', subject: 'Литература', grade: 5, date: '2024-06-25', type: 'project' },
  { id: 'grade-10', studentId: 'student-3', subject: 'Русский язык', grade: 5, date: '2024-06-24', type: 'test' },
  { id: 'grade-11', studentId: 'student-3', subject: 'История', grade: 4, date: '2024-06-23', type: 'classwork' },
  { id: 'grade-12', studentId: 'student-3', subject: 'Математика', grade: 4, date: '2024-06-22', type: 'homework' },

  // Максим Козлов
  { id: 'grade-13', studentId: 'student-4', subject: 'Физкультура', grade: 5, date: '2024-06-25', type: 'classwork' },
  { id: 'grade-14', studentId: 'student-4', subject: 'Математика', grade: 3, date: '2024-06-24', type: 'test' },
  { id: 'grade-15', studentId: 'student-4', subject: 'Физика', grade: 4, date: '2024-06-23', type: 'classwork' },
  { id: 'grade-16', studentId: 'student-4', subject: 'Химия', grade: 3, date: '2024-06-22', type: 'homework' },

  // Ольга Новикова
  { id: 'grade-17', studentId: 'student-5', subject: 'Математика', grade: 4, date: '2024-06-25', type: 'exam' },
  { id: 'grade-18', studentId: 'student-5', subject: 'Русский язык', grade: 5, date: '2024-06-24', type: 'test' },
  { id: 'grade-19', studentId: 'student-5', subject: 'Литература', grade: 4, date: '2024-06-23', type: 'classwork' },
  { id: 'grade-20', studentId: 'student-5', subject: 'Английский', grade: 4, date: '2024-06-22', type: 'homework' },
]

export const INITIAL_ATTENDANCE: Attendance[] = [
  // Last week attendance for all students
  // Анна Иванова - отличная посещаемость
  { id: 'att-1', studentId: 'student-1', date: '2024-06-24', status: 'present' },
  { id: 'att-2', studentId: 'student-1', date: '2024-06-25', status: 'present' },
  { id: 'att-3', studentId: 'student-1', date: '2024-06-26', status: 'present' },
  { id: 'att-4', studentId: 'student-1', date: '2024-06-27', status: 'present' },
  { id: 'att-5', studentId: 'student-1', date: '2024-06-28', status: 'present' },

  // Дмитрий Смирнов - иногда опаздывает
  { id: 'att-6', studentId: 'student-2', date: '2024-06-24', status: 'present' },
  { id: 'att-7', studentId: 'student-2', date: '2024-06-25', status: 'late', notes: 'Опоздал на 10 минут' },
  { id: 'att-8', studentId: 'student-2', date: '2024-06-26', status: 'present' },
  { id: 'att-9', studentId: 'student-2', date: '2024-06-27', status: 'present' },
  { id: 'att-10', studentId: 'student-2', date: '2024-06-28', status: 'late', notes: 'Опоздал на 5 минут' },

  // Елена Петрова - одно отсутствие
  { id: 'att-11', studentId: 'student-3', date: '2024-06-24', status: 'present' },
  { id: 'att-12', studentId: 'student-3', date: '2024-06-25', status: 'excused', notes: 'Была у врача' },
  { id: 'att-13', studentId: 'student-3', date: '2024-06-26', status: 'present' },
  { id: 'att-14', studentId: 'student-3', date: '2024-06-27', status: 'present' },
  { id: 'att-15', studentId: 'student-3', date: '2024-06-28', status: 'present' },

  // Максим Козлов - пропускает из-за соревнований
  { id: 'att-16', studentId: 'student-4', date: '2024-06-24', status: 'present' },
  { id: 'att-17', studentId: 'student-4', date: '2024-06-25', status: 'absent', notes: 'Соревнования по футболу' },
  { id: 'att-18', studentId: 'student-4', date: '2024-06-26', status: 'absent', notes: 'Соревнования по футболу' },
  { id: 'att-19', studentId: 'student-4', date: '2024-06-27', status: 'present' },
  { id: 'att-20', studentId: 'student-4', date: '2024-06-28', status: 'present' },

  // Ольга Новикова - стабильно присутствует
  { id: 'att-21', studentId: 'student-5', date: '2024-06-24', status: 'present' },
  { id: 'att-22', studentId: 'student-5', date: '2024-06-25', status: 'present' },
  { id: 'att-23', studentId: 'student-5', date: '2024-06-26', status: 'present' },
  { id: 'att-24', studentId: 'student-5', date: '2024-06-27', status: 'present' },
  { id: 'att-25', studentId: 'student-5', date: '2024-06-28', status: 'present' },
]

// Helper function to initialize demo data
export function initializeDemoStudents() {
  const STUDENTS_KEY = 'teacher-dashboard:students'
  const GRADES_KEY = 'teacher-dashboard:grades'
  const ATTENDANCE_KEY = 'teacher-dashboard:attendance'

  // Only initialize if empty
  if (!localStorage.getItem(STUDENTS_KEY)) {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(INITIAL_STUDENTS))
    localStorage.setItem(GRADES_KEY, JSON.stringify(INITIAL_GRADES))
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(INITIAL_ATTENDANCE))

    window.dispatchEvent(new Event('students-changed'))
    window.dispatchEvent(new Event('grades-changed'))
    window.dispatchEvent(new Event('attendance-changed'))
  }
}
