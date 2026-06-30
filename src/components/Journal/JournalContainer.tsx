import React, { useState, useEffect, useMemo, useRef } from 'react'
import { loadClasses, loadSubjects, loadPeriods, deleteClass } from '../../lib/referencesStore'
import { loadStudents, updateStudent, deleteStudent, addStudent } from '../../lib/studentsStore'
import type { Student } from '../../data/students'

// Types
interface DateEntry {
  m: string
  d: number
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

function gColor(v: number | string | null): string {
  const n = typeof v === 'string' ? +v : v
  if (n === 5) return '#1a7a2a'
  if (n === 4) return '#185fa5'
  if (n === 3) return '#854f0b'
  if (n === 2) return '#a32d2d'
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
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  return (
    <td className="g-cell" onClick={() => setShowDropdown(true)} style={{ position: 'relative' }}>
      <span className={`g-val ${gClass(value)}`}>{value}</span>
      {showDropdown && (
        <div ref={dropdownRef} className="grade-dropdown">
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
  onAddLesson: (month: string, day: number) => void
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
        <div style={{ position: 'absolute', left: 0 }}>
          {!showAdd && (
            <button className="btn" onClick={() => setShowAdd(true)}>
              + Add Lesson
            </button>
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
                  {g.entries.map((e) => (
                    <th key={e.idx} className="th-day" title={`${e.m} ${e.d}`}>
                      <span>{e.d}</span>
                      <button className="del-btn" onClick={() => onDelLesson(e.idx)}>
                        ✕
                      </button>
                    </th>
                  ))}
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
                        onBlur={onSaveEdit}
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
                        onBlur={onSaveEdit}
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
            </tr>
          </thead>
          <tbody>
            {students.map((student, si) => {
              const row = attendance[si] || []
              const absent = row.filter((s) => s === 'absent').length
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
                  <td className="att-stat" style={{ color: absent > 0 ? gColor(2) : gColor(5) }}>
                    {absent}
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
          <div key={g} className="stat-card" style={{ borderColor: gColor(g) }}>
            <span className="stat-g" style={{ color: gColor(g) }}>
              {g}
            </span>
            <span className="stat-n">{stats[g] ?? 0}</span>
            <span className="stat-p">{total > 0 ? Math.round(((stats[g] ?? 0) / total) * 100) : 0}%</span>
          </div>
        ))}
        <div className="stat-card">
          <span className="stat-g" style={{ color: '#9a9a94' }}>
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
                <td className="fin-fin" style={{ color: gColor(fin) }} onClick={() => handleFin(si, fin)}>
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
const TABS = ['Journal', 'Attendance', 'Final Grades'] as const

export default function JournalContainer() {
  const [tab, setTab] = useState(0)
  const [selectedClassId, setSelectedClassId] = useState('')

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

  const classes = loadClasses()
  const subjects = loadSubjects()
  const periods = loadPeriods()

  // Auto-select first class on mount
  useEffect(() => {
    if (!selectedClassId && classes.length > 0) {
      setSelectedClassId(classes[0].id)
    }
  }, [classes, selectedClassId])

  // Load students when class changes
  useEffect(() => {
    console.log('JournalContainer: Loading students for class', selectedClassId)
    loadStudentsForClass()

    function handleUpdate() {
      console.log('JournalContainer: students-changed event received')
      loadStudentsForClass()
    }

    window.addEventListener('students-changed', handleUpdate)
    window.addEventListener('references-changed', handleUpdate)
    return () => {
      window.removeEventListener('students-changed', handleUpdate)
      window.removeEventListener('references-changed', handleUpdate)
    }
  }, [selectedClassId])

  function loadStudentsForClass() {
    if (!selectedClassId) {
      setStudents([])
      return
    }

    const allStudents = loadStudents()
    const filtered = allStudents.filter((s) => s.classId === selectedClassId)
    console.log('Filtered students for class:', filtered)
    setStudents(filtered)

    // Load or initialize journal data for this class
    const key = `journal_class_${selectedClassId}`
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

  // Save journal data when it changes
  useEffect(() => {
    if (!selectedClassId || students.length === 0) return

    const key = `journal_class_${selectedClassId}`
    const data = { dates, grades, attendance, finalOverride, conducted }
    localStorage.setItem(key, JSON.stringify(data))
  }, [selectedClassId, dates, grades, attendance, finalOverride, conducted, students])

  function addLesson(month: string, day: number): void {
    setDates((prev) => [...prev, { m: month, d: day }])
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
    if (!editingStudent) return
    const student = students[editingStudent.si]
    updateStudent(student.id, { [editingStudent.field]: editDraft.trim() })

    // Reload students
    loadStudentsForClass()
    setEditingStudent(null)
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

    // Delete journal data for this class
    const key = `journal_class_${selectedClassId}`
    localStorage.removeItem(key)

    // Delete the class itself
    deleteClass(selectedClassId)

    // Reset
    setSelectedClassId('')
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
    loadStudentsForClass()
  }

  const ready = selectedClassId && students.length > 0

  // Get subject name from first student
  const subjectName = students.length > 0 && students[0].subjectId
    ? subjects.find(s => s.id === students[0].subjectId)?.name || ''
    : ''


  return (
    <div className="flex flex-1 flex-col gap-6">
      <style>{`
        :root {
          --bg:#f5f5f0;--surface:#fff;--surface1:#f8f8f6;
          --border:#d0cfc8;--border-s:#b0afa8;
          --text:#1a1a18;--text2:#5a5a56;--muted:#9a9a94;
          --accent:#185fa5;--accent-bg:#e6f1fb;
          --g5:#1a7a2a;--g5bg:#eaf3de;
          --g4:#185fa5;--g4bg:#e6f1fb;
          --g3:#854f0b;--g3bg:#faeeda;
          --g2:#a32d2d;--g2bg:#fcebeb;
          --r:8px;--r-sm:4px;
        }
        .toolbar{margin-bottom:10px;display:flex;gap:8px;align-items:center}
        .btn{padding:5px 13px;background:var(--accent);color:#fff;border:none;border-radius:var(--r-sm);font-size:12px;font-weight:500;cursor:pointer}
        .btn:hover{opacity:.88}
        .btn-ghost{background:transparent;color:var(--text2);border:0.5px solid var(--border-s)}
        .btn-ghost:hover{background:var(--bg);opacity:1}
        .date-inp{padding:5px 9px;border:0.5px solid var(--border-s);border-radius:var(--r-sm);background:var(--surface)}
        .tbl-wrap{overflow-x:auto;border:1px solid var(--border-s);border-radius:var(--r)}
        table{border-collapse:collapse;width:100%;min-width:700px}
        th,td{border:0.5px solid var(--border);padding:0;text-align:center;white-space:nowrap}
        .th-name{text-align:left;padding:6px 11px;background:var(--accent-bg);color:var(--accent);font-weight:500;font-size:12px;min-width:227px;max-width:227px;width:227px;position:sticky;left:0;z-index:3}
        .th-month{background:var(--accent-bg);color:var(--accent);font-weight:500;font-size:11px;padding:4px 6px;min-width:26px}
        .th-day{background:#f0f4f8;font-size:11px;color:var(--text2);font-weight:400;padding:3px 2px;min-width:26px;position:relative}
        .th-day .del-btn{display:none;font-size:10px;color:var(--g2);cursor:pointer;background:none;border:none;padding:0;line-height:1}
        .th-day:hover .del-btn{display:block}
        .th-cb{background:#f0f4fa;padding:4px 2px;min-width:26px;cursor:pointer}
        .cb-wrap{display:flex;align-items:center;justify-content:center;height:26px}
        .cb{width:14px;height:14px;border-radius:2px;border:1.5px solid var(--border-s);display:flex;align-items:center;justify-content:center;background:white}
        .cb.checked{background:var(--accent);border-color:var(--accent)}
        .cb.checked::after{content:'✓';color:white;font-size:10px;font-weight:700}
        .th-sum{background:var(--accent-bg);color:var(--accent);font-size:11px;font-weight:500;padding:4px 5px;min-width:56px}
        .sep-col{background:#ebebea!important;width:5px;padding:0;border:none}
        .td-name{text-align:left;padding:4px 11px;font-size:12px;background:var(--surface);min-width:227px;max-width:227px;width:227px;position:sticky;left:0;z-index:1}
        .row-alt td{background:var(--surface1)}.row-alt .td-name{background:var(--surface1)}
        tbody tr:hover td{background:var(--accent-bg)!important}
        .g-cell{padding:1px;cursor:pointer;height:27px;min-width:26px;position:relative}
        .g-cell:hover{background:var(--g5bg)!important}
        .g-val{font-size:15px;font-weight:500;display:block;line-height:27px}
        .g5{color:var(--g5)}.g4{color:var(--g4)}.g3{color:var(--g3)}.g2{color:var(--g2)}.sp{color:var(--muted)}
        .td-avg{font-size:12px;font-weight:500;color:var(--text2);padding:0 5px}
        .td-fin{font-size:13px;font-weight:600;padding:0 5px;cursor:pointer}
        .td-fin:hover{background:var(--g5bg)!important}
        .g-input{position:absolute;inset:0;width:100%;height:100%;text-align:center;font-size:12px;font-weight:500;border:1.5px solid var(--accent);border-radius:3px;background:#fff;color:var(--text);padding:0;outline:none}
        .legend{margin-top:8px;font-size:11px;color:var(--muted)}
        .att-tbl-wrap{overflow-x:auto;border:1px solid var(--border-s);border-radius:var(--r)}
        .att-tbl{border-collapse:collapse;width:100%;min-width:600px}
        .att-tbl th,.att-tbl td{border:0.5px solid var(--border);text-align:center;white-space:nowrap}
        .att-th-name{text-align:left;padding:5px 11px;background:var(--accent-bg);color:var(--accent);font-size:12px;font-weight:500;min-width:170px}
        .att-th-day{background:#f0f4f8;font-size:10px;color:var(--text2);padding:3px 2px;min-width:27px}
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
      `}</style>

      {/* Controls */}
      {classes.length > 0 && (
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="rounded-lg border border-[#DCE8F5] px-4 py-3 text-sm text-[#1D3557] outline-none transition-colors focus:border-[#457B9D]"
          >
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {selectedClassId && !showAddStudent && (
            <button
              onClick={() => setShowAddStudent(true)}
              className="flex items-center gap-2 rounded-lg bg-[#457B9D] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1D3557]"
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
                className="w-24 rounded-lg border border-[#DCE8F5] px-4 py-3 text-sm text-[#1D3557] outline-none transition-colors focus:border-[#457B9D]"
                autoFocus
              />
              <input
                type="text"
                value={newStudentFirstName}
                onChange={(e) => setNewStudentFirstName(e.target.value)}
                placeholder="First Name"
                className="rounded-lg border border-[#DCE8F5] px-4 py-3 text-sm text-[#1D3557] outline-none transition-colors focus:border-[#457B9D]"
              />
              <input
                type="text"
                value={newStudentLastName}
                onChange={(e) => setNewStudentLastName(e.target.value)}
                placeholder="Last Name"
                className="rounded-lg border border-[#DCE8F5] px-4 py-3 text-sm text-[#1D3557] outline-none transition-colors focus:border-[#457B9D]"
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
            <button
              onClick={handleDeleteClass}
              className="ml-auto flex items-center gap-2 rounded-lg border-2 border-red-500 px-4 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-500 hover:text-white"
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
          )}
        </div>
      )}

      {/* Tabs */}
      {ready ? (
        <>
          <div className="flex gap-2 border-b border-[#DCE8F5]">
            {TABS.map((t, i) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(i)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  tab === i
                    ? 'border-b-2 border-[#457B9D] text-[#457B9D]'
                    : 'text-[#ACACAC] hover:text-[#457B9D]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div>
            {tab === 0 && (
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
            )}
            {tab === 1 && <AttendanceTab students={students} dates={dates} attendance={attendance} onSet={setAtt} />}
            {tab === 2 && (
              <FinalTab students={students} grades={grades} finalOverride={finalOverride} onFin={setFin} />
            )}
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
              {!selectedClassId ? 'Select a class' : 'No students in this class'}
            </p>
            <p className="text-sm text-[#ACACAC]">
              {!selectedClassId ? 'Choose a class from the dropdown above' : 'Import students for this class first'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
