import { useState, useEffect } from 'react'
import type { Lesson } from '../data/lessons'

type LinkToScheduleModalProps = {
  onClose: () => void
  onLink: (lessonId: string) => void
}

const LESSONS_STORAGE_KEY = 'teacher-dashboard:lessons'

function loadLessons(): Lesson[] {
  const raw = localStorage.getItem(LESSONS_STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as Lesson[]
  } catch {
    return []
  }
  return []
}

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function LinkToScheduleModal({ onClose, onLink }: LinkToScheduleModalProps) {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selectedLesson, setSelectedLesson] = useState<string>('')

  useEffect(() => {
    setLessons(loadLessons())
  }, [])

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selectedLesson) {
      onLink(selectedLesson)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="flex w-full max-w-lg flex-col gap-5 rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-[#1D3557]">🔗 Привязать к уроку</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-[#B1B1B1] transition-colors hover:text-[#1D3557]"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#1D3557]">Выберите урок из расписания</label>
          {lessons.length > 0 ? (
            <div className="max-h-[400px] space-y-2 overflow-y-auto rounded-lg border border-[#DCE8F5] p-3">
              {lessons.map((lesson) => (
                <label
                  key={lesson.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-all ${
                    selectedLesson === lesson.id
                      ? 'border-[#457B9D] bg-[#f0f6ff]'
                      : 'border-[#DCE8F5] hover:border-[#457B9D]/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="lesson"
                    value={lesson.id}
                    checked={selectedLesson === lesson.id}
                    onChange={(e) => setSelectedLesson(e.target.value)}
                    className="h-4 w-4 accent-[#457B9D]"
                  />
                  <div
                    className="h-10 w-10 flex-shrink-0 rounded-lg"
                    style={{ backgroundColor: lesson.bg }}
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-[#1D3557]">{lesson.title}</div>
                    <div className="text-xs text-[#457B9D]">
                      {dayNames[lesson.day]} • {lesson.start} - {lesson.end}
                      {lesson.class && ` • ${lesson.class}`}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-[#DCE8F5] p-6 text-center">
              <p className="text-sm text-[#B1B1B1]">
                Нет уроков в расписании. Добавьте уроки в Weekly Schedule.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-[#DCE8F5] px-4 py-2.5 text-sm font-medium text-[#457B9D] transition-colors hover:bg-[#DCE8F5]"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={!selectedLesson}
            className="flex-1 rounded-lg bg-[#457B9D] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1D3557] disabled:opacity-50"
          >
            Привязать
          </button>
        </div>
      </form>
    </div>
  )
}
