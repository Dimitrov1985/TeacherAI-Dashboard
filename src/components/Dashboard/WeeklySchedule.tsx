import { useEffect, useState } from 'react'
import { IconClock } from './icons'
import LessonModal from './LessonModal'
import LessonDetailModal from './LessonDetailModal'
import { type Lesson } from '../../data/lessons'
import { emitLessonsChange } from '../../lib/storageEvents'
import { getCurrentUserId } from '../../lib/auth'

// ─── storage (логика не тронута) ──────────────────────────────────────────────

function getLessonsStorageKey(): string {
  const userId = getCurrentUserId()
  if (!userId) return 'teacher-dashboard:lessons'
  return `teacher-dashboard:${userId}:lessons`
}

function loadLessons(): Lesson[] {
  const key = getLessonsStorageKey()
  const raw = localStorage.getItem(key)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as Lesson[]
  } catch {
    // ignore
  }
  return []
}

// ─── constants (логика не тронута) ────────────────────────────────────────────

const days = [
  { label: 'Week' },
  { label: 'Mon' },
  { label: 'Tue' },
  { label: 'Wed', active: true },
  { label: 'Thu' },
  { label: 'Fri' },
  { label: 'Sat' },
  { label: 'Sun' },
]

const hours = [
  '07:00','08:00','09:00','10:00','11:00','12:00',
  '13:00','14:00','15:00','16:00','17:00','18:00',
]

const dayStartMinutes = 7 * 60
const dayEndMinutes   = 18 * 60
const totalMinutes    = dayEndMinutes - dayStartMinutes

function toMinutes(time: string) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m - dayStartMinutes
}

type ModalState =
  | { mode: 'add';    day: number }
  | { mode: 'edit';   lesson: Lesson }
  | { mode: 'detail'; lesson: Lesson }
  | null

// ─── CSS (Uiverse.io style) ───────────────────────────────────────────────────

const CSS = `
  .ws-root {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 24px;
    background: rgba(255,255,255,0.6);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(69,123,157,0.12);
    border-radius: 24px;
    padding: 28px 32px;
    box-shadow: 0 8px 32px rgba(69,123,157,0.08);
  }

  .ws-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
  }

  .ws-title-wrap { display: flex; flex-direction: column; gap: 4px; }

  .ws-title {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: .04em;
    background: linear-gradient(135deg, #1D3557, #457B9D);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .ws-subtitle {
    font-size: 12px;
    color: rgba(69,123,157,0.6);
    font-weight: 400;
  }

  .ws-btn-add {
    position: relative;
    overflow: hidden;
    padding: 10px 20px;
    background: linear-gradient(135deg, #457B9D, #1D3557);
    color: #fff;
    border: none;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    box-shadow: 0 4px 14px rgba(69,123,157,0.35);
  }
  .ws-btn-add::before {
    content: '';
    position: absolute;
    top: 50%; left: 50%;
    width: 0; height: 0;
    background: rgba(255,255,255,0.18);
    border-radius: 50%;
    transform: translate(-50%,-50%);
    transition: width 0.5s ease, height 0.5s ease;
  }
  .ws-btn-add:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(69,123,157,0.45); }
  .ws-btn-add:hover::before { width: 220px; height: 220px; }
  .ws-btn-add:active { transform: translateY(0); }

  /* scroll wrapper */
  .ws-scroll { overflow-x: auto; padding-bottom: 4px; }
  .ws-scroll::-webkit-scrollbar { height: 4px; }
  .ws-scroll::-webkit-scrollbar-track { background: transparent; }
  .ws-scroll::-webkit-scrollbar-thumb { background: rgba(69,123,157,0.2); border-radius: 4px; }

  .ws-inner { min-width: 640px; }

  /* day headers */
  .ws-days-row {
    display: grid;
    grid-template-columns: 64px repeat(7, 1fr);
    gap: 6px;
    margin-bottom: 12px;
  }

  .ws-day-cell {
    text-align: center;
    padding: 8px 4px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 500;
    color: rgba(172,172,172,0.8);
    transition: background 0.2s;
  }
  .ws-day-cell.active {
    background: linear-gradient(135deg, #457B9D18, #1D355710);
    color: #457B9D;
    font-weight: 700;
  }
  .ws-day-cell.week-label {
    text-align: left;
    color: transparent;
  }

  /* grid */
  .ws-grid {
    position: relative;
    display: grid;
    grid-template-columns: 64px 1fr;
  }

  /* hour labels */
  .ws-hours {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 8px 0;
  }
  .ws-hour-label {
    display: flex;
    height: 48px;
    align-items: center;
    font-size: 11px;
    font-weight: 500;
    color: rgba(69,123,157,0.5);
    padding-right: 8px;
  }

  /* days area */
  .ws-days-area {
    position: relative;
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    border-radius: 14px;
    overflow: hidden;
    background: rgba(69,123,157,0.02);
    border: 1px solid rgba(69,123,157,0.08);
  }

  /* hour lines */
  .ws-hour-line {
    position: absolute;
    left: 0; right: 0;
    border-top: 1px solid rgba(69,123,157,0.07);
    pointer-events: none;
  }
  .ws-hour-line:first-child { border-color: rgba(69,123,157,0.14); }

  /* day column */
  .ws-day-col {
    position: relative;
    border-right: 1px solid rgba(69,123,157,0.06);
    cursor: pointer;
    transition: background 0.2s;
  }
  .ws-day-col:last-child { border-right: none; }
  .ws-day-col:hover { background: rgba(69,123,157,0.025); }

  /* lesson card */
  .ws-lesson {
    position: absolute;
    inset-x: 3px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    border-radius: 10px;
    padding: 6px 4px;
    text-align: center;
    cursor: pointer;
    border: 1px solid transparent;
    transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }
  .ws-lesson:hover {
    transform: scaleX(1.03) translateY(-1px);
    box-shadow: 0 6px 18px rgba(0,0,0,0.14);
    opacity: 0.93;
    z-index: 10;
  }

  .ws-lesson-title {
    font-size: 11px;
    font-weight: 600;
    line-height: 1.3;
    word-break: break-word;
  }

  .ws-lesson-time {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 9px;
    opacity: 0.8;
  }

  /* today highlight */
  .ws-day-col.today {
    background: rgba(69,123,157,0.04);
  }
  .ws-today-badge {
    position: absolute;
    top: 4px;
    left: 50%;
    transform: translateX(-50%);
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #457B9D;
    box-shadow: 0 0 6px #457B9D;
  }

  /* stats pills */
  .ws-stats {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .ws-stat-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    background: rgba(69,123,157,0.07);
    border: 1px solid rgba(69,123,157,0.12);
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    color: #457B9D;
  }
  .ws-stat-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: #457B9D;
    box-shadow: 0 0 5px rgba(69,123,157,0.5);
  }
`

// ─── helpers ──────────────────────────────────────────────────────────────────

function getWeekRange(): string {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // Найти понедельник текущей недели
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December']

  const startMonth = months[monday.getMonth()]
  const endMonth = months[sunday.getMonth()]
  const year = sunday.getFullYear()

  if (monday.getMonth() === sunday.getMonth()) {
    return `${startMonth} ${monday.getDate()} – ${sunday.getDate()}, ${year}`
  } else {
    return `${startMonth} ${monday.getDate()} – ${endMonth} ${sunday.getDate()}, ${year}`
  }
}

// ─── component ────────────────────────────────────────────────────────────────

export default function WeeklySchedule() {
  const [lessons, setLessons] = useState<Lesson[]>(loadLessons)
  const [modal, setModal]     = useState<ModalState>(null)
  const weekRange = getWeekRange()

  // ── логика не тронута ──
  useEffect(() => {
    const key = getLessonsStorageKey()
    localStorage.setItem(key, JSON.stringify(lessons))
    emitLessonsChange()
  }, [lessons])

  function handleSave(data: Omit<Lesson, 'id'>) {
    if (modal?.mode === 'edit') {
      setLessons((cur) =>
        cur.map((l) => (l.id === modal.lesson.id ? { ...l, ...data } : l)),
      )
    } else {
      setLessons((cur) => [...cur, { ...data, id: `l-${Date.now()}` }])
    }
    setModal(null)
  }

  function handleDelete() {
    if (modal?.mode === 'edit') {
      setLessons((cur) => cur.filter((l) => l.id !== modal.lesson.id))
    }
    setModal(null)
  }

  // stats
  const totalLessons  = lessons.length
  const uniqueSubjects = new Set(lessons.map((l) => l.title)).size
  const uniqueClasses  = new Set(lessons.map((l) => l.class).filter(Boolean)).size

  return (
    <>
      <style>{CSS}</style>

      <div className="ws-root">

        {/* header */}
        <div className="ws-header">
          <div className="ws-title-wrap">
            <div className="ws-title">WEEKLY COURSE SCHEDULE</div>
            <div className="ws-subtitle">{weekRange}</div>
          </div>
          <button
            type="button"
            className="ws-btn-add"
            onClick={() => setModal({ mode: 'add', day: 0 })}
          >
            + Add Lesson
          </button>
        </div>

        {/* stats pills */}
        <div className="ws-stats">
          <div className="ws-stat-pill">
            <div className="ws-stat-dot" style={{ background: '#457B9D', boxShadow: '0 0 5px #457B9D' }} />
            {totalLessons} lessons
          </div>
          <div className="ws-stat-pill">
            <div className="ws-stat-dot" style={{ background: '#3ECD88', boxShadow: '0 0 5px #3ECD88' }} />
            {uniqueSubjects} subjects
          </div>
          {uniqueClasses > 0 && (
            <div className="ws-stat-pill">
              <div className="ws-stat-dot" style={{ background: '#F9CB32', boxShadow: '0 0 5px #F9CB32' }} />
              {uniqueClasses} classes
            </div>
          )}
        </div>

        {/* schedule grid */}
        <div className="ws-scroll">
          <div className="ws-inner">

            {/* day headers */}
            <div className="ws-days-row">
              {days.map((d) => (
                <div
                  key={d.label}
                  className={`ws-day-cell${d.active ? ' active' : ''}${d.label === 'Week' ? ' week-label' : ''}`}
                >
                  {d.label === 'Week' ? '' : d.label}
                </div>
              ))}
            </div>

            {/* hour labels + grid */}
            <div className="ws-grid">

              {/* hour labels */}
              <div className="ws-hours">
                {hours.map((h) => (
                  <div key={h} className="ws-hour-label">{h}</div>
                ))}
              </div>

              {/* days area */}
              <div className="ws-days-area" style={{ height: `${hours.length * 48}px` }}>

                {/* horizontal hour lines */}
                {hours.map((h, i) => (
                  <div
                    key={h}
                    className="ws-hour-line"
                    style={{ top: `${(i / hours.length) * 100}%` }}
                  />
                ))}

                {/* 7 day columns */}
                {Array.from({ length: 7 }).map((_, dayIndex) => (
                  <button
                    key={dayIndex}
                    type="button"
                    className={`ws-day-col${dayIndex === 2 ? ' today' : ''}`}
                    style={{ height: `${hours.length * 48}px` }}
                    onClick={() => setModal({ mode: 'add', day: dayIndex })}
                  >
                    {/* today dot */}
                    {dayIndex === 2 && <div className="ws-today-badge" />}

                    {/* lesson cards */}
                    {lessons
                      .filter((l) => l.day === dayIndex)
                      .map((lesson) => {
                        const top    = (toMinutes(lesson.start) / totalMinutes) * 100
                        const height = ((toMinutes(lesson.end) - toMinutes(lesson.start)) / totalMinutes) * 100
                        return (
                          <div
                            key={lesson.id}
                            role="button"
                            tabIndex={0}
                            className="ws-lesson"
                            style={{
                              top:             `${top}%`,
                              height:          `${Math.max(height, 4)}%`,
                              backgroundColor: lesson.bg,
                              borderColor:     lesson.border,
                              color:           lesson.color,
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              setModal({ mode: 'detail', lesson })
                            }}
                          >
                            <span className="ws-lesson-title">
                              {lesson.title}
                              {lesson.class ? ` — ${lesson.class}` : ''}
                            </span>
                            <span className="ws-lesson-time">
                              <IconClock className="h-3 w-3" />
                              {lesson.start}–{lesson.end}
                            </span>
                          </div>
                        )
                      })}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* modals (логика не тронута) */}
      {modal && (modal.mode === 'add' || modal.mode === 'edit') && (
        <LessonModal
          initial={modal.mode === 'edit' ? modal.lesson : undefined}
          defaultDay={modal.mode === 'add' ? modal.day : undefined}
          onSave={handleSave}
          onDelete={modal.mode === 'edit' ? handleDelete : undefined}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.mode === 'detail' && (
        <LessonDetailModal
          lesson={modal.lesson}
          onClose={() => setModal(null)}
          onEdit={() => setModal({ mode: 'edit', lesson: modal.lesson })}
        />
      )}
    </>
  )
}
