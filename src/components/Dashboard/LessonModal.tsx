import { useEffect, useState } from 'react'
import type { Lesson } from '../../data/lessons'
import { COLOR_PRESETS } from '../../data/lessons'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

type LessonModalProps = {
  initial?: Lesson
  defaultDay?: number
  onSave: (lesson: Omit<Lesson, 'id'>) => void
  onDelete?: () => void
  onClose: () => void
}

export default function LessonModal({ initial, defaultDay = 0, onSave, onDelete, onClose }: LessonModalProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [className, setClassName] = useState(initial?.class ?? '')
  const [day, setDay] = useState(initial?.day ?? defaultDay)
  const [start, setStart] = useState(initial?.start ?? '07:00')
  const [end, setEnd] = useState(initial?.end ?? '10:00')
  const [presetName, setPresetName] = useState(
    COLOR_PRESETS.find((p) => p.color === initial?.color)?.name ?? COLOR_PRESETS[0].name,
  )
  const [error, setError] = useState('')

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!title.trim()) {
      setError('Enter a subject')
      return
    }
    if (start >= end) {
      setError('End time must be after start time')
      return
    }
    if (start < '07:00' || end > '18:00') {
      setError('Time must be between 07:00 and 18:00')
      return
    }
    const preset = COLOR_PRESETS.find((p) => p.name === presetName) ?? COLOR_PRESETS[0]
    onSave({
      title: title.trim(),
      class: className.trim() || undefined,
      day,
      start,
      end,
      color: preset.color,
      bg: preset.bg,
      border: preset.border
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <form
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-white p-5 shadow-xl"
      >
        <h3 className="text-base font-semibold text-[#1D3557]">
          {initial ? 'Edit lesson' : 'Add lesson'}
        </h3>

        <label className="flex flex-col gap-1 text-sm text-[#457B9D]">
          Subject
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm text-[#1D3557] outline-none focus:border-[#457B9D]"
            placeholder="e.g., Mathematics"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-[#457B9D]">
          Class
          <input
            type="text"
            value={className}
            onChange={(event) => setClassName(event.target.value)}
            className="rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm text-[#1D3557] outline-none focus:border-[#457B9D]"
            placeholder="e.g., 10A"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-[#457B9D]">
          Day
          <select
            value={day}
            onChange={(event) => setDay(Number(event.target.value))}
            className="rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm text-[#1D3557] outline-none focus:border-[#457B9D]"
          >
            {DAY_LABELS.map((label, index) => (
              <option key={label} value={index}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1 text-sm text-[#457B9D]">
            Start
            <input
              type="time"
              value={start}
              onChange={(event) => setStart(event.target.value)}
              className="rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm text-[#1D3557] outline-none focus:border-[#457B9D]"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm text-[#457B9D]">
            End
            <input
              type="time"
              value={end}
              onChange={(event) => setEnd(event.target.value)}
              className="rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm text-[#1D3557] outline-none focus:border-[#457B9D]"
            />
          </label>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-sm text-[#457B9D]">Color</span>
          <div className="flex gap-2">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                aria-label={preset.name}
                onClick={() => setPresetName(preset.name)}
                className={`h-7 w-7 rounded-full border-2 ${
                  presetName === preset.name ? 'border-[#1D3557]' : 'border-transparent'
                }`}
                style={{ backgroundColor: preset.color }}
              />
            ))}
          </div>
        </div>

        {error && <p className="text-xs text-[#CE1821]">{error}</p>}

        <div className="flex items-center justify-between gap-2 pt-1">
          {initial && onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#CE1821] hover:bg-[#FFBABE]/40"
            >
              Delete
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#457B9D] hover:bg-[#DCE8F5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#457B9D] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D3557]"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
