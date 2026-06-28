import { useEffect, useState } from 'react'
import { IconClock } from './icons'
import LessonModal from './LessonModal'
import LessonDetailModal from './LessonDetailModal'
import { INITIAL_LESSONS, type Lesson } from '../../data/lessons'
import { emitLessonsChange } from '../../lib/storageEvents'

const LESSONS_STORAGE_KEY = 'teacher-dashboard:lessons'

function loadLessons(): Lesson[] {
  const raw = localStorage.getItem(LESSONS_STORAGE_KEY)
  if (!raw) return INITIAL_LESSONS
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as Lesson[]
  } catch {
    // ignore malformed storage and fall back to defaults
  }
  return INITIAL_LESSONS
}

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

const hours = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']

const dayStartMinutes = 7 * 60
const dayEndMinutes = 18 * 60
const totalMinutes = dayEndMinutes - dayStartMinutes

function toMinutes(time: string) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m - dayStartMinutes
}

type ModalState =
  | { mode: 'add'; day: number }
  | { mode: 'edit'; lesson: Lesson }
  | { mode: 'detail'; lesson: Lesson }
  | null

export default function WeeklySchedule() {
  const [lessons, setLessons] = useState<Lesson[]>(loadLessons)
  const [modal, setModal] = useState<ModalState>(null)

  useEffect(() => {
    localStorage.setItem(LESSONS_STORAGE_KEY, JSON.stringify(lessons))
    emitLessonsChange()
  }, [lessons])

  function handleSave(data: Omit<Lesson, 'id'>) {
    if (modal?.mode === 'edit') {
      setLessons((current) =>
        current.map((lesson) => (lesson.id === modal.lesson.id ? { ...lesson, ...data } : lesson)),
      )
    } else {
      setLessons((current) => [...current, { ...data, id: `l-${Date.now()}` }])
    }
    setModal(null)
  }

  function handleDelete() {
    if (modal?.mode === 'edit') {
      setLessons((current) => current.filter((lesson) => lesson.id !== modal.lesson.id))
    }
    setModal(null)
  }

  return (
    <div className="flex w-full flex-col gap-6 rounded-2xl px-2 py-4 sm:px-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#1D3557]">WEEKLY COURSE SCHEDULE</h2>
        <button
          type="button"
          onClick={() => setModal({ mode: 'add', day: 0 })}
          className="rounded-lg bg-[#457B9D] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#1D3557]"
        >
          + Add lesson
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-2 border-b border-[#DCDCDC]/70 pb-2">
            {days.map((d) => (
              <div
                key={d.label}
                className={`text-center text-base ${
                  d.active ? 'font-semibold text-[#457B9D]' : 'font-normal text-[#B1B1B1]/70'
                } ${d.label === 'Week' ? 'text-left' : ''}`}
              >
                {d.label}
              </div>
            ))}
          </div>

          <div className="relative grid grid-cols-[60px_1fr]">
            <div className="flex flex-col justify-between py-2">
              {hours.map((h) => (
                <div key={h} className="flex h-12 items-center text-sm text-[#457B9D]">
                  {h}
                </div>
              ))}
            </div>

            <div className="relative grid grid-cols-7">
              {hours.map((h, i) => (
                <div
                  key={h}
                  className="absolute left-0 right-0 border-t border-[#DCDCDC]/70"
                  style={{ top: `${(i / hours.length) * 100}%` }}
                />
              ))}

              {Array.from({ length: 7 }).map((_, dayIndex) => (
                <button
                  key={dayIndex}
                  type="button"
                  onClick={() => setModal({ mode: 'add', day: dayIndex })}
                  className="relative text-left"
                  style={{ height: `${hours.length * 48}px` }}
                >
                  {lessons
                    .filter((l) => l.day === dayIndex)
                    .map((lesson) => {
                      const top = (toMinutes(lesson.start) / totalMinutes) * 100
                      const height = ((toMinutes(lesson.end) - toMinutes(lesson.start)) / totalMinutes) * 100
                      return (
                        <div
                          key={lesson.id}
                          role="button"
                          tabIndex={0}
                          onClick={(event) => {
                            event.stopPropagation()
                            setModal({ mode: 'detail', lesson })
                          }}
                          className="absolute inset-x-1 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border px-1 py-2 text-center transition-opacity hover:opacity-80"
                          style={{
                            top: `${top}%`,
                            height: `${height}%`,
                            backgroundColor: lesson.bg,
                            borderColor: lesson.border,
                            color: lesson.color,
                          }}
                        >
                          <span className="text-[11px] leading-tight">{lesson.title}</span>
                          <span className="flex items-center gap-1 text-[10px]">
                            <IconClock className="h-3 w-3" />
                            {lesson.start} - {lesson.end}
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
    </div>
  )
}
