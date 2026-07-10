import { useState, useEffect } from 'react'
import type { Student } from '../data/students'
import {
  loadStudents,
  addStudent,
} from '../lib/studentsStore'
import BulkImportModal from '../components/Students/BulkImportModal'
import JournalContainer from '../components/Journal/JournalContainer'

export default function StudentsPage() {
  const [bulkImportOpen, setBulkImportOpen] = useState(false)
  const [hasStudents, setHasStudents] = useState(false)

  useEffect(() => {
    checkStudents()

    function handleUpdate() {
      checkStudents()
    }

    window.addEventListener('students-changed', handleUpdate)
    return () => {
      window.removeEventListener('students-changed', handleUpdate)
    }
  }, [])

  function checkStudents() {
    const students = loadStudents()
    console.log('checkStudents - students count:', students.length)
    console.log('checkStudents - setting hasStudents to:', students.length > 0)
    setHasStudents(students.length > 0)
  }

  function handleBulkImport(studentsData: Omit<Student, 'id' | 'createdAt'>[]) {
    console.log('handleBulkImport called with:', studentsData)

    if (studentsData.length === 0) {
      console.log('No students to import')
      return
    }

    const existingStudents = loadStudents()
    console.log('Existing students:', existingStudents)

    const sameClassStudents = existingStudents.filter(
      (s) => s.classId === studentsData[0]?.classId
    )

    let maxId = 0
    sameClassStudents.forEach((s) => {
      if (s.studentId) {
        const numId = parseInt(s.studentId)
        if (!isNaN(numId) && numId > maxId) {
          maxId = numId
        }
      }
    })

    studentsData.forEach((studentData, index) => {
      const newStudent: Student = {
        ...studentData,
        studentId: (maxId + index + 1).toString(),
        id: `student-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now(),
      }
      console.log('Adding student:', newStudent)
      addStudent(newStudent)
    })

    const allStudents = loadStudents()
    console.log('All students after import:', allStudents)
    console.log('Setting hasStudents to true...')

    // Update state immediately
    setHasStudents(true)
    setBulkImportOpen(false)
  }

  console.log('RENDER - hasStudents:', hasStudents)

  return (
    <main
      className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-8 sm:px-10 lg:px-16"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      {!hasStudents ? (
        <>
          {/* Empty State - No Students */}
          <div className="flex flex-1 flex-col items-center justify-center gap-6 py-16">
            <svg className="h-24 w-24 text-[#ACACAC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <div className="text-center">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>No Students Yet</h2>
              <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Import students to start working with the journal</p>
            </div>
            <button
              type="button"
              onClick={() => setBulkImportOpen(true)}
              className="flex items-center gap-2 rounded-lg px-8 py-4 text-base font-medium text-white transition-colors"
              style={{ backgroundColor: 'var(--accent)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent)'}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import Students
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Students Journal</h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Grades, Attendance & Final Scores</p>
            </div>
            <button
              type="button"
              onClick={() => setBulkImportOpen(true)}
              className="flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: 'var(--accent)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent)'}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import Students
            </button>
          </div>

          {/* Journal Container */}
          <JournalContainer />
        </>
      )}

      {/* Modals */}
      {bulkImportOpen && (
        <BulkImportModal
          onImport={handleBulkImport}
          onClose={() => setBulkImportOpen(false)}
        />
      )}
    </main>
  )
}
