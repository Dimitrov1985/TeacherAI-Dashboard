import { useEffect, useState } from 'react'
import SearchBar from '../components/Dashboard/SearchBar'
import StatCards from '../components/StatCards'
import WeeklySchedule from '../components/Dashboard/WeeklySchedule'
import { loadStudents, loadGrades } from '../lib/studentsStore'
import { getCurrentUserId } from '../lib/auth'

export default function DashboardPage() {
  const [totalStudents, setTotalStudents] = useState(0)
  const [averageGrade, setAverageGrade] = useState(0)
  const [totalClasses, setTotalClasses] = useState(0)

  useEffect(() => {
    loadData()

    function handleDataChange() {
      loadData()
    }

    window.addEventListener('students-changed', handleDataChange)
    window.addEventListener('grades-changed', handleDataChange)
    window.addEventListener('lessons-changed', handleDataChange)

    return () => {
      window.removeEventListener('students-changed', handleDataChange)
      window.removeEventListener('grades-changed', handleDataChange)
      window.removeEventListener('lessons-changed', handleDataChange)
    }
  }, [])

  function loadData() {
    const userId = getCurrentUserId()
    if (!userId) {
      setTotalStudents(0)
      setAverageGrade(0)
      setTotalClasses(0)
      return
    }

    // Load students
    const students = loadStudents()
    setTotalStudents(students.length)

    // Load grades and calculate average
    const grades = loadGrades()
    if (grades.length > 0) {
      const numericGrades = grades
        .map((g) => g.grade)
        .filter((v) => v && !isNaN(+v) && +v > 0)
        .map(Number)

      if (numericGrades.length > 0) {
        const sum = numericGrades.reduce((a, b) => a + b, 0)
        setAverageGrade(Math.round((sum / numericGrades.length) * 10) / 10)
      } else {
        setAverageGrade(0)
      }
    } else {
      setAverageGrade(0)
    }

    // Load lessons count
    try {
      const lessonsKey = `teacher-dashboard:${userId}:lessons`
      const lessonsRaw = localStorage.getItem(lessonsKey)
      const lessonsData = lessonsRaw ? JSON.parse(lessonsRaw) : []
      setTotalClasses(Array.isArray(lessonsData) ? lessonsData.length : 0)
    } catch {
      setTotalClasses(0)
    }
  }

  return (
    <main
      className="flex flex-1 flex-col items-center gap-8 overflow-y-auto px-4 py-8 sm:px-10 lg:px-16"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      <div className="flex w-full flex-col items-center gap-8">
        <SearchBar />
        <StatCards
          totalStudents={totalStudents}
          averageGrade={averageGrade}
          totalClasses={totalClasses}
        />
      </div>
      <WeeklySchedule />
    </main>
  )
}
