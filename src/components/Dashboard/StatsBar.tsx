import { useEffect, useState } from 'react'
import { IconCoursesStat, IconClassesStat, IconStudentsStat } from './icons'

const STORAGE_PREFIX = 'teacher-dashboard:materials:'
const LESSONS_STORAGE_KEY = 'teacher-dashboard:lessons'
const STUDENTS_STORAGE_KEY = 'teacher-dashboard:students'
const CLASSES_STORAGE_KEY = 'teacher-dashboard:classes'

export default function StatsBar() {
  const [lessonPlansCount, setLessonPlansCount] = useState(0)
  const [classesCount, setClassesCount] = useState(0)
  const [studentsCount, setStudentsCount] = useState(0)

  useEffect(() => {
    updateLessonPlansCount()
    updateClassesCount()
    updateStudentsCount()

    function handleMaterialsChange() {
      updateLessonPlansCount()
    }

    function handleLessonsChange() {
      updateClassesCount()
    }

    function handleStudentsChange() {
      updateStudentsCount()
    }

    function handleReferencesChange() {
      updateClassesCount()
    }

    window.addEventListener('materials-changed', handleMaterialsChange)
    window.addEventListener('lessons-changed', handleLessonsChange)
    window.addEventListener('students-changed', handleStudentsChange)
    window.addEventListener('references-changed', handleReferencesChange)
    return () => {
      window.removeEventListener('materials-changed', handleMaterialsChange)
      window.removeEventListener('lessons-changed', handleLessonsChange)
      window.removeEventListener('students-changed', handleStudentsChange)
      window.removeEventListener('references-changed', handleReferencesChange)
    }
  }, [])

  function updateLessonPlansCount() {
    let count = 0
    // Loop through all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(STORAGE_PREFIX)) {
        try {
          const materials = JSON.parse(localStorage.getItem(key) || '[]')
          // Count materials that have a plan
          if (Array.isArray(materials)) {
            count += materials.filter((m) => m.plan).length
          }
        } catch {
          // ignore malformed data
        }
      }
    }
    setLessonPlansCount(count)
  }

  function updateClassesCount() {
    try {
      const raw = localStorage.getItem(CLASSES_STORAGE_KEY)
      if (raw) {
        const classes = JSON.parse(raw)
        if (Array.isArray(classes)) {
          setClassesCount(classes.length)
          return
        }
      }
    } catch {
      // ignore malformed data
    }
    setClassesCount(0)
  }

  function updateStudentsCount() {
    try {
      const raw = localStorage.getItem(STUDENTS_STORAGE_KEY)
      if (raw) {
        const students = JSON.parse(raw)
        if (Array.isArray(students)) {
          setStudentsCount(students.length)
          return
        }
      }
    } catch {
      // ignore malformed data
    }
    setStudentsCount(0)
  }

  const stats = [
    { label: 'My lessons', value: lessonPlansCount, icon: IconCoursesStat, accent: '#EC6B47' },
    { label: 'Classes', value: classesCount, icon: IconClassesStat, accent: '#38C381' },
    { label: 'Students', value: studentsCount, icon: IconStudentsStat, accent: '#116CBD' },
  ]

  return (
    <div className="flex w-full max-w-[495px] flex-col gap-4 sm:flex-row">
      {stats.map(({ label, value, icon: Icon, accent }) => (
        <div
          key={label}
          className="flex flex-1 flex-col items-center justify-center rounded-[10px] bg-white px-8 pt-1 shadow-[0_4px_4px_rgba(148,163,184,0.15)]"
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <Icon className="h-8 w-8 flex-shrink-0" />
            <span className="text-[15px] font-medium text-[#B1B1B1]">{label}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[28px] font-bold text-[#1D3557]">{value}</span>
            <div className="h-0.5 w-8" style={{ backgroundColor: accent }} />
          </div>
        </div>
      ))}
    </div>
  )
}
