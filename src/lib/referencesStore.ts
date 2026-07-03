import type { Class, Subject, Period, Teacher } from '../data/references'
import { INITIAL_CLASSES, INITIAL_SUBJECTS, INITIAL_PERIODS, INITIAL_TEACHERS } from '../data/references'
import { getCurrentUserId } from './auth'

const getClassesKey = (userId: string) => `teacher-dashboard:${userId}:classes`
const getSubjectsKey = (userId: string) => `teacher-dashboard:${userId}:subjects`
const getPeriodsKey = (userId: string) => `teacher-dashboard:${userId}:periods`
const getTeachersKey = (userId: string) => `teacher-dashboard:${userId}:teachers`

// ==================== CLASSES ====================

export function loadClasses(): Class[] {
  const userId = getCurrentUserId()
  if (!userId) return INITIAL_CLASSES

  try {
    const raw = localStorage.getItem(getClassesKey(userId))
    return raw ? JSON.parse(raw) : INITIAL_CLASSES
  } catch {
    return INITIAL_CLASSES
  }
}

export function saveClasses(classes: Class[]): void {
  const userId = getCurrentUserId()
  if (!userId) {
    console.warn('Cannot save classes: No user logged in')
    return
  }

  localStorage.setItem(getClassesKey(userId), JSON.stringify(classes))
  window.dispatchEvent(new Event('references-changed'))
}

export function addClass(name: string, subjectIds?: string[]): Class {
  const classes = loadClasses()
  const newClass: Class = {
    id: Date.now().toString(),
    name: name.trim(),
    subjectIds: subjectIds || [],
  }
  classes.push(newClass)
  saveClasses(classes)
  return newClass
}

export function updateClass(id: string, name: string, subjectIds?: string[]): void {
  const classes = loadClasses()
  const index = classes.findIndex((c) => c.id === id)
  if (index !== -1) {
    classes[index].name = name.trim()
    if (subjectIds !== undefined) {
      classes[index].subjectIds = subjectIds
    }
    saveClasses(classes)
  }
}

export function updateClassSubjects(id: string, subjectIds: string[]): void {
  const classes = loadClasses()
  const index = classes.findIndex((c) => c.id === id)
  if (index !== -1) {
    classes[index].subjectIds = subjectIds
    saveClasses(classes)
  }
}

export function deleteClass(id: string): void {
  const classes = loadClasses().filter((c) => c.id !== id)
  saveClasses(classes)
}

// ==================== SUBJECTS ====================

export function loadSubjects(): Subject[] {
  const userId = getCurrentUserId()
  if (!userId) return INITIAL_SUBJECTS

  try {
    const raw = localStorage.getItem(getSubjectsKey(userId))
    return raw ? JSON.parse(raw) : INITIAL_SUBJECTS
  } catch {
    return INITIAL_SUBJECTS
  }
}

export function saveSubjects(subjects: Subject[]): void {
  const userId = getCurrentUserId()
  if (!userId) {
    console.warn('Cannot save subjects: No user logged in')
    return
  }

  localStorage.setItem(getSubjectsKey(userId), JSON.stringify(subjects))
  window.dispatchEvent(new Event('references-changed'))
}

export function addSubject(name: string): Subject {
  const subjects = loadSubjects()
  const newSubject: Subject = {
    id: Date.now().toString(),
    name: name.trim(),
  }
  subjects.push(newSubject)
  saveSubjects(subjects)
  return newSubject
}

export function updateSubject(id: string, name: string): void {
  const subjects = loadSubjects()
  const index = subjects.findIndex((s) => s.id === id)
  if (index !== -1) {
    subjects[index].name = name.trim()
    saveSubjects(subjects)
  }
}

export function deleteSubject(id: string): void {
  const subjects = loadSubjects().filter((s) => s.id !== id)
  saveSubjects(subjects)
}

// ==================== PERIODS ====================

export function loadPeriods(): Period[] {
  const userId = getCurrentUserId()
  if (!userId) return INITIAL_PERIODS

  try {
    const raw = localStorage.getItem(getPeriodsKey(userId))
    return raw ? JSON.parse(raw) : INITIAL_PERIODS
  } catch {
    return INITIAL_PERIODS
  }
}

export function savePeriods(periods: Period[]): void {
  const userId = getCurrentUserId()
  if (!userId) {
    console.warn('Cannot save periods: No user logged in')
    return
  }

  localStorage.setItem(getPeriodsKey(userId), JSON.stringify(periods))
  window.dispatchEvent(new Event('references-changed'))
}

export function addPeriod(name: string): Period {
  const periods = loadPeriods()
  const newPeriod: Period = {
    id: Date.now().toString(),
    name: name.trim(),
  }
  periods.push(newPeriod)
  savePeriods(periods)
  return newPeriod
}

export function updatePeriod(id: string, name: string): void {
  const periods = loadPeriods()
  const index = periods.findIndex((p) => p.id === id)
  if (index !== -1) {
    periods[index].name = name.trim()
    savePeriods(periods)
  }
}

export function deletePeriod(id: string): void {
  const periods = loadPeriods().filter((p) => p.id !== id)
  savePeriods(periods)
}

// ==================== TEACHERS ====================

export function loadTeachers(): Teacher[] {
  const userId = getCurrentUserId()
  if (!userId) return INITIAL_TEACHERS

  try {
    const raw = localStorage.getItem(getTeachersKey(userId))
    return raw ? JSON.parse(raw) : INITIAL_TEACHERS
  } catch {
    return INITIAL_TEACHERS
  }
}

export function saveTeachers(teachers: Teacher[]): void {
  const userId = getCurrentUserId()
  if (!userId) {
    console.warn('Cannot save teachers: No user logged in')
    return
  }

  localStorage.setItem(getTeachersKey(userId), JSON.stringify(teachers))
  window.dispatchEvent(new Event('references-changed'))
}

export function addTeacher(fullName: string): Teacher {
  const teachers = loadTeachers()
  const newTeacher: Teacher = {
    id: Date.now().toString(),
    fullName: fullName.trim(),
  }
  teachers.push(newTeacher)
  saveTeachers(teachers)
  return newTeacher
}

export function updateTeacher(id: string, fullName: string): void {
  const teachers = loadTeachers()
  const index = teachers.findIndex((t) => t.id === id)
  if (index !== -1) {
    teachers[index].fullName = fullName.trim()
    saveTeachers(teachers)
  }
}

export function deleteTeacher(id: string): void {
  const teachers = loadTeachers().filter((t) => t.id !== id)
  saveTeachers(teachers)
}

// ==================== HELPERS ====================

export function getClassById(id: string): Class | undefined {
  return loadClasses().find((c) => c.id === id)
}

export function getSubjectById(id: string): Subject | undefined {
  return loadSubjects().find((s) => s.id === id)
}

export function getPeriodById(id: string): Period | undefined {
  return loadPeriods().find((p) => p.id === id)
}

export function getTeacherById(id: string): Teacher | undefined {
  return loadTeachers().find((t) => t.id === id)
}
