import { useState } from 'react'
import type { CalendarNote } from '../../data/notes'
import NoteModal from './NoteModal'

type CalendarNotesProps = {
  date: string
  notes: CalendarNote[]
  onAddNote: (note: Omit<CalendarNote, 'id' | 'createdAt'>) => void
  onUpdateNote: (id: string, note: Omit<CalendarNote, 'id' | 'createdAt'>) => void
  onDeleteNote: (id: string) => void
}

export default function CalendarNotes({
  date,
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
}: CalendarNotesProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<CalendarNote | null>(null)

  const dateObj = new Date(date + 'T00:00:00')
  const formattedDate = dateObj.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  })

  function handleOpenNew() {
    setEditingNote(null)
    setModalOpen(true)
  }

  function handleEdit(note: CalendarNote) {
    setEditingNote(note)
    setModalOpen(true)
  }

  function handleSave(noteData: Omit<CalendarNote, 'id' | 'createdAt'>) {
    if (editingNote) {
      onUpdateNote(editingNote.id, noteData)
    } else {
      onAddNote(noteData)
    }
  }

  function handleDelete() {
    if (editingNote) {
      onDeleteNote(editingNote.id)
    }
  }

  return (
    <div
      className="flex w-full flex-col gap-3 rounded-xl p-4"
      style={{
        backgroundColor: 'var(--bg-surface)',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>Заметки</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formattedDate}</span>
        </div>
        <button
          type="button"
          onClick={handleOpenNew}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#457B9D] text-white transition-colors hover:bg-[#1D3557]"
          title="Добавить заметку"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-[#DCE8F5] py-6 text-center">
          <svg className="h-8 w-8 text-[#ACACAC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          <p className="text-sm text-[#ACACAC]">Нет заметок на эту дату</p>
          <button
            type="button"
            onClick={handleOpenNew}
            className="mt-1 text-xs font-medium text-[#457B9D] hover:underline"
          >
            Добавить первую заметку
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notes.map((note) => (
            <button
              key={note.id}
              type="button"
              onClick={() => handleEdit(note)}
              className="group flex cursor-pointer flex-col gap-2 rounded-lg border-l-4 bg-white p-3 text-left shadow-sm transition-shadow hover:shadow-md"
              style={{ borderLeftColor: note.color }}
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="flex-1 text-sm font-medium text-[#1D3557] group-hover:text-[#457B9D]">
                  {note.title}
                </h4>
                <svg
                  className="h-4 w-4 flex-shrink-0 text-[#B1B1B1] opacity-0 transition-opacity group-hover:opacity-100"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              {note.content && (
                <p className="text-xs text-[#457B9D] line-clamp-2">{note.content}</p>
              )}
              <span className="text-[10px] text-[#ACACAC]">
                {new Date(note.createdAt).toLocaleString('ru-RU', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </button>
          ))}
        </div>
      )}

      {modalOpen && (
        <NoteModal
          date={date}
          note={editingNote ?? undefined}
          onSave={handleSave}
          onDelete={editingNote ? handleDelete : undefined}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
