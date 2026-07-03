import type { Student, Grade, Attendance } from '../data/students'
import { getCurrentUserId } from './auth'

// Функции для генерации ключей с userId
const getStudentsKey = (userId: string) => `teacher-dashboard:${userId}:students`
const getGradesKey = (userId: string) => `teacher-dashboard:${userId}:grades`
const getAttendanceKey = (userId: string) => `teacher-dashboard:${userId}:attendance`

// ==================== STUDENTS ====================

export function loadStudents(): Student[] {
  const userId = getCurrentUserId()
  if (!userId) return []

  try {
    const raw = localStorage.getItem(getStudentsKey(userId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveStudents(students: Student[]): void {
  const userId = getCurrentUserId()
  if (!userId) {
    console.warn('Cannot save students: No user logged in')
    return
  }

  localStorage.setItem(getStudentsKey(userId), JSON.stringify(students))
  window.dispatchEvent(new Event('students-changed'))
}

export function addStudent(student: Student): void {
  const students = loadStudents()
  students.push(student)
  saveStudents(students)
}

export function updateStudent(id: string, updates: Partial<Student>): void {
  const students = loadStudents()
  const index = students.findIndex((s) => s.id === id)
  if (index !== -1) {
    students[index] = { ...students[index], ...updates }
    saveStudents(students)
  }
}

export function deleteStudent(id: string): void {
  const students = loadStudents().filter((s) => s.id !== id)
  saveStudents(students)

  // Also delete related grades and attendance
  const grades = loadGrades().filter((g) => g.studentId !== id)
  saveGrades(grades)

  const attendance = loadAttendance().filter((a) => a.studentId !== id)
  saveAttendance(attendance)
}

export function getStudentById(id: string): Student | undefined {
  return loadStudents().find((s) => s.id === id)
}

export function getStudentsByClass(className: string): Student[] {
  return loadStudents().filter((s) => s.className === className)
}

export function getAllClasses(): string[] {
  const students = loadStudents()
  const classes = new Set(students.map((s) => s.className))
  return Array.from(classes).sort()
}

export function deleteClass(className: string): void {
  const students = loadStudents()
  const studentsToDelete = students.filter((s) => s.className === className)
  const studentIds = studentsToDelete.map((s) => s.id)

  // Delete all students in class
  const remainingStudents = students.filter((s) => s.className !== className)
  saveStudents(remainingStudents)

  // Delete related grades
  const grades = loadGrades().filter((g) => !studentIds.includes(g.studentId))
  saveGrades(grades)

  // Delete related attendance
  const attendance = loadAttendance().filter((a) => !studentIds.includes(a.studentId))
  saveAttendance(attendance)
}

// ==================== GRADES ====================

export function loadGrades(): Grade[] {
  const userId = getCurrentUserId()
  if (!userId) return []

  try {
    const raw = localStorage.getItem(getGradesKey(userId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveGrades(grades: Grade[]): void {
  const userId = getCurrentUserId()
  if (!userId) {
    console.warn('Cannot save grades: No user logged in')
    return
  }

  localStorage.setItem(getGradesKey(userId), JSON.stringify(grades))
  window.dispatchEvent(new Event('grades-changed'))
}

export function addGrade(grade: Grade): void {
  const grades = loadGrades()
  grades.push(grade)
  saveGrades(grades)
}

export function updateGrade(id: string, updates: Partial<Grade>): void {
  const grades = loadGrades()
  const index = grades.findIndex((g) => g.id === id)
  if (index !== -1) {
    grades[index] = { ...grades[index], ...updates }
    saveGrades(grades)
  }
}

export function deleteGrade(id: string): void {
  const grades = loadGrades().filter((g) => g.id !== id)
  saveGrades(grades)
}

export function getGradesByStudent(studentId: string): Grade[] {
  return loadGrades().filter((g) => g.studentId === studentId)
}

export function getAverageGrade(studentId: string, subject?: string): number {
  let grades = getGradesByStudent(studentId)
  if (subject) {
    grades = grades.filter((g) => g.subject === subject)
  }
  if (grades.length === 0) return 0
  const sum = grades.reduce((acc, g) => acc + g.grade, 0)
  return Math.round((sum / grades.length) * 10) / 10
}

// ==================== ATTENDANCE ====================

export function loadAttendance(): Attendance[] {
  const userId = getCurrentUserId()
  if (!userId) return []

  try {
    const raw = localStorage.getItem(getAttendanceKey(userId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveAttendance(attendance: Attendance[]): void {
  const userId = getCurrentUserId()
  if (!userId) {
    console.warn('Cannot save attendance: No user logged in')
    return
  }

  localStorage.setItem(getAttendanceKey(userId), JSON.stringify(attendance))
  window.dispatchEvent(new Event('attendance-changed'))
}

export function addAttendance(attendance: Attendance): void {
  const all = loadAttendance()
  all.push(attendance)
  saveAttendance(all)
}

export function updateAttendance(id: string, updates: Partial<Attendance>): void {
  const all = loadAttendance()
  const index = all.findIndex((a) => a.id === id)
  if (index !== -1) {
    all[index] = { ...all[index], ...updates }
    saveAttendance(all)
  }
}

export function deleteAttendance(id: string): void {
  const all = loadAttendance().filter((a) => a.id !== id)
  saveAttendance(all)
}

export function getAttendanceByStudent(studentId: string): Attendance[] {
  return loadAttendance().filter((a) => a.studentId === studentId)
}

export function getAttendanceByDate(date: string): Attendance[] {
  return loadAttendance().filter((a) => a.date === date)
}

export function getAttendanceStats(studentId: string): {
  total: number
  present: number
  absent: number
  late: number
  excused: number
  attendanceRate: number
} {
  const records = getAttendanceByStudent(studentId)
  const total = records.length
  const present = records.filter((r) => r.status === 'present').length
  const absent = records.filter((r) => r.status === 'absent').length
  const late = records.filter((r) => r.status === 'late').length
  const excused = records.filter((r) => r.status === 'excused').length
  const attendanceRate = total > 0 ? Math.round(((present + late) / total) * 100) : 100

  return { total, present, absent, late, excused, attendanceRate }
}
