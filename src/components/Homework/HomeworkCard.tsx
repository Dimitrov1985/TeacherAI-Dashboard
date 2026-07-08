import type { Homework } from '../../lib/homeworkStore'
import { isOverdue, getDaysUntilDue } from '../../data/homework'

type HomeworkCardProps = {
  homework: Homework
  onClick: () => void
}

export default function HomeworkCard({ homework, onClick }: HomeworkCardProps) {
  const overdue = isOverdue(homework.due)
  const days = getDaysUntilDue(homework.due)

  const totalStudents = homework.submissions.length
  const submitted = homework.submissions.filter((s) => s.done).length
  const graded = homework.submissions.filter((s) => s.grade !== null).length
  const submissionRate = totalStudents > 0 ? (submitted / totalStudents) * 100 : 0

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-xl border border-[#DCE8F5] bg-white p-5 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
    >
      {/* Header */}
      <div className="mb-3">
        <h3 className="mb-2 text-base font-semibold text-[#1D3557]">{homework.title}</h3>
        <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
          <span className="rounded-full bg-[#e3f2fd] px-2 py-1 text-[#457B9D]">
            {homework.className}
          </span>
          <span>{homework.subject}</span>
        </div>
      </div>

      {/* Due date */}
      <div className={`mb-4 text-sm font-medium ${overdue ? 'text-[#ff3c6a]' : 'text-[#457B9D]'}`}>
        {overdue ? (
          <span>⚠️ Overdue: {homework.due}</span>
        ) : days !== null ? (
          <span>
            ⏰ {days === 0 ? 'Due today' : days === 1 ? 'Due tomorrow' : `Due in ${days} days`}
          </span>
        ) : (
          <span>📅 {homework.due}</span>
        )}
      </div>

      {/* Progress */}
      {totalStudents > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#94a3b8]">Submissions</span>
            <span className="font-semibold text-[#1D3557]">
              {submitted}/{totalStudents}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-[#e3f2fd]">
            <div
              className="h-full rounded-full bg-[#457B9D] transition-all"
              style={{ width: `${submissionRate}%` }}
            />
          </div>

          {graded > 0 && (
            <div className="text-xs text-[#94a3b8]">
              ✅ {graded} graded
            </div>
          )}
        </div>
      )}
    </div>
  )
}
