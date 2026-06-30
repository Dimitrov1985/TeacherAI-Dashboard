import type { Student } from '../../data/students'
import { getAverageGrade, getAttendanceStats } from '../../lib/studentsStore'
import { getClassById, getSubjectById, getPeriodById } from '../../lib/referencesStore'
import { GRADE_COLORS } from '../../data/students'

type StudentCardProps = {
  student: Student
  onClick: () => void
}

export default function StudentCard({ student, onClick }: StudentCardProps) {
  const avgGrade = getAverageGrade(student.id)
  const stats = getAttendanceStats(student.id)

  const classInfo = getClassById(student.classId)
  const subjectInfo = getSubjectById(student.subjectId)
  const periodInfo = getPeriodById(student.periodId)

  const gradeColor = avgGrade >= 4.5 ? GRADE_COLORS[5] : avgGrade >= 3.5 ? GRADE_COLORS[4] : avgGrade >= 2.5 ? GRADE_COLORS[3] : GRADE_COLORS[2]

  return (
    <div className="group flex w-full flex-col gap-3 rounded-xl bg-white p-4 shadow-[0_4px_8px_rgba(148,163,184,0.15)]">
      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#457B9D] to-[#1D3557] text-lg font-bold text-white">
          {student.firstName[0]}{student.lastName[0]}
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col items-start gap-1">
          <h3 className="text-left text-base font-semibold text-[#1D3557]">
            {student.lastName} {student.firstName}
          </h3>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-[#457B9D]">{classInfo?.name}</span>
            {subjectInfo && (
              <span className="text-xs text-[#457B9D]">📚 {subjectInfo.name}</span>
            )}
            {periodInfo && (
              <span className="text-xs text-[#ACACAC]">📅 {periodInfo.name}</span>
            )}
            {student.studentId && (
              <span className="text-xs text-[#ACACAC]">ID: {student.studentId}</span>
            )}
          </div>
        </div>

        {/* Grade badge */}
        {avgGrade > 0 && (
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg font-bold text-white"
            style={{ backgroundColor: gradeColor }}
          >
            {avgGrade.toFixed(1)}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <svg className="h-4 w-4 text-[#457B9D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium text-[#1D3557]">
            {stats.attendanceRate}% посещаемость
          </span>
        </div>

        {stats.total > 0 && (
          <span className="text-[#ACACAC]">
            {stats.total} {stats.total === 1 ? 'урок' : 'уроков'}
          </span>
        )}
      </div>

      {/* Notes preview */}
      {student.notes && (
        <p className="line-clamp-2 text-left text-xs text-[#ACACAC]">{student.notes}</p>
      )}
    </div>
  )
}
