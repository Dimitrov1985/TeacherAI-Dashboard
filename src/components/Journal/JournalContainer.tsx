import React, { useState, useEffect, useMemo, useRef } from 'react'
import { loadClasses, loadSubjects, loadPeriods, deleteClass } from '../../lib/referencesStore'
import { loadStudents, updateStudent, deleteStudent, addStudent } from '../../lib/studentsStore'
import type { Student } from '../../data/students'
import PrintSettingsModal from './PrintSettingsModal'
import { openPrintWindow, type PrintData } from '../../lib/printJournal'
import { getCurrentUserId } from '../../lib/auth'

// Types
type ColumnType = 'lesson' | 'test' | 'exam' | 'homework'

interface DateEntry {
  m: string
  d: number
  title?: string
  type?: ColumnType
}

interface DateEntryIndexed extends DateEntry {
  idx: number
}

interface MonthGroup {
  name: string
  entries: DateEntryIndexed[]
}

type GradeValue = string
type AttValue = 'present' | 'absent' | 'late' | 'excused'
type FinalOverride = Record<number, number>
type OpenDrop = { si: number; di: number } | null

interface AttStatus {
  v: AttValue
  l: string
  t: string
}

const ATT_STATUSES: AttStatus[] = [
  { v: 'present', l: '✓', t: 'Present' },
  { v: 'absent', l: 'н', t: 'Absent' },
  { v: 'late', l: 'оп', t: 'Late' },
  { v: 'excused', l: 'УП', t: 'Excused' },
]

const MONTH_NAMES: string[] = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// Helpers
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
    if (!map[d.m]) {
      map[d.m] = []
      order.push(d.m)
    }
    map[d.m].push({ ...d, idx: i })
  })
  return order.map((m) => ({ name: m, entries: map[m] }))
}

function validateGrade(raw: string): GradeValue {
  const v = raw.trim().toUpperCase()
  const VALID = ['', '1', '2', '3', '4', '5', 'ОТ', 'УП', 'Н', 'НА', 'Н/А']
  if (VALID.includes(v)) return v
  if (!isNaN(+v) && +v >= 1 && +v <= 5) return v
  return ''
}

function gClass(v: GradeValue): string {
  if (!v) return ''
  if (v === '5') return 'g5'
  if (v === '4') return 'g4'
  if (v === '3') return 'g3'
  if (v === '2') return 'g2'
  return 'sp'
}

function gColorClass(v: number | string | null): string {
  const n = typeof v === 'string' ? +v : v
  if (n === 5) return 'grade-color-5'
  if (n === 4) return 'grade-color-4'
  if (n === 3) return 'grade-color-3'
  if (n === 2) return 'grade-color-2'
  return ''
}

// GradeCell Component
interface GradeCellProps {
  value: GradeValue
  onSave: (v: GradeValue) => void
}

const GRADE_OPTIONS = ['-2', '-1', '1', '2', '3', '4', '5', 'ab']

function GradeCell({ value, onSave }: GradeCellProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  useEffect(() => {
    if (!showDropdown) return

    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDropdown])

  function selectGrade(grade: string) {
    onSave(grade)
    setShowDropdown(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      onSave(draft.trim())
      setEditing(false)
    }
    if (e.key === 'Escape') {
      setDraft(value)
      setEditing(false)
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (!editing) {
        e.preventDefault()
        onSave('')
      }
    }
  }

  function handleClick(e: React.MouseEvent) {
    if (e.detail === 2) {
      // Double-click → ручной ввод
      setShowDropdown(false)
      setEditing(true)
    } else {
      // Single-click → dropdown
      setShowDropdown(true)
    }
  }

  if (editing) {
    return (
      <td className="g-cell" style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          className="g-input"
          value={draft}
          maxLength={3}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            onSave(draft.trim())
            setEditing(false)
          }}
          onKeyDown={handleKeyDown}
        />
      </td>
    )
  }

  const cellStyle: React.CSSProperties = {
    position: 'relative',
    ...(value.toLowerCase() === 'ab' ? { backgroundColor: '#fcebeb' } : {})
  }

  return (
    <td className="g-cell" onClick={handleClick} onKeyDown={handleKeyDown} tabIndex={0} style={cellStyle}>
      <span className={`g-val ${gClass(value)}`}>{value}</span>
      {showDropdown && (
        <div ref={dropdownRef} className="grade-dropdown">
          <div
            className="grade-option"
            onClick={(e) => {
              e.stopPropagation()
              onSave('')
              setShowDropdown(false)
            }}
            style={{ color: 'var(--grade-2)', fontWeight: 600 }}
          >
            Clear
          </div>
          {GRADE_OPTIONS.map((opt) => (
            <div
              key={opt}
              className="grade-option"
              onClick={(e) => {
                e.stopPropagation()
                selectGrade(opt)
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </td>
  )
}

// JournalTab Component
interface JournalTabProps {
  students: Student[]
  dates: DateEntry[]
  grades: GradeValue[][]
  finalOverride: FinalOverride
  conducted: boolean[]
  subjectName: string
  onGrade: (si: number, ci: number, v: GradeValue) => void
  onFin: (si: number, v: number) => void
  onAddLesson: (month: string, day: number, title?: string, type?: ColumnType) => void
  onDelLesson: (idx: number) => void
  setConducted: React.Dispatch<React.SetStateAction<boolean[]>>
  editingStudent: { si: number; field: 'firstName' | 'lastName' } | null
  editDraft: string
  onEditStudent: (si: number, field: 'firstName' | 'lastName') => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  setEditDraft: (v: string) => void
  onDeleteStudent: (si: number) => void
}

function JournalTab({
  students,
  dates,
  grades,
  finalOverride,
  conducted,
  subjectName,
  onGrade,
  onFin,
  onAddLesson,
  onDelLesson,
  setConducted,
  editingStudent,
  editDraft,
  onEditStudent,
  onSaveEdit,
  onCancelEdit,
  setEditDraft,
  onDeleteStudent,
}: JournalTabProps) {
  const [showAdd, setShowAdd] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [showAddColumn, setShowAddColumn] = useState(false)
  const [columnTitle, setColumnTitle] = useState('')
  const [columnDate, setColumnDate] = useState('')
  const [columnType, setColumnType] = useState<ColumnType>('lesson')
  const groups = useMemo(() => groupByMonth(dates), [dates])

  function handleAdd() {
    if (!newDate) return
    const dt = new Date(newDate)
    onAddLesson(MONTH_NAMES[dt.getMonth()], dt.getDate())
    setNewDate('')
    setShowAdd(false)
  }

  function handleAddColumn() {
    if (!columnDate) return
    const dt = new Date(columnDate)
    onAddLesson(MONTH_NAMES[dt.getMonth()], dt.getDate(), columnTitle.trim() || undefined, columnType)
    setColumnTitle('')
    setColumnDate('')
    setColumnType('lesson')
    setShowAddColumn(false)
  }

  function handleFin(si: number, cur: number | null) {
    const v = prompt('Final Grade (2–5):', String(cur ?? ''))
    if (v && ['2', '3', '4', '5'].includes(v.trim())) onFin(si, +v.trim())
  }

  return (
    <div>
      {/* Subject Title + Add Lesson Button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginBottom: '20px',
        paddingBottom: '12px',
        borderBottom: '2px solid #DCE8F5'
      }}>
        {/* Add Lesson Button (left) */}
        <div style={{ position: 'absolute', left: 0, display: 'flex', gap: '8px', flexDirection: 'row', alignItems: 'flex-start' }}>
          {!showAdd && !showAddColumn && (
            <>
              <button className="btn" onClick={() => setShowAdd(true)}>
                + Add Lesson
              </button>
              <button className="btn btn-ghost" onClick={() => setShowAddColumn(true)}>
                + Add Column
              </button>
            </>
          )}
          {showAdd && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdd()
                  if (e.key === 'Escape') setShowAdd(false)
                }}
                className="date-inp"
                autoFocus
              />
              <button className="btn" onClick={handleAdd}>
                Save
              </button>
              <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>
                Cancel
              </button>
            </div>
          )}
          {showAddColumn && (
            <>
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.3)',
                  zIndex: 40,
                }}
                onClick={() => setShowAddColumn(false)}
              />
              <div
                style={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  background: 'white',
                  padding: '20px',
                  border: '1px solid #ddd',
                  borderRadius: '12px',
                  minWidth: '350px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  zIndex: 50,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Add Special Column</h3>
                <input
                  type="text"
                  placeholder="Title (e.g., Контрольная работа)"
                  value={columnTitle}
                  onChange={(e) => setColumnTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddColumn()
                    if (e.key === 'Escape') setShowAddColumn(false)
                  }}
                  className="date-inp"
                  style={{ width: '100%' }}
                  autoFocus
                />
                <input
                  type="date"
                  value={columnDate}
                  onChange={(e) => setColumnDate(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddColumn()
                    if (e.key === 'Escape') setShowAddColumn(false)
                  }}
                  className="date-inp"
                  style={{ width: '100%' }}
                />
                <select
                  value={columnType}
                  onChange={(e) => setColumnType(e.target.value as ColumnType)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddColumn()
                    if (e.key === 'Escape') setShowAddColumn(false)
                  }}
                  className="date-inp"
                  style={{ width: '100%' }}
                >
                  <option value="lesson">Lesson</option>
                  <option value="test">Test</option>
                  <option value="exam">Exam</option>
                  <option value="homework">Homework</option>
                </select>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button className="btn btn-ghost" onClick={() => setShowAddColumn(false)}>
                    Cancel
                  </button>
                  <button className="btn" onClick={handleAddColumn}>
                    Save
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Subject Title (center) */}
        {subjectName && (
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1D3557',
            margin: 0
          }}>
            {subjectName}
          </h2>
        )}
      </div>

      <div className="tbl-wrap">
        <table>
          <thead>
            <tr>
              <th className="th-name" rowSpan={2}>
                Students
              </th>
              {groups.map((g, gi) => (
                <React.Fragment key={g.name}>
                  <th className="th-month" colSpan={g.entries.length}>
                    {g.name}
                  </th>
                  {gi < groups.length - 1 && <th className="sep-col" rowSpan={2} />}
                </React.Fragment>
              ))}
            </tr>
            <tr>
              {groups.map((g, gi) => (
                <React.Fragment key={`day-${g.name}`}>
                  {g.entries.map((e) => {
                    const columnTypeClass = e.type ? `th-day-${e.type}` : ''
                    return (
                      <th
                        key={e.idx}
                        className={`th-day ${columnTypeClass}`}
                        title={e.title ? `${e.title} (${e.m} ${e.d})` : `${e.m} ${e.d}`}
                      >
                        {e.title ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ fontSize: '9px', fontWeight: 600 }}>{e.title}</span>
                            <span>{e.d}</span>
                          </div>
                        ) : (
                          <span>{e.d}</span>
                        )}
                        <button className="del-btn" onClick={() => onDelLesson(e.idx)}>
                          ✕
                        </button>
                      </th>
                    )
                  })}
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student, si) => {
              const avg = calcAvg(grades[si] || [])
              const fin = finalOverride[si] !== undefined ? finalOverride[si] : autoFin(avg)
              const isEditingFirst = editingStudent?.si === si && editingStudent.field === 'firstName'
              const isEditingLast = editingStudent?.si === si && editingStudent.field === 'lastName'

              return (
                <tr key={student.id} className={si % 2 === 1 ? 'row-alt' : ''}>
                  <td className="td-name" style={{ display: 'flex', alignItems: 'center', gap: '4px', borderRight: 'none' }}>
                    <span style={{ minWidth: '20px' }}>{student.studentId || si + 1}.</span>
                    {isEditingFirst ? (
                      <input
                        autoFocus
                        className="g-input"
                        style={{ position: 'relative', height: '22px', width: '80px' }}
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') onSaveEdit()
                          if (e.key === 'Escape') onCancelEdit()
                        }}
                        onBlur={onCancelEdit}
                      />
                    ) : (
                      <span
                        onClick={() => onEditStudent(si, 'firstName')}
                        style={{ cursor: 'pointer', textDecoration: 'underline dotted' }}
                        title="Click to edit"
                      >
                        {student.firstName}
                      </span>
                    )}
                    {isEditingLast ? (
                      <input
                        autoFocus
                        className="g-input"
                        style={{ position: 'relative', height: '22px', width: '100px' }}
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') onSaveEdit()
                          if (e.key === 'Escape') onCancelEdit()
                        }}
                        onBlur={onCancelEdit}
                      />
                    ) : (
                      <span
                        onClick={() => onEditStudent(si, 'lastName')}
                        style={{ cursor: 'pointer', textDecoration: 'underline dotted' }}
                        title="Click to edit"
                      >
                        {student.lastName}
                      </span>
                    )}
                    <button
                      onClick={() => onDeleteStudent(si)}
                      style={{
                        marginLeft: 'auto',
                        background: 'none',
                        border: 'none',
                        color: '#a32d2d',
                        cursor: 'pointer',
                        fontSize: '14px',
                        padding: '2px 4px',
                      }}
                      title="Delete student"
                    >
                      ✕
                    </button>
                  </td>
                  {groups.map((g, gi) => (
                    <React.Fragment key={`grade-${g.name}-${si}`}>
                      {g.entries.map((e) => (
                        <GradeCell
                          key={e.idx}
                          value={(grades[si] && grades[si][e.idx]) || ''}
                          onSave={(v) => onGrade(si, e.idx, v)}
                        />
                      ))}
                      {gi < groups.length - 1 && <td className="sep-col" />}
                    </React.Fragment>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="legend">Click cell to enter grade (2–5, ОТ, УП, Н) · Hover date to delete lesson</div>
    </div>
  )
}

// AttendanceTab Component
interface AttendanceTabProps {
  students: Student[]
  dates: DateEntry[]
  attendance: AttValue[][]
  onSet: (si: number, di: number, v: AttValue) => void
}

function AttendanceTab({ students, dates, attendance, onSet }: AttendanceTabProps) {
  const [openDrop, setOpenDrop] = useState<OpenDrop>(null)

  useEffect(() => {
    function close(e: MouseEvent) {
      if (!(e.target as Element).closest('.att-cell')) setOpenDrop(null)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  return (
    <div>
      <div className="att-tbl-wrap">
        <table className="att-tbl">
          <thead>
            <tr>
              <th className="att-th-name">Students</th>
              {dates.map((d, di) => (
                <th key={di} className="att-th-day">
                  {d.d}
                </th>
              ))}
              <th className="att-th-stat">Absences</th>
              <th className="att-th-stat">Attendance %</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, si) => {
              const row = attendance[si] || []
              const total = dates.length
              const absent = row.filter((s) => s === 'absent').length
              const present = row.filter((s) => s === 'present').length
              const attendancePercent = total > 0 ? Math.round((present / total) * 100) : 0
              return (
                <tr key={student.id} className={si % 2 === 1 ? 'row-alt' : ''}>
                  <td className="att-name">
                    {student.studentId || si + 1}. {student.firstName} {student.lastName}
                  </td>
                  {dates.map((_, di) => {
                    const val = row[di] || 'present'
                    const st = ATT_STATUSES.find((s) => s.v === val) ?? ATT_STATUSES[0]
                    const isOpen = openDrop?.si === si && openDrop?.di === di
                    return (
                      <td
                        key={di}
                        className={`att-cell s-${val}`}
                        onClick={() => setOpenDrop(isOpen ? null : { si, di })}
                      >
                        {st.l}
                        {isOpen && (
                          <div className="att-drop">
                            {ATT_STATUSES.map((s) => (
                              <div
                                key={s.v}
                                className="att-opt"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onSet(si, di, s.v)
                                  setOpenDrop(null)
                                }}
                              >
                                <b>{s.l}</b> — {s.t}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    )
                  })}
                  <td className={`att-stat ${absent > 0 ? gColorClass(2) : gColorClass(5)}`}>
                    {absent}
                  </td>
                  <td className={`att-stat ${attendancePercent >= 75 ? gColorClass(5) : gColorClass(2)}`}>
                    {attendancePercent}%
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="att-legend">
        {ATT_STATUSES.map((s) => (
          <span key={s.v}>
            <b>{s.l}</b> — {s.t}
          </span>
        ))}
      </div>
    </div>
  )
}

// FinalTab Component
interface FinalTabProps {
  students: Student[]
  grades: GradeValue[][]
  finalOverride: FinalOverride
  onFin: (si: number, v: number) => void
}

function FinalTab({ students, grades, finalOverride, onFin }: FinalTabProps) {
  const rows = students.map((student, si) => {
    const avg = calcAvg(grades[si] || [])
    const fin = finalOverride[si] !== undefined ? finalOverride[si] : autoFin(avg)
    return { student, si, avg, fin }
  })

  const stats: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0 }
  rows.forEach((r) => {
    if (r.fin) stats[r.fin] = (stats[r.fin] ?? 0) + 1
  })
  const total = students.length
  const ku = total > 0 ? Math.round(((stats[4] ?? 0) + (stats[5] ?? 0)) / total * 100) : 0

  function handleFin(si: number, cur: number | null) {
    const v = prompt('Final Grade (2–5):', String(cur ?? ''))
    if (v && ['2', '3', '4', '5'].includes(v.trim())) onFin(si, +v.trim())
  }

  return (
    <div className="fin-section">
      <div className="stats-row">
        {([5, 4, 3, 2] as const).map((g) => (
          <div key={g} className="stat-card">
            <span className={`stat-g ${gColorClass(g)}`}>
              {g}
            </span>
            <span className="stat-n">{stats[g] ?? 0}</span>
            <span className="stat-p">{total > 0 ? Math.round(((stats[g] ?? 0) / total) * 100) : 0}%</span>
          </div>
        ))}
        <div className="stat-card">
          <span className="stat-g" style={{ color: 'var(--muted)' }}>
            QU
          </span>
          <span className="stat-n">{ku}%</span>
          <span className="stat-p">quality</span>
        </div>
      </div>

      <div className="fin-tbl-wrap">
        <table className="fin-tbl">
          <thead>
            <tr>
              <th className="fin-th-n">#</th>
              <th className="fin-th-name">Student</th>
              <th className="fin-th-v">Average</th>
              <th className="fin-th-v">Final</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ student, si, avg, fin }) => (
              <tr key={student.id} className={si % 2 === 1 ? 'row-alt' : ''}>
                <td className="fin-num">{student.studentId || si + 1}</td>
                <td className="fin-name">
                  {student.firstName} {student.lastName}
                </td>
                <td className="fin-avg">{avg ?? '—'}</td>
                <td className={`fin-fin ${gColorClass(fin)}`} onClick={() => handleFin(si, fin)}>
                  {fin ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Main JournalContainer
const TABS = ['Journal'] as const

export default function JournalContainer() {
  const [tab, setTab] = useState(0)
  const [selectedClassId, setSelectedClassId] = useState(() => {
    return localStorage.getItem('journal-selected-class') || ''
  })
  const [selectedSubjectId, setSelectedSubjectId] = useState(() => {
    return localStorage.getItem('journal-selected-subject') || ''
  })

  const [students, setStudents] = useState<Student[]>([])
  const [dates, setDates] = useState<DateEntry[]>([])
  const [grades, setGrades] = useState<GradeValue[][]>([])
  const [attendance, setAttendance] = useState<AttValue[][]>([])
  const [finalOverride, setFinalOverride] = useState<FinalOverride>({})
  const [conducted, setConducted] = useState<boolean[]>([])
  const [editingStudent, setEditingStudent] = useState<{ si: number; field: 'firstName' | 'lastName' } | null>(null)
  const [editDraft, setEditDraft] = useState('')
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [newStudentId, setNewStudentId] = useState('')
  const [newStudentFirstName, setNewStudentFirstName] = useState('')
  const [newStudentLastName, setNewStudentLastName] = useState('')
  const [showPrintSettings, setShowPrintSettings] = useState(false)

  const classes = loadClasses()
  const subjects = loadSubjects()
  const periods = loadPeriods()

  // Get available subjects for selected class
  const selectedClass = classes.find(c => c.id === selectedClassId)
  const availableSubjects = selectedClass?.subjectIds
    ? subjects.filter(s => selectedClass.subjectIds?.includes(s.id))
    : []

  // Auto-select first class on mount
  useEffect(() => {
    if (!selectedClassId && classes.length > 0) {
      setSelectedClassId(classes[0].id)
    }
  }, [classes, selectedClassId])

  // Auto-select first subject when class changes
  useEffect(() => {
    if (selectedClassId && availableSubjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(availableSubjects[0].id)
    }
  }, [selectedClassId, availableSubjects, selectedSubjectId])

  // Load students and journal data when class or subject changes
  useEffect(() => {
    console.log('JournalContainer: Loading data for class', selectedClassId, 'subject', selectedSubjectId)
    loadStudentsAndJournalData()

    function handleUpdate() {
      console.log('JournalContainer: students-changed event received')
      loadStudentsAndJournalData()
    }

    window.addEventListener('students-changed', handleUpdate)
    window.addEventListener('references-changed', handleUpdate)
    return () => {
      window.removeEventListener('students-changed', handleUpdate)
      window.removeEventListener('references-changed', handleUpdate)
    }
  }, [selectedClassId, selectedSubjectId])

  function loadStudentsAndJournalData() {
    if (!selectedClassId) {
      setStudents([])
      setDates([])
      setGrades([])
      setAttendance([])
      setFinalOverride({})
      setConducted([])
      return
    }

    // Load students for the class (независимо от предмета)
    const allStudents = loadStudents()
    const filtered = allStudents.filter((s) => s.classId === selectedClassId)
    console.log('Filtered students for class:', filtered)
    setStudents(filtered)

    // Load journal data only if subject is selected
    if (!selectedSubjectId) {
      setDates([])
      setGrades([])
      setAttendance([])
      setFinalOverride({})
      setConducted([])
      return
    }

    // Load or initialize journal data for this class + subject combination
    const userId = getCurrentUserId()
    if (!userId) return

    const key = `journal_${userId}_${selectedClassId}_${selectedSubjectId}`
    const saved = localStorage.getItem(key)

    if (saved) {
      const data = JSON.parse(saved)
      setDates(data.dates || [])

      // Sync arrays with current student count
      const needed = filtered.length
      const savedGrades = data.grades || []
      const savedAtt = data.attendance || []

      while (savedGrades.length < needed) {
        savedGrades.push(Array(data.dates?.length || 0).fill(''))
      }
      while (savedAtt.length < needed) {
        savedAtt.push(Array(data.dates?.length || 0).fill('present'))
      }

      setGrades(savedGrades)
      setAttendance(savedAtt)
      setFinalOverride(data.finalOverride || {})
      setConducted(data.conducted || Array(data.dates?.length || 0).fill(true))
    } else {
      // Initialize empty
      setDates([])
      setGrades(filtered.map(() => []))
      setAttendance(filtered.map(() => []))
      setFinalOverride({})
      setConducted([])
    }
  }

  // Save selected class and subject to localStorage
  useEffect(() => {
    if (selectedClassId) {
      localStorage.setItem('journal-selected-class', selectedClassId)
    }
  }, [selectedClassId])

  useEffect(() => {
    if (selectedSubjectId) {
      localStorage.setItem('journal-selected-subject', selectedSubjectId)
    }
  }, [selectedSubjectId])

  // Save journal data when it changes
  useEffect(() => {
    if (!selectedClassId || !selectedSubjectId || students.length === 0) return

    const userId = getCurrentUserId()
    if (!userId) return

    const key = `journal_${userId}_${selectedClassId}_${selectedSubjectId}`
    const data = { dates, grades, attendance, finalOverride, conducted }
    localStorage.setItem(key, JSON.stringify(data))
    console.log('Journal data saved:', key, data)
  }, [selectedClassId, selectedSubjectId, dates, grades, attendance, finalOverride, conducted, students])

  function addLesson(month: string, day: number, title?: string, type?: ColumnType): void {
    const newEntry: DateEntry = { m: month, d: day }
    if (title) newEntry.title = title
    if (type) newEntry.type = type

    setDates((prev) => [...prev, newEntry])
    setGrades((prev) => prev.map((r) => [...r, '']))
    setAttendance((prev) => prev.map((r) => [...r, 'present']))
    setConducted((prev) => [...prev, false])
  }

  function delLesson(idx: number): void {
    if (!window.confirm(`Delete lesson ${dates[idx].m} ${dates[idx].d}?`)) return
    setDates((prev) => prev.filter((_, i) => i !== idx))
    setGrades((prev) => prev.map((r) => r.filter((_, i) => i !== idx)))
    setAttendance((prev) => prev.map((r) => r.filter((_, i) => i !== idx)))
    setConducted((prev) => prev.filter((_, i) => i !== idx))
  }

  function setGrade(si: number, ci: number, value: GradeValue): void {
    setGrades((prev) => {
      const newGrades = [...prev]
      if (!newGrades[si]) newGrades[si] = []
      newGrades[si] = [...newGrades[si]]
      newGrades[si][ci] = value
      return newGrades
    })

    // Автоматическая синхронизация с посещаемостью: AB → absent, остальное → present
    setAttendance((prev) => {
      const newAtt = [...prev]
      if (!newAtt[si]) newAtt[si] = []
      newAtt[si] = [...newAtt[si]]
      newAtt[si][ci] = value.toUpperCase() === 'AB' ? 'absent' : 'present'
      return newAtt
    })
  }

  function setFin(si: number, value: number): void {
    setFinalOverride((prev) => ({ ...prev, [si]: value }))
  }

  function setAtt(si: number, di: number, value: AttValue): void {
    setAttendance((prev) => {
      const newAtt = [...prev]
      if (!newAtt[si]) newAtt[si] = []
      newAtt[si] = [...newAtt[si]]
      newAtt[si][di] = value
      return newAtt
    })
  }

  function handleEditStudent(si: number, field: 'firstName' | 'lastName') {
    setEditingStudent({ si, field })
    setEditDraft(students[si][field])
  }

  function saveEditStudent() {
    console.log('saveEditStudent called', { editingStudent, editDraft })
    if (!editingStudent) {
      console.log('No editing student, returning')
      return
    }
    const student = students[editingStudent.si]
    console.log('Updating student:', student.id, editingStudent.field, editDraft.trim())
    updateStudent(student.id, { [editingStudent.field]: editDraft.trim() })

    // Reload students
    loadStudentsAndJournalData()
    setEditingStudent(null)
    console.log('Student updated successfully')
  }

  function cancelEdit() {
    setEditingStudent(null)
    setEditDraft('')
  }

  function handleDeleteStudent(si: number) {
    const student = students[si]
    if (!confirm(`Delete ${student.firstName} ${student.lastName}?`)) return

    deleteStudent(student.id)

    // Remove from grades, attendance, finalOverride
    setGrades((prev) => prev.filter((_, i) => i !== si))
    setAttendance((prev) => prev.filter((_, i) => i !== si))
    setFinalOverride((prev) => {
      const newOverride = { ...prev }
      delete newOverride[si]
      // Shift down indices
      const shifted: FinalOverride = {}
      Object.keys(newOverride).forEach((key) => {
        const idx = parseInt(key)
        if (idx > si) {
          shifted[idx - 1] = newOverride[idx]
        } else {
          shifted[idx] = newOverride[idx]
        }
      })
      return shifted
    })
  }

  function handleDeleteClass() {
    if (!selectedClassId) return

    const className = classes.find((c) => c.id === selectedClassId)?.name
    const confirmMsg = `Delete all students in class "${className}"?\n\nThis will delete:\n- ${students.length} students\n- All grades and attendance\n- The class from the list\n\nThis cannot be undone!`

    if (!confirm(confirmMsg)) return

    // Delete all students in this class
    students.forEach((s) => deleteStudent(s.id))

    // Delete journal data for all subjects in this class
    const userId = getCurrentUserId()
    if (userId) {
      const classSubjects = selectedClass?.subjectIds || []
      classSubjects.forEach(subjectId => {
        const key = `journal_${userId}_${selectedClassId}_${subjectId}`
        localStorage.removeItem(key)
      })
    }

    // Delete the class itself
    deleteClass(selectedClassId)

    // Reset
    setSelectedClassId('')
    setSelectedSubjectId('')
    setStudents([])
    setDates([])
    setGrades([])
    setAttendance([])
    setFinalOverride({})
    setConducted([])
  }

  function handleAddStudent() {
    if (!selectedClassId) return
    if (!newStudentId.trim() || !newStudentFirstName.trim() || !newStudentLastName.trim()) {
      alert('Please enter ID, first name and last name')
      return
    }

    // Check if ID already exists in this class
    const existingStudents = loadStudents()
    const sameClassStudents = existingStudents.filter((s) => s.classId === selectedClassId)
    const idExists = sameClassStudents.some((s) => s.studentId === newStudentId.trim())

    if (idExists) {
      alert('Student ID already exists in this class')
      return
    }

    // Create new student with default subject and period
    const newStudent: Student = {
      id: `student-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      studentId: newStudentId.trim(),
      firstName: newStudentFirstName.trim(),
      lastName: newStudentLastName.trim(),
      classId: selectedClassId,
      subjectId: subjects[0]?.id || '1',
      periodId: periods[0]?.id || '1',
      createdAt: Date.now(),
    }

    addStudent(newStudent)

    // Reset form
    setNewStudentId('')
    setNewStudentFirstName('')
    setNewStudentLastName('')
    setShowAddStudent(false)

    // Reload students
    loadStudentsAndJournalData()
  }

  const ready = selectedClassId && students.length > 0

  // Get subject name from selected subject
  const subjectName = selectedSubjectId
    ? subjects.find(s => s.id === selectedSubjectId)?.name || ''
    : ''

  function handlePrint(settings: {
    selectedStudentId: string
    showAllGrades: boolean
    showAttendance: boolean
  }) {
    const className = classes.find((c) => c.id === selectedClassId)?.name || ''
    const periodName = new Date().toLocaleDateString('ru-RU', {
      month: 'long',
      year: 'numeric',
    })

    const printData: PrintData = {
      className,
      subjectName,
      periodName,
      students,
      dates,
      grades,
      finalOverride,
      showAllGrades: settings.showAllGrades,
      showAttendance: settings.showAttendance,
      attendance,
      selectedStudentId: settings.selectedStudentId,
    }

    openPrintWindow(printData)
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <style>{`
        .flex.flex-1.flex-col.gap-6 {
          --bg:var(--bg-page);--surface:var(--bg-surface);--surface1:var(--bg-surface-hover);
          --border:var(--border);--border-s:var(--border-strong, #b0afa8);
          --text:var(--text-primary);--text2:var(--text-secondary);--muted:var(--text-muted);
          --accent:var(--accent);--accent-bg:var(--bg-hover);
          --g5:var(--grade-5);--g5bg:var(--bg-hover);
          --g4:var(--grade-4);--g4bg:var(--bg-hover);
          --g3:var(--grade-3);--g3bg:var(--bg-hover);
          --g2:var(--grade-2);--g2bg:var(--bg-error);
          --r:8px;--r-sm:4px;
        }
        .toolbar{margin-bottom:10px;display:flex;gap:8px;align-items:center}
        .btn{padding:5px 13px;background:var(--accent);color:#fff;border:none;border-radius:var(--r-sm);font-size:12px;font-weight:500;cursor:pointer}
        .btn:hover{opacity:.88}
        .btn-ghost{background:transparent;color:var(--text2);border:0.5px solid var(--border-s)}
        .btn-ghost:hover{background:var(--bg);opacity:1}
        .date-inp{padding:5px 9px;border:0.5px solid var(--border-s);border-radius:var(--r-sm);background:var(--surface)}
        .tbl-wrap{overflow-x:auto;border:1px solid var(--border-s);border-radius:var(--r)}
        table{border-collapse:collapse;table-layout:fixed;width:auto}
        th,td{border:0.5px solid var(--border);padding:0;text-align:center;white-space:nowrap}
        .th-name{text-align:left;padding:6px 11px;background:var(--accent-bg);color:var(--accent);font-weight:500;font-size:12px;min-width:245px;max-width:245px;width:245px;position:sticky;left:0;z-index:3}
        .th-month{background:var(--accent-bg);color:var(--accent);font-weight:500;font-size:11px;padding:4px 6px;min-width:26px}
        .th-day{background:var(--surface);font-size:11px;color:var(--text2);font-weight:400;padding:3px 2px;min-width:26px;position:relative}
        .th-day .del-btn{display:none;font-size:10px;color:var(--g2);cursor:pointer;background:none;border:none;padding:0;line-height:1}
        .th-day:hover .del-btn{display:block}
        .th-day-test{background:#fff3cd;color:#856404;font-weight:600}
        .th-day-exam{background:#f8d7da;color:#721c24;font-weight:600}
        .th-day-homework{background:#d1ecf1;color:#0c5460;font-weight:600}
        .th-cb{background:var(--surface);padding:4px 2px;min-width:26px;cursor:pointer}
        .cb-wrap{display:flex;align-items:center;justify-content:center;height:26px}
        .cb{width:14px;height:14px;border-radius:2px;border:1.5px solid var(--border-s);display:flex;align-items:center;justify-content:center;background:var(--surface)}
        .cb.checked{background:var(--accent);border-color:var(--accent)}
        .cb.checked::after{content:'✓';color:white;font-size:10px;font-weight:700}
        .th-sum{background:var(--accent-bg);color:var(--accent);font-size:11px;font-weight:500;padding:4px 5px;min-width:56px}
        .sep-col{background:var(--border)!important;width:5px;padding:0;border:none}
        .td-name{text-align:left;padding:4px 11px;font-size:12px;background:var(--surface);min-width:245px;max-width:245px;width:245px;position:sticky;left:0;z-index:1}
        .row-alt td{background:var(--surface1)}.row-alt .td-name{background:var(--surface1)}
        tbody tr:hover td{background:var(--accent-bg)!important}
        .g-cell{width:26px;height:26px;text-align:center;vertical-align:middle;cursor:pointer;padding:0;position:relative}
        .g-val{font-size:13px;font-weight:500;line-height:26px;display:block}
        .g-val.g5{color:var(--g5)}
        .g-val.g4{color:var(--g4)}
        .g-val.g3{color:var(--g3)}
        .g-val.g2{color:var(--g2)}
        .g-val.sp{color:var(--muted)}
        .td-avg{font-size:12px;font-weight:500;color:var(--text2);padding:0 5px}
        .td-fin{font-size:13px;font-weight:600;padding:0 5px;cursor:pointer}
        .td-fin:hover{background:var(--g5bg)!important}
        .g-input{position:absolute;inset:0;width:100%;height:100%;text-align:center;font-size:12px;font-weight:500;border:1.5px solid var(--accent);border-radius:3px;background:var(--surface);color:var(--text);padding:0;outline:none}
        .legend{margin-top:8px;font-size:11px;color:var(--muted)}
        .att-tbl-wrap{overflow-x:auto;border:1px solid var(--border-s);border-radius:var(--r)}
        .att-tbl{border-collapse:collapse;width:100%;min-width:600px}
        .att-tbl th,.att-tbl td{border:0.5px solid var(--border);text-align:center;white-space:nowrap}
        .att-th-name{text-align:left;padding:5px 11px;background:var(--accent-bg);color:var(--accent);font-size:12px;font-weight:500;min-width:170px}
        .att-th-day{background:var(--surface);font-size:10px;color:var(--text2);padding:3px 2px;min-width:27px}
        .att-th-stat{background:var(--accent-bg);color:var(--accent);font-size:11px;padding:4px 8px}
        .att-name{text-align:left;padding:4px 11px;font-size:12px}
        .att-cell{cursor:pointer;font-size:11px;font-weight:500;height:27px;position:relative}
        .att-cell:hover{background:var(--accent-bg)!important}
        .s-present{color:var(--g5)}.s-absent{color:var(--g2);background:var(--g2bg)}.s-late{color:var(--g3)}.s-excused{color:var(--muted)}
        .att-stat{font-weight:600;font-size:12px;padding:0 8px}
        .att-drop{position:absolute;top:100%;left:0;z-index:100;background:var(--surface);border:0.5px solid var(--border-s);border-radius:var(--r-sm);min-width:155px;box-shadow:0 4px 12px rgba(0,0,0,.1)}
        .att-opt{padding:6px 11px;font-size:11px;cursor:pointer;text-align:left;color:var(--text)}
        .att-opt:hover{background:var(--accent-bg)}
        .att-legend{display:flex;gap:14px;flex-wrap:wrap;margin-top:8px;font-size:11px;color:var(--muted)}
        .att-legend b{color:var(--text2)}
        .fin-section{display:flex;flex-direction:column;gap:16px}
        .stats-row{display:flex;gap:10px;flex-wrap:wrap}
        .stat-card{display:flex;flex-direction:column;align-items:center;gap:2px;padding:9px 18px;border:1.5px solid var(--border);border-radius:var(--r);background:var(--surface);min-width:68px}
        .stat-g{font-size:21px;font-weight:500;line-height:1}
        .stat-n{font-size:17px;font-weight:500}
        .stat-p{font-size:10px;color:var(--muted)}
        .fin-tbl-wrap{overflow-x:auto;border:0.5px solid var(--border-s);border-radius:var(--r);max-width:440px}
        .fin-tbl{border-collapse:collapse;width:100%}
        .fin-tbl th,.fin-tbl td{border:0.5px solid var(--border);padding:0;text-align:center}
        .fin-th-n{padding:5px;background:var(--accent-bg);color:var(--accent);font-size:11px;width:34px}
        .fin-th-name{text-align:left;padding:5px 11px;background:var(--accent-bg);color:var(--accent);font-size:12px;font-weight:500}
        .fin-th-v{padding:5px 8px;background:var(--accent-bg);color:var(--accent);font-size:11px;min-width:62px}
        .fin-num{color:var(--muted);font-size:11px;padding:4px}
        .fin-name{text-align:left;padding:4px 11px;font-size:12px}
        .fin-avg{font-size:11px;color:var(--text2);font-weight:500;padding:0 6px}
        .fin-fin{font-size:13px;font-weight:600;padding:0 6px;cursor:pointer}
        .fin-fin:hover{background:var(--g5bg)!important}
        .grade-dropdown{position:absolute;top:100%;left:50%;transform:translateX(-50%);z-index:100;background:var(--surface);border:1px solid var(--border-s);border-radius:var(--r-sm);box-shadow:0 4px 12px rgba(0,0,0,.15);min-width:60px;margin-top:2px}
        .grade-option{padding:6px 12px;font-size:14px;font-weight:500;cursor:pointer;text-align:center;color:var(--text);transition:background .15s}
        .grade-option:hover{background:var(--accent-bg)}
        .grade-option:first-child{border-radius:var(--r-sm) var(--r-sm) 0 0}
        .grade-option:last-child{border-radius:0 0 var(--r-sm) var(--r-sm)}
        .grade-color-5{color:var(--g5)}
        .grade-color-4{color:var(--g4)}
        .grade-color-3{color:var(--g3)}
        .grade-color-2{color:var(--g2)}
        table{background:var(--surface)}
        .tbl-wrap{background:var(--surface)}
        .att-tbl-wrap{background:var(--surface)}
        .att-tbl{background:var(--surface)}
        .fin-tbl-wrap{background:var(--surface)}
        .fin-tbl{background:var(--surface)}
        .td-name{color:var(--text)}
        .att-name{color:var(--text)}
        .fin-name{color:var(--text)}
        .stat-g{color:var(--text)}
        .stat-n{color:var(--text)}
      `}</style>

      {/* Controls */}
      {classes.length > 0 && (
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="rounded-lg px-4 py-3 text-sm outline-none transition-colors"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {selectedClassId && availableSubjects.length > 0 && (
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="rounded-lg px-4 py-3 text-sm outline-none transition-colors"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <option value="">Select Subject</option>
              {availableSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}

          {selectedClassId && !showAddStudent && (
            <button
              onClick={() => setShowAddStudent(true)}
              className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: 'var(--accent)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent)'}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Student
            </button>
          )}

          {showAddStudent && (
            <>
              <input
                type="text"
                value={newStudentId}
                onChange={(e) => setNewStudentId(e.target.value)}
                placeholder="ID (e.g., 1, 2, 3)"
                className="w-24 rounded-lg px-4 py-3 text-sm outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                autoFocus
              />
              <input
                type="text"
                value={newStudentFirstName}
                onChange={(e) => setNewStudentFirstName(e.target.value)}
                placeholder="First Name"
                className="rounded-lg px-4 py-3 text-sm outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              />
              <input
                type="text"
                value={newStudentLastName}
                onChange={(e) => setNewStudentLastName(e.target.value)}
                placeholder="Last Name"
                className="rounded-lg px-4 py-3 text-sm outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}

                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddStudent()
                  if (e.key === 'Escape') setShowAddStudent(false)
                }}
              />
              <button
                onClick={handleAddStudent}
                className="rounded-lg bg-[#457B9D] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1D3557]"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowAddStudent(false)
                  setNewStudentId('')
                  setNewStudentFirstName('')
                  setNewStudentLastName('')
                }}
                className="rounded-lg border border-[#DCE8F5] px-4 py-3 text-sm font-medium text-[#1D3557] transition-colors hover:bg-[#DCE8F5]"
              >
                Cancel
              </button>
            </>
          )}

          {ready && (
            <div className="ml-auto flex gap-3">
              <button
                onClick={() => setShowPrintSettings(true)}
                className="flex items-center gap-2 rounded-lg border border-[#457B9D] px-4 py-3 text-sm font-medium text-[#457B9D] transition-colors hover:bg-[#457B9D] hover:text-white"
                title="Печать журнала"
              >
                <img
                  src="/printer-icon.png"
                  alt="Печать"
                  className="h-5 w-5"
                />
                Печать
              </button>
              <button
                onClick={handleDeleteClass}
                className="flex items-center gap-2 rounded-lg border-2 border-red-500 px-4 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-500 hover:text-white"
                title="Delete this class"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete Class
              </button>
            </div>
          )}
        </div>
      )}

      {/* Warning if no subjects assigned */}
      {selectedClassId && availableSubjects.length === 0 && students.length > 0 && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ No subjects assigned to this class. Please re-import students and select subjects.
          </p>
        </div>
      )}

      {/* Journal content */}
      {ready && selectedSubjectId ? (
        <>
          {/* Tab content */}
          <div>
            <JournalTab
              students={students}
              dates={dates}
              grades={grades}
              finalOverride={finalOverride}
              conducted={conducted}
              subjectName={subjectName}
              onGrade={setGrade}
              onFin={setFin}
              onAddLesson={addLesson}
              onDelLesson={delLesson}
              setConducted={setConducted}
              editingStudent={editingStudent}
              editDraft={editDraft}
              onEditStudent={handleEditStudent}
              onSaveEdit={saveEditStudent}
              onCancelEdit={cancelEdit}
              setEditDraft={setEditDraft}
              onDeleteStudent={handleDeleteStudent}
            />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-[#DCE8F5] py-16">
          <svg className="h-16 w-16 text-[#ACACAC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <div className="text-center">
            <p className="text-lg font-medium text-[#1D3557]">
              {!selectedClassId
                ? 'Select a class'
                : !selectedSubjectId
                ? 'Select a subject'
                : 'No students in this class'}
            </p>
            <p className="text-sm text-[#ACACAC]">
              {!selectedClassId
                ? 'Choose a class from the dropdown above'
                : !selectedSubjectId
                ? 'Choose a subject from the dropdown above'
                : 'Import students for this class first'}
            </p>
          </div>
        </div>
      )}

      {/* Print Settings Modal */}
      {showPrintSettings && (
        <PrintSettingsModal
          students={students}
          onPrint={handlePrint}
          onClose={() => setShowPrintSettings(false)}
        />
      )}
    </div>
  )
}
