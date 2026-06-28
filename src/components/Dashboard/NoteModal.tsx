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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={(event) => {
        event.stopPropagation()
        onClose()
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-md flex-col gap-4 rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold text-[#1D3557]">
              {note ? 'Редактировать заметку' : 'Новая заметка'}
            </h3>
            <span className="text-sm text-[#457B9D]">{formattedDate}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#B1B1B1] hover:text-[#1D3557]"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="note-title" className="text-sm font-medium text-[#1D3557]">
              Заголовок
            </label>
            <input
              id="note-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Название заметки"
              className="rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm text-[#1D3557] placeholder-[#B1B1B1] focus:border-[#457B9D] focus:outline-none"
              autoFocus
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="note-content" className="text-sm font-medium text-[#1D3557]">
              Описание
            </label>
            <textarea
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Добавьте описание..."
              rows={4}
              className="resize-none rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm text-[#1D3557] placeholder-[#B1B1B1] focus:border-[#457B9D] focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#1D3557]">Цвет</label>
            <div className="flex gap-2">
              {DEFAULT_NOTE_COLORS.map((c) => (
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
                  if (confirm('Вы уверены, что хотите удалить эту заметку?')) {
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
                {note ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
