import { useEffect, useState } from 'react'
import type { CalendarNote } from '../../data/notes'
import { DEFAULT_NOTE_COLORS } from '../../data/notes'

type NoteModalProps = {
  date: string
  note?: CalendarNote
  onSave: (note: Omit<CalendarNote, 'id' | 'createdAt'>) => void
  onDelete?: () => void
  onClose: () => void
}

export default function NoteModal({ date, note, onSave, onDelete, onClose }: NoteModalProps) {
  const [title, setTitle] = useState(note?.title ?? '')
  const [content, setContent] = useState(note?.content ?? '')
  const [color, setColor] = useState(note?.color ?? DEFAULT_NOTE_COLORS[4])

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!title.trim()) return

    onSave({
      date,
      title: title.trim(),
      content: content.trim(),
      color,
    })
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
      onClick={(event) => {
        event.stopPropagation()
        onClose()
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-md flex-col gap-4 rounded-2xl p-6 shadow-xl"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {note ? 'Редактировать заметку' : 'Новая заметка'}
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
            <label htmlFor="note-title" className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Заголовок
            </label>
            <input
              id="note-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Название заметки"
              className="rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              autoFocus
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="note-content" className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Описание
            </label>
            <textarea
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Добавьте описание..."
              rows={4}
              className="resize-none rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Цвет</label>
            <div className="flex gap-2">
              {DEFAULT_NOTE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="h-8 w-8 rounded-full transition-transform hover:scale-110"
                  style={color === c ? { boxShadow: `0 0 0 2px var(--accent), 0 0 0 4px var(--bg-surface)` } : {}}
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
                  if (confirm('Вы уверены, что хотите удалить эту заметку?')) {
                    onDelete()
                    onClose()
                  }
                }}
                className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                style={{ color: '#FF4974' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FF497420'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Удалить
              </button>
            )}
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface-2)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Отмена
              </button>
              <button
                type="submit"
                className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: 'var(--accent)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent)'}
              >
                {note ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
