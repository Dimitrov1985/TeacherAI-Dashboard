import { useState, useEffect } from 'react'
import type { Student, Grade, Attendance } from '../../data/students'
import { GRADE_COLORS, ATTENDANCE_COLORS, ATTENDANCE_LABELS } from '../../data/students'
import {
  getGradesByStudent,
  getAttendanceByStudent,
  getAverageGrade,
  getAttendanceStats,
  addGrade,
  addAttendance,
  deleteGrade,
  deleteAttendance,
} from '../../lib/studentsStore'

type StudentDetailViewProps = {
  student: Student
  onEdit: () => void
  onClose: () => void
}

type TabType = 'grades' | 'attendance' | 'info'

export default function StudentDetailView({ student, onEdit, onClose }: StudentDetailViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('grades')
  const [grades, setGrades] = useState<Grade[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])

  useEffect(() => {
    loadData()

    function handleUpdate() {
      loadData()
    }

    window.addEventListener('grades-changed', handleUpdate)
    window.addEventListener('attendance-changed', handleUpdate)

    return () => {
      window.removeEventListener('grades-changed', handleUpdate)
      window.removeEventListener('attendance-changed', handleUpdate)
    }
  }, [student.id])

  function loadData() {
    setGrades(getGradesByStudent(student.id).sort((a, b) => b.date.localeCompare(a.date)))
    setAttendance(getAttendanceByStudent(student.id).sort((a, b) => b.date.localeCompare(a.date)))
  }

  const avgGrade = getAverageGrade(student.id)
  const stats = getAttendanceStats(student.id)

  function handleAddGrade() {
    const subject = prompt('Предмет:')
    if (!subject) return

    const gradeValue = prompt('Оценка (1-5):')
    if (!gradeValue || isNaN(Number(gradeValue))) return

    const grade: Grade = {
      id: `grade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      studentId: student.id,
      subject: subject.trim(),
      grade: Number(gradeValue),
      date: new Date().toISOString().split('T')[0],
      type: 'classwork',
    }

    addGrade(grade)
  }

  function handleAddAttendance() {
    const date = prompt('Дата (YYYY-MM-DD):', new Date().toISOString().split('T')[0])
    if (!date) return

    const statusInput = prompt('Статус (present/absent/late/excused):', 'present')
    if (!statusInput) return

    const status = statusInput as Attendance['status']

    const record: Attendance = {
      id: `attendance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      studentId: student.id,
      date,
      status,
    }

    addAttendance(record)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex h-[90vh] w-full max-w-4xl flex-col gap-6 overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start gap-4 border-b border-[#DCE8F5] p-6">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#457B9D] to-[#1D3557] text-xl font-bold text-white">
            {student.firstName[0]}{student.lastName[0]}
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <h2 className="text-2xl font-bold text-[#1D3557]">
              {student.lastName} {student.firstName} {student.middleName}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="font-medium text-[#457B9D]">{student.className}</span>
              {avgGrade > 0 && (
                <span className="rounded-full px-3 py-1 font-medium text-white" style={{ backgroundColor: avgGrade >= 4.5 ? GRADE_COLORS[5] : avgGrade >= 3.5 ? GRADE_COLORS[4] : GRADE_COLORS[3] }}>
                  Средний балл: {avgGrade.toFixed(1)}
                </span>
              )}
              <span className="rounded-full bg-[#E9EFFF] px-3 py-1 font-medium text-[#457B9D]">
                Посещаемость: {stats.attendanceRate}%
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#ACACAC] transition-colors hover:bg-[#DCE8F5] hover:text-[#1D3557]"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6">
          <button
            type="button"
            onClick={() => setActiveTab('grades')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'grades'
                ? 'bg-[#457B9D] text-white'
                : 'text-[#457B9D] hover:bg-[#DCE8F5]'
            }`}
          >
            Оценки
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'attendance'
                ? 'bg-[#457B9D] text-white'
                : 'text-[#457B9D] hover:bg-[#DCE8F5]'
            }`}
          >
            Посещаемость
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'info'
                ? 'bg-[#457B9D] text-white'
                : 'text-[#457B9D] hover:bg-[#DCE8F5]'
            }`}
          >
            Информация
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {activeTab === 'grades' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#1D3557]">Журнал оценок</h3>
                <button
                  type="button"
                  onClick={handleAddGrade}
                  className="rounded-lg bg-[#457B9D] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1D3557]"
                >
                  + Добавить оценку
                </button>
              </div>

              {grades.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-[#DCE8F5] py-12 text-center">
                  <p className="text-sm text-[#ACACAC]">Оценок пока нет</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {grades.map((grade) => (
                    <div
                      key={grade.id}
                      className="flex items-center gap-4 rounded-lg border border-[#DCE8F5] p-4"
                    >
                      <div
                        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg text-xl font-bold text-white"
                        style={{ backgroundColor: GRADE_COLORS[grade.grade] || '#ACACAC' }}
                      >
                        {grade.grade}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[#1D3557]">{grade.subject}</p>
                        <p className="text-xs text-[#ACACAC]">
                          {new Date(grade.date).toLocaleDateString('ru-RU')} • {grade.type}
                        </p>
                        {grade.topic && <p className="text-sm text-[#457B9D]">{grade.topic}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Удалить эту оценку?')) {
                            deleteGrade(grade.id)
                          }
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#1D3557]">Посещаемость</h3>
                <button
                  type="button"
                  onClick={handleAddAttendance}
                  className="rounded-lg bg-[#457B9D] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1D3557]"
                >
                  + Отметить
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                  <p className="text-sm text-green-700">Присутствовал</p>
                </div>
                <div className="rounded-lg bg-red-50 p-4">
                  <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                  <p className="text-sm text-red-700">Отсутствовал</p>
                </div>
                <div className="rounded-lg bg-orange-50 p-4">
                  <p className="text-2xl font-bold text-orange-600">{stats.late}</p>
                  <p className="text-sm text-orange-700">Опоздал</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="text-2xl font-bold text-blue-600">{stats.excused}</p>
                  <p className="text-sm text-blue-700">Уважительная</p>
                </div>
              </div>

              {attendance.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-[#DCE8F5] py-12 text-center">
                  <p className="text-sm text-[#ACACAC]">Записей о посещаемости пока нет</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {attendance.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center gap-4 rounded-lg border-l-4 border-[#DCE8F5] bg-white p-4 shadow-sm"
                      style={{ borderLeftColor: ATTENDANCE_COLORS[record.status] }}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-[#1D3557]">
                          {ATTENDANCE_LABELS[record.status]}
                        </p>
                        <p className="text-sm text-[#ACACAC]">
                          {new Date(record.date).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                        {record.notes && <p className="text-sm text-[#457B9D]">{record.notes}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Удалить эту запись?')) {
                            deleteAttendance(record.id)
                          }
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'info' && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {student.studentId && (
                  <div>
                    <p className="text-sm font-medium text-[#ACACAC]">ID No.</p>
                    <p className="text-base text-[#1D3557]">{student.studentId}</p>
                  </div>
                )}
                {student.subject && (
                  <div>
                    <p className="text-sm font-medium text-[#ACACAC]">Subject</p>
                    <p className="text-base text-[#1D3557]">{student.subject}</p>
                  </div>
                )}
                {student.dateOfBirth && (
                  <div>
                    <p className="text-sm font-medium text-[#ACACAC]">Дата рождения</p>
                    <p className="text-base text-[#1D3557]">
                      {new Date(student.dateOfBirth).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                )}
                {student.email && (
                  <div>
                    <p className="text-sm font-medium text-[#ACACAC]">Email</p>
                    <p className="text-base text-[#1D3557]">{student.email}</p>
                  </div>
                )}
                {student.phone && (
                  <div>
                    <p className="text-sm font-medium text-[#ACACAC]">Телефон</p>
                    <p className="text-base text-[#1D3557]">{student.phone}</p>
                  </div>
                )}
                {student.parentName && (
                  <div>
                    <p className="text-sm font-medium text-[#ACACAC]">Родитель</p>
                    <p className="text-base text-[#1D3557]">{student.parentName}</p>
                  </div>
                )}
                {student.parentPhone && (
                  <div>
                    <p className="text-sm font-medium text-[#ACACAC]">Телефон родителя</p>
                    <p className="text-base text-[#1D3557]">{student.parentPhone}</p>
                  </div>
                )}
              </div>

              {student.notes && (
                <div>
                  <p className="mb-2 text-sm font-medium text-[#ACACAC]">Заметки</p>
                  <div className="rounded-lg bg-[#F8F9FA] p-4">
                    <p className="text-sm text-[#1D3557] whitespace-pre-wrap">{student.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
