import { useState, useMemo, useRef, useEffect } from 'react'
import styles from './Journal.module.css'

// Types
interface DateEntry {
  month: string
  day: number
}

interface DateEntryIndexed extends DateEntry {
  idx: number
}

interface MonthGroup {
  name: string
  entries: DateEntryIndexed[]
}

type GradeValue = string

interface JournalTableProps {
  students: Array<{ id: string; firstName: string; lastName: string; studentId?: string }>
  dates: DateEntry[]
  grades: GradeValue[][]
  finalOverride: Record<number, number>
  onGrade: (si: number, ci: number, v: GradeValue) => void
  onFin: (si: number, v: number) => void
  onAddLesson: (month: string, day: number) => void
  onDelLesson: (idx: number) => void
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function validateGrade(raw: string): GradeValue {
  const v = raw.trim().toUpperCase()
  const VALID = ['', '1', '2', '3', '4', '5', 'ОТ', 'УП', 'Н', 'НА', 'Н/А']
  if (VALID.includes(v)) return v
  if (!isNaN(+v) && +v >= 1 && +v <= 5) return v
  return ''
}

function gClass(v: GradeValue): string {
  if (!v) return ''
  if (v === '5') return styles.g5
  if (v === '4') return styles.g4
  if (v === '3') return styles.g3
  if (v === '2') return styles.g2
  return styles.sp
}

function gColor(v: number | string | null): string {
  const n = typeof v === 'string' ? +v : v
  if (n === 5) return '#1a7a2a'
  if (n === 4) return '#185fa5'
  if (n === 3) return '#854f0b'
  if (n === 2) return '#a32d2d'
  return ''
}

function calcAvg(row: GradeValue[]): string | null {
  const nums = row.filter((v) => v && !isNaN(+v) && +v > 0).map(Number)
  if (!nums.length) return null
  return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2)
}

function autoFin(avg: string | null): number | null {
  if (avg === null) return null
  const v = parseFloat(avg)
  if (v >= 4.5) return 5
  if (v >= 3.5) return 4
  if (v >= 2.5) return 3
  return 2
}

function groupByMonth(dates: DateEntry[]): MonthGroup[] {
  const map: Record<string, DateEntryIndexed[]> = {}
  const order: string[] = []
  dates.forEach((d, i) => {
    if (!map[d.month]) {
      map[d.month] = []
      order.push(d.month)
    }
    map[d.month].push({ ...d, idx: i })
  })
  return order.map((m) => ({ name: m, entries: map[m] }))
}

// GradeCell Component
interface GradeCellProps {
  value: GradeValue
  onSave: (v: GradeValue) => void
}

function GradeCell({ value, onSave }: GradeCellProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  function commit() {
    const clean = validateGrade(draft)
    setEditing(false)
    setDraft(clean)
    if (clean !== value) onSave(clean)
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      commit()
    }
    if (e.key === 'Escape') {
      setDraft(value)
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <td className={styles.gCell}>
        <input
          ref={inputRef}
          className={styles.gInput}
          value={draft}
          maxLength={3}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={onKey}
        />
      </td>
    )
  }

  return (
    <td className={styles.gCell} onClick={() => setEditing(true)}>
      <span className={`${styles.gVal} ${gClass(value)}`}>{value}</span>
    </td>
  )
}

// Main JournalTable Component
export default function JournalTable({
  students,
  dates,
  grades,
  finalOverride,
  onGrade,
  onFin,
  onAddLesson,
  onDelLesson,
}: JournalTableProps) {
  const [showAdd, setShowAdd] = useState(false)
  const [newDate, setNewDate] = useState('')
  const groups = useMemo(() => groupByMonth(dates), [dates])

  function handleAdd() {
    if (!newDate) return
    const dt = new Date(newDate)
    onAddLesson(MONTH_NAMES[dt.getMonth()], dt.getDate())
    setNewDate('')
    setShowAdd(false)
  }

  function handleFin(si: number, cur: number | null) {
    const v = prompt('Final Grade (2–5):', String(cur ?? ''))
    if (v && ['2', '3', '4', '5'].includes(v.trim())) onFin(si, +v.trim())
  }

  return (
    <div>
      <div className={styles.toolbar}>
        {!showAdd ? (
          <button className={styles.btn} onClick={() => setShowAdd(true)}>
            + Add Lesson
          </button>
        ) : (
          <>
            <input
              type="date"
              className={styles.dateInp}
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
            <button className={styles.btn} onClick={handleAdd}>
              Add
            </button>
            <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setShowAdd(false)}>
              Cancel
            </button>
          </>
        )}
      </div>

      <div className={styles.tblWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thName} rowSpan={2}>
                Students
              </th>
              {groups.map((g, gi) => (
                <>
                  <th key={g.name} className={styles.thMonth} colSpan={g.entries.length}>
                    {g.name}
                  </th>
                  {gi < groups.length - 1 && <th className={styles.sepCol} rowSpan={2} />}
                </>
              ))}
              <th className={styles.thSum} rowSpan={2}>
                Average
              </th>
              <th className={styles.thSum} rowSpan={2}>
                Final
              </th>
            </tr>
            <tr>
              {groups.map((g, gi) => (
                <>
                  {g.entries.map((e) => (
                    <th key={e.idx} className={styles.thDay} title={`${e.month} ${e.day}`}>
                      <span>{e.day}</span>
                      <button className={styles.delBtn} onClick={() => onDelLesson(e.idx)}>
                        ✕
                      </button>
                    </th>
                  ))}
                  {gi < groups.length - 1 && <th className={styles.sepCol} />}
                </>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student, si) => {
              const avg = calcAvg(grades[si])
              const fin = finalOverride[si] !== undefined ? finalOverride[si] : autoFin(avg)
              return (
                <tr key={student.id} className={si % 2 === 1 ? styles.rowAlt : ''}>
                  <td className={styles.tdName}>
                    {student.studentId || si + 1}. {student.firstName} {student.lastName}
                  </td>
                  {groups.map((g, gi) => (
                    <>
                      {g.entries.map((e) => (
                        <GradeCell
                          key={e.idx}
                          value={grades[si][e.idx]}
                          onSave={(v) => onGrade(si, e.idx, v)}
                        />
                      ))}
                      {gi < groups.length - 1 && <td className={styles.sepCol} />}
                    </>
                  ))}
                  <td className={styles.tdAvg}>{avg ?? ''}</td>
                  <td className={styles.tdFin} style={{ color: gColor(fin) }} onClick={() => handleFin(si, fin)}>
                    {fin ?? ''}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className={styles.legend}>Click cell to enter grade (2–5, ОТ, УП, Н) · Hover date to delete lesson</div>
    </div>
  )
}
