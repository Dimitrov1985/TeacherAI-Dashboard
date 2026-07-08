// pages/AttendancePage.tsx — визуализация посещаемости
import { useState, useEffect, useMemo } from 'react'
import { loadClasses, loadSubjects } from '../lib/referencesStore'
import { loadStudents } from '../lib/studentsStore'
import { getCurrentUserId } from '../lib/auth'
import type { Student } from '../data/students'
import styles from './AttendancePage.module.css'

type AttValue = 'present' | 'absent' | 'late' | 'excused'

interface DateEntry {
  m: string
  d: number
  title?: string
  type?: string
}

interface JournalData {
  dates: DateEntry[]
  grades: string[][]
  attendance: AttValue[][]
}

interface StudentStat {
  student: Student
  total: number
  absent: number
  late: number
  present: number
  rate: number
}

// ─── читаем журнал из localStorage ────────────────────────────────────────────

function loadJournal(classId: string, subjectId: string): JournalData | null {
  const userId = getCurrentUserId()
  if (!userId || !classId || !subjectId) return null

  const key = `journal_${userId}_${classId}_${subjectId}`
  const raw = localStorage.getItem(key)
  if (!raw) return null

  try {
    const data = JSON.parse(raw)
    return {
      dates: data.dates ?? [],
      grades: data.grades ?? [],
      attendance: data.attendance ?? [],
    }
  } catch {
    return null
  }
}

// ─── цвет по проценту ─────────────────────────────────────────────────────────

function rateColor(rate: number): string {
  if (rate >= 90) return '#16a34a'
  if (rate >= 75) return '#d97706'
  return '#dc2626'
}

function rateGradient(rate: number): string {
  if (rate >= 90) return 'linear-gradient(90deg,#4ade80,#16a34a)'
  if (rate >= 75) return 'linear-gradient(90deg,#fbbf24,#d97706)'
  return 'linear-gradient(90deg,#f87171,#dc2626)'
}

// ─── компонент ────────────────────────────────────────────────────────────────

export default function AttendancePage() {
  const classes = loadClasses()
  const subjects = loadSubjects()

  const [classId, setClassId] = useState(() => localStorage.getItem('journal-selected-class') ?? '')
  const [subjectId, setSubjectId] = useState(() => localStorage.getItem('journal-selected-subject') ?? '')
  const [students, setStudents] = useState<Student[]>([])
  const [journal, setJournal] = useState<JournalData | null>(null)

  // предметы доступные для выбранного класса
  const selectedClass = classes.find((c) => c.id === classId)
  const availableSubjects = selectedClass?.subjectIds
    ? subjects.filter((s) => selectedClass.subjectIds?.includes(s.id))
    : []

  // автовыбор первого класса
  useEffect(() => {
    if (!classId && classes.length > 0) setClassId(classes[0].id)
  }, [classes, classId])

  // автовыбор первого предмета
  useEffect(() => {
    if (classId && availableSubjects.length > 0 && !availableSubjects.some((s) => s.id === subjectId)) {
      setSubjectId(availableSubjects[0].id)
    }
  }, [classId, availableSubjects, subjectId])

  // загрузка данных
  useEffect(() => {
    refresh()
    function onChange() { refresh() }
    window.addEventListener('students-changed', onChange)
    window.addEventListener('references-changed', onChange)
    return () => {
      window.removeEventListener('students-changed', onChange)
      window.removeEventListener('references-changed', onChange)
    }
  }, [classId, subjectId])

  function refresh() {
    if (!classId) {
      setStudents([])
      setJournal(null)
      return
    }
    setStudents(loadStudents().filter((s) => s.classId === classId))
    setJournal(loadJournal(classId, subjectId))
  }

  // ─── расчёт статистики ──────────────────────────────────────────────────────

  const stats: StudentStat[] = useMemo(() => {
    if (!journal || students.length === 0) return []

    const total = journal.dates.length
    if (total === 0) return []

    return students
      .map((student, si) => {
        const row = journal.attendance[si] ?? []
        const absent  = row.filter((v) => v === 'absent').length
        const late    = row.filter((v) => v === 'late').length
        const present = total - absent
        const rate    = total > 0 ? Math.round((present / total) * 100) : 100
        return { student, total, absent, late, present, rate }
      })
      .sort((a, b) => a.rate - b.rate)   // проблемные сверху
  }, [journal, students])

  // сводные показатели
  const summary = useMemo(() => {
    if (stats.length === 0) return null
    const avgRate     = Math.round(stats.reduce((s, x) => s + x.rate, 0) / stats.length)
    const totalAbsent = stats.reduce((s, x) => s + x.absent, 0)
    const atRisk      = stats.filter((x) => x.rate < 75).length
    const lessons     = stats[0]?.total ?? 0
    return { avgRate, totalAbsent, atRisk, lessons }
  }, [stats])

  // самый пропускаемый день
  const worstDay = useMemo(() => {
    if (!journal || journal.dates.length === 0) return null
    let maxAbsent = 0
    let idx = -1
    journal.dates.forEach((_, di) => {
      const cnt = journal.attendance.filter((row) => row[di] === 'absent').length
      if (cnt > maxAbsent) { maxAbsent = cnt; idx = di }
    })
    if (idx === -1 || maxAbsent === 0) return null
    const d = journal.dates[idx]
    return { label: `${d.m.slice(0, 3)} ${d.d}`, count: maxAbsent }
  }, [journal])

  const hasData = journal !== null && journal.dates.length > 0 && students.length > 0

  return (
    <main className={styles.page}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>Attendance</h1>
          <p className={styles.subtitle}>Посещаемость по отметкам в журнале</p>
        </div>
      </div>

      {/* Фильтры */}
      {classes.length > 0 && (
        <div className={styles.filters}>
          <select className={styles.select} value={classId} onChange={(e) => setClassId(e.target.value)}>
            <option value="">Select Class</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {classId && availableSubjects.length > 0 && (
            <select className={styles.select} value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              <option value="">Select Subject</option>
              {availableSubjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          )}
        </div>
      )}

      {!hasData ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>📊</span>
          <p className={styles.emptyTitle}>Нет данных о посещаемости</p>
          <p className={styles.emptyText}>
            Отметьте пропуски в журнале — поставьте <b>ab</b> в ячейке урока
          </p>
        </div>
      ) : (
        <>
          {/* Сводные карточки */}
          {summary && (
            <div className={styles.summaryGrid}>
              <div className={styles.sumCard}>
                <div className={styles.sumNum} style={{ color: rateColor(summary.avgRate) }}>
                  {summary.avgRate}%
                </div>
                <div className={styles.sumLabel}>Средняя посещаемость</div>
              </div>
              <div className={styles.sumCard}>
                <div className={styles.sumNum} style={{ color: '#457B9D' }}>{summary.totalAbsent}</div>
                <div className={styles.sumLabel}>Всего пропусков</div>
              </div>
              <div className={styles.sumCard}>
                <div className={styles.sumNum} style={{ color: summary.atRisk > 0 ? '#dc2626' : '#16a34a' }}>
                  {summary.atRisk}
                </div>
                <div className={styles.sumLabel}>Группа риска (&lt;75%)</div>
              </div>
              <div className={styles.sumCard}>
                <div className={styles.sumNum} style={{ color: '#7c3aed' }}>
                  {worstDay ? worstDay.label : '—'}
                </div>
                <div className={styles.sumLabel}>
                  {worstDay ? `${worstDay.count} отсутствий` : 'Пропусков нет'}
                </div>
              </div>
            </div>
          )}

          {/* График — полосы по студентам */}
          <div className={styles.chartBox}>
            <h2 className={styles.chartTitle}>Посещаемость по ученикам</h2>

            {stats.map(({ student, rate, absent }) => (
              <div key={student.id} className={`${styles.row} ${rate < 75 ? styles.risk : ''}`}>
                <div className={styles.name} title={`${student.lastName} ${student.firstName}`}>
                  {student.lastName} {student.firstName}
                </div>
                <div className={styles.track}>
                  <div
                    className={styles.fill}
                    style={{ width: `${rate}%`, background: rateGradient(rate) }}
                  />
                </div>
                <div className={styles.valueBox}>
                  <div className={styles.pct} style={{ color: rateColor(rate) }}>{rate}%</div>
                  <div className={styles.miss}>{absent} проп.</div>
                </div>
              </div>
            ))}

            <div className={styles.legend}>
              <div className={styles.leg}><span className={styles.dot} style={{ background: '#dc2626' }} /> &lt; 75% — группа риска</div>
              <div className={styles.leg}><span className={styles.dot} style={{ background: '#d97706' }} /> 75–89% — внимание</div>
              <div className={styles.leg}><span className={styles.dot} style={{ background: '#16a34a' }} /> ≥ 90% — норма</div>
              <div className={styles.leg}>Всего уроков: {summary?.lessons}</div>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
