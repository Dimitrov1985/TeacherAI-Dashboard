import { useState, useRef, useEffect } from 'react'
import styles from './Journal.module.css'

type AttStatus = 'present' | 'absent' | 'late' | 'excused' | ''

interface AttendanceTableProps {
  students: Array<{ id: string; firstName: string; lastName: string; studentId?: string }>
  dates: Array<{ month: string; day: number }>
  attendance: AttStatus[][]
  onAttendance: (si: number, ci: number, v: AttStatus) => void
}

const ATT_OPTIONS: Array<{ value: AttStatus; label: string; short: string }> = [
  { value: '', label: 'Not marked', short: '—' },
  { value: 'present', label: '✓ Present', short: '✓' },
  { value: 'absent', label: '✗ Absent', short: '✗' },
  { value: 'late', label: '⏱ Late', short: '⏱' },
  { value: 'excused', label: '◯ Excused', short: '◯' },
]

function statusClass(v: AttStatus): string {
  if (v === 'present') return styles.sPresent
  if (v === 'absent') return styles.sAbsent
  if (v === 'late') return styles.sLate
  if (v === 'excused') return styles.sExcused
  return ''
}

function statusShort(v: AttStatus): string {
  return ATT_OPTIONS.find((o) => o.value === v)?.short ?? '—'
}

// AttendanceCell Component
interface AttendanceCellProps {
  value: AttStatus
  onSave: (v: AttStatus) => void
}

function AttendanceCell({ value, onSave }: AttendanceCellProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLTableCellElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [open])

  function handleSelect(v: AttStatus) {
    onSave(v)
    setOpen(false)
  }

  return (
    <td ref={ref} className={`${styles.attCell} ${statusClass(value)}`} onClick={() => setOpen(true)}>
      <span>{statusShort(value)}</span>
      {open && (
        <div className={styles.attDrop}>
          {ATT_OPTIONS.map((opt) => (
            <div key={opt.value} className={styles.attOpt} onClick={() => handleSelect(opt.value)}>
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </td>
  )
}

// Main AttendanceTable Component
export default function AttendanceTable({ students, dates, attendance, onAttendance }: AttendanceTableProps) {
  return (
    <div>
      <div className={styles.attTblWrap}>
        <table className={styles.attTbl}>
          <thead>
            <tr>
              <th className={styles.attThName}>Students</th>
              {dates.map((d, i) => (
                <th key={i} className={styles.attThDay}>
                  {d.month.slice(0, 3)} {d.day}
                </th>
              ))}
              <th className={styles.attThStat}>Present</th>
              <th className={styles.attThStat}>Absent</th>
              <th className={styles.attThStat}>Late</th>
              <th className={styles.attThStat}>%</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, si) => {
              const row = attendance[si]
              const present = row.filter((v) => v === 'present').length
              const absent = row.filter((v) => v === 'absent').length
              const late = row.filter((v) => v === 'late').length
              const total = dates.length
              const rate = total > 0 ? Math.round((present / total) * 100) : 0

              return (
                <tr key={student.id} className={si % 2 === 1 ? styles.rowAlt : ''}>
                  <td className={styles.attName}>
                    {student.studentId || si + 1}. {student.firstName} {student.lastName}
                  </td>
                  {row.map((val, ci) => (
                    <AttendanceCell key={ci} value={val} onSave={(v) => onAttendance(si, ci, v)} />
                  ))}
                  <td className={`${styles.attStat} ${styles.sPresent}`}>
                    {present}
                  </td>
                  <td className={`${styles.attStat} ${styles.sAbsent}`}>
                    {absent}
                  </td>
                  <td className={`${styles.attStat} ${styles.sLate}`}>
                    {late}
                  </td>
                  <td className={`${styles.attStat} ${rate >= 80 ? styles.sPresent : styles.sAbsent}`}>
                    {rate}%
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className={styles.attLegend}>
        <span>
          <b>✓</b> Present
        </span>
        <span>
          <b>✗</b> Absent
        </span>
        <span>
          <b>⏱</b> Late
        </span>
        <span>
          <b>◯</b> Excused
        </span>
      </div>
    </div>
  )
}
