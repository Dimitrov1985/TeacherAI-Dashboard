import { useEffect } from 'react'
import type { Homework } from '../../lib/homeworkStore'
import { toggleSubmission, setSubmissionGrade, deleteHomework } from '../../lib/homeworkStore'
import { loadStudents } from '../../lib/studentsStore'

type SubmissionsModalProps = {
  homework: Homework
  onClose: () => void
}

export default function SubmissionsModal({ homework, onClose }: SubmissionsModalProps) {
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  function handleDelete() {
    if (confirm(`Delete homework "${homework.title}"?`)) {
      deleteHomework(homework.id)
      onClose()
    }
  }

  // Получить информацию о студентах класса
  const students = loadStudents()
  const classStudents = students.filter((s) => s.classId === homework.classId)
  const studentMap = new Map(classStudents.map((s) => [s.id, s]))

  const submitted = homework.submissions.filter((s) => s.done).length
  const graded = homework.submissions.filter((s) => s.grade !== null).length

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-2xl flex-col gap-5 rounded-2xl bg-white p-6 shadow-xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-[#1D3557]">{homework.title}</h3>
            <p className="mt-1 text-sm text-[#94a3b8]">
              {homework.className} • {homework.subject}
            </p>
            <p className="mt-1 text-xs text-[#94a3b8]">
              📅 Due: {homework.due}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl text-[#B1B1B1] transition-colors hover:text-[#1D3557]"
          >
            ×
          </button>
        </div>

        {/* Description */}
        {homework.description && (
          <div className="rounded-lg bg-[#f8f9fa] p-4">
            <p className="whitespace-pre-line text-sm text-[#1D3557]">{homework.description}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-[#e3f2fd] p-3 text-center">
            <div className="text-2xl font-bold text-[#457B9D]">{homework.submissions.length}</div>
            <div className="text-xs text-[#94a3b8]">Total students</div>
          </div>
          <div className="rounded-lg bg-[#e8f5e9] p-3 text-center">
            <div className="text-2xl font-bold text-[#1a7a2a]">{submitted}</div>
            <div className="text-xs text-[#94a3b8]">Submitted</div>
          </div>
          <div className="rounded-lg bg-[#f3e5f5] p-3 text-center">
            <div className="text-2xl font-bold text-[#7c3aed]">{graded}</div>
            <div className="text-xs text-[#94a3b8]">Graded</div>
          </div>
        </div>

        {/* Students list */}
        <div className="max-h-[400px] overflow-y-auto">
          <div className="space-y-2">
            {homework.submissions.map((submission) => {
              const student = studentMap.get(submission.studentId)
              if (!student) return null

              const isDone = submission.done
              const grade = submission.grade

              return (
                <div
                  key={submission.studentId}
                  className="flex items-center justify-between rounded-lg border border-[#DCE8F5] p-3"
                >
                  <div className="flex items-center gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleSubmission(homework.id, submission.studentId)}
                      className={`flex h-6 w-6 items-center justify-center rounded border-2 text-xs text-white transition-colors ${
                        isDone
                          ? 'border-[#3ECD88] bg-[#3ECD88]'
                          : 'border-[#DCE8F5] bg-white'
                      }`}
                    >
                      {isDone && '✓'}
                    </button>

                    <div>
                      <div className="text-sm font-medium text-[#1D3557]">
                        {student.firstName} {student.lastName}
                      </div>
                      {isDone && (
                        <div className="text-xs text-[#3ECD88]">
                          ✅ Submitted
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Grade buttons */}
                  {isDone && (
                    <div className="flex gap-1">
                      {[2, 3, 4, 5].map((g) => (
                        <button
                          key={g}
                          onClick={() => setSubmissionGrade(homework.id, submission.studentId, g)}
                          className={`flex h-8 w-8 items-center justify-center rounded text-sm font-medium transition-colors ${
                            grade === g
                              ? 'bg-[#457B9D] text-white'
                              : 'bg-[#f8f9fa] text-[#94a3b8] hover:bg-[#e3f2fd]'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleDelete}
            className="rounded-lg border border-[#ff3c6a] px-4 py-2 text-sm font-medium text-[#ff3c6a] transition-colors hover:bg-[#ff3c6a] hover:text-white"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-[#457B9D] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1D3557]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
