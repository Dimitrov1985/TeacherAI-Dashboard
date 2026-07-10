import { useState, useEffect } from 'react'
import TopIcons from './TopIcons'
import MiniCalendar from './MiniCalendar'
import CalendarNotes from './CalendarNotes'
import { toISODate } from '../../lib/date'
import { loadNotes, addNote, updateNote, deleteNote, getNotesForDate } from '../../lib/notesStore'
import type { CalendarNote } from '../../data/notes'

type RightPanelProps = {
  month: Date
  selectedDate: Date
  onSelectDate: (date: Date) => void
  onPrevMonth: () => void
  onNextMonth: () => void
}

export default function RightPanel({
  month,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: RightPanelProps) {
  const [notes, setNotes] = useState<CalendarNote[]>([])
  const [noteDates, setNoteDates] = useState<Set<string>>(new Set())
  const selectedDateISO = toISODate(selectedDate)

  useEffect(() => {
    setNotes(getNotesForDate(selectedDateISO))
  }, [selectedDateISO])

  useEffect(() => {
    const allNotes = loadNotes()
    const dates = new Set(allNotes.map((n) => n.date))
    setNoteDates(dates)
  }, [notes])

  function handleAddNote(noteData: Omit<CalendarNote, 'id' | 'createdAt'>) {
    const newNote: CalendarNote = {
      ...noteData,
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    }
    addNote(newNote)
    setNotes(getNotesForDate(selectedDateISO))
  }

  function handleUpdateNote(id: string, noteData: Omit<CalendarNote, 'id' | 'createdAt'>) {
    updateNote(id, noteData)
    setNotes(getNotesForDate(selectedDateISO))
  }

  function handleDeleteNote(id: string) {
    deleteNote(id)
    setNotes(getNotesForDate(selectedDateISO))
  }

  return (
    <aside
      className="flex w-full flex-col gap-5 p-5 lg:h-full lg:w-80 lg:flex-shrink-0 lg:overflow-y-auto"
      style={{
        backgroundColor: 'var(--bg-sidebar)',
        transition: 'background-color 0.3s ease',
      }}
    >
      <TopIcons />
      <MiniCalendar
        month={month}
        selectedDate={selectedDate}
        noteDates={noteDates}
        onSelectDate={onSelectDate}
        onPrevMonth={onPrevMonth}
        onNextMonth={onNextMonth}
      />
      <CalendarNotes
        date={selectedDateISO}
        notes={notes}
        onAddNote={handleAddNote}
        onUpdateNote={handleUpdateNote}
        onDeleteNote={handleDeleteNote}
      />
    </aside>
  )
}
