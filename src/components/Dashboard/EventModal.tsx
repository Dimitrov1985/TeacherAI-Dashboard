import { useEffect, useState } from 'react'
import type { CalendarEvent } from '../../data/events'

const DEFAULT_EVENT_COLORS = [
  '#CE1821', // Red
  '#F99132', // Orange
  '#F9CB32', // Yellow
  '#3ECD88', // Green
  '#457B9D', // Blue
  '#9B59B6', // Purple
  '#E91E63', // Pink
]

type EventModalProps = {
  event?: CalendarEvent
  onSave: (event: Omit<CalendarEvent, 'id'> | CalendarEvent) => void
  onDelete?: () => void
  onClose: () => void
}

export default function EventModal({ event, onSave, onDelete, onClose }: EventModalProps) {
  const [title, setTitle] = useState(event?.title ?? '')
  const [date, setDate] = useState(event?.date ?? new Date().toISOString().split('T')[0])
  const [time, setTime] = useState(event?.time ?? '09:00 - 10:00')
  const [color, setColor] = useState(event?.color ?? DEFAULT_EVENT_COLORS[4])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !date || !time.trim()) return

    const eventData: CalendarEvent = {
      id: event?.id ?? `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      date,
      time: time.trim(),
      color,
    }

    onSave(eventData)
    onClose()
  }

  const dateObj = new Date(date + 'T00:00:00')
  const formattedDate = dateObj.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={(e) => {
        e.stopPropagation()
        onClose()
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-md flex-col gap-4 rounded-2xl p-6 shadow-xl"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {event ? 'Редактировать событие' : 'Новое событие'}
            </h3>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{formattedDate}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}

          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="event-title" className="text-sm font-medium text-[#1D3557]">
              Название события
            </label>
            <input
              id="event-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Родительское собрание"
              className="rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm text-[#1D3557] placeholder-[#B1B1B1] focus:border-[#457B9D] focus:outline-none"
              autoFocus
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="event-date" className="text-sm font-medium text-[#1D3557]">
              Дата
            </label>
            <input
              id="event-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm text-[#1D3557] focus:border-[#457B9D] focus:outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="event-time" className="text-sm font-medium text-[#1D3557]">
              Время
            </label>
            <input
              id="event-time"
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="09:00 - 10:00"
              className="rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm text-[#1D3557] placeholder-[#B1B1B1] focus:border-[#457B9D] focus:outline-none"
              required
            />
            <span className="text-xs text-[#B1B1B1]">
              Формат: ЧЧ:ММ - ЧЧ:ММ (например: 09:00 - 10:00)
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#1D3557]">Цвет</label>
            <div className="flex gap-2">
              {DEFAULT_EVENT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${
                    color === c ? 'ring-2 ring-[#1D3557] ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-between gap-2 pt-2">
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Вы уверены, что хотите удалить это событие?')) {
                    onDelete()
                    onClose()
                  }
                }}
                className="rounded-lg px-4 py-2 text-sm font-medium text-[#FF4974] hover:bg-[#FF4974]/10"
              >
                Удалить
              </button>
            )}
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-[#457B9D] hover:bg-[#DCE8F5]"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#457B9D] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D3557]"
              >
                {event ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
