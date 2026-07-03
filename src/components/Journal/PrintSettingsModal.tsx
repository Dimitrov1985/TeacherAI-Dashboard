import { useState } from 'react'
import type { Student } from '../../data/students'

interface PrintSettingsModalProps {
  students: Student[]
  onPrint: (settings: {
    selectedStudentId: string
    showAllGrades: boolean
    showAttendance: boolean
  }) => void
  onClose: () => void
}

export default function PrintSettingsModal({
  students,
  onPrint,
  onClose,
}: PrintSettingsModalProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all')
  const [showAllGrades, setShowAllGrades] = useState(true)
  const [showAttendance, setShowAttendance] = useState(true)

  function handlePrint() {
    onPrint({
      selectedStudentId: selectedStudentId === 'all' ? '' : selectedStudentId,
      showAllGrades,
      showAttendance,
    })
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1D3557]">Настройки печати</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#ACACAC] transition-colors hover:bg-[#F1F3F4] hover:text-[#1D3557]"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Student selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#1D3557]">
              Выбрать студента
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full rounded-lg border border-[#DCE8F5] px-4 py-3 text-sm text-[#1D3557] outline-none transition-colors focus:border-[#457B9D]"
            >
              <option value="all">Весь класс</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.studentId}. {student.firstName} {student.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Show all grades checkbox */}
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#DCE8F5] p-4 transition-colors hover:bg-[#F1F3F4]">
            <input
              type="checkbox"
              checked={showAllGrades}
              onChange={(e) => setShowAllGrades(e.target.checked)}
              className="h-5 w-5 cursor-pointer rounded border-[#DCE8F5] text-[#457B9D] focus:ring-2 focus:ring-[#457B9D] focus:ring-offset-0"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-[#1D3557]">Показать все оценки</div>
              <div className="text-xs text-[#ACACAC]">
                Включить все оценки по датам или только средний балл
              </div>
            </div>
          </label>

          {/* Show attendance checkbox */}
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#DCE8F5] p-4 transition-colors hover:bg-[#F1F3F4]">
            <input
              type="checkbox"
              checked={showAttendance}
              onChange={(e) => setShowAttendance(e.target.checked)}
              className="h-5 w-5 cursor-pointer rounded border-[#DCE8F5] text-[#457B9D] focus:ring-2 focus:ring-[#457B9D] focus:ring-offset-0"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-[#1D3557]">Включить посещаемость</div>
              <div className="text-xs text-[#ACACAC]">
                Добавить столбец с процентом посещаемости
              </div>
            </div>
          </label>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-[#DCE8F5] px-4 py-3 text-sm font-medium text-[#1D3557] transition-colors hover:bg-[#F1F3F4]"
          >
            Отмена
          </button>
          <button
            onClick={handlePrint}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#457B9D] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1D3557]"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Печать
          </button>
        </div>
      </div>
    </>
  )
}
