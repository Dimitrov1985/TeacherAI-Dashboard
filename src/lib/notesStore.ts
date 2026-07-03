import type { CalendarNote } from '../data/notes'
import { getCurrentUserId } from './auth'

const getNotesKey = (userId: string) => `teacher-dashboard:${userId}:calendar-notes`

export function loadNotes(): CalendarNote[] {
  const userId = getCurrentUserId()
  if (!userId) return []

  const raw = localStorage.getItem(getNotesKey(userId))
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as CalendarNote[]
  } catch {
    console.warn('Failed to parse calendar notes from localStorage')
  }
  return []
}

export function saveNotes(notes: CalendarNote[]): void {
  const userId = getCurrentUserId()
  if (!userId) {
    console.warn('Cannot save notes: No user logged in')
    return
  }

  localStorage.setItem(getNotesKey(userId), JSON.stringify(notes))
}

export function addNote(note: CalendarNote): CalendarNote[] {
  const notes = loadNotes()
  notes.push(note)
  saveNotes(notes)
  return notes
}

export function updateNote(id: string, updates: Partial<CalendarNote>): CalendarNote[] {
  const notes = loadNotes()
  const index = notes.findIndex((n) => n.id === id)
  if (index !== -1) {
    notes[index] = { ...notes[index], ...updates }
    saveNotes(notes)
  }
  return notes
}

export function deleteNote(id: string): CalendarNote[] {
  const notes = loadNotes()
  const filtered = notes.filter((n) => n.id !== id)
  saveNotes(filtered)
  return filtered
}

export function getNotesForDate(date: string): CalendarNote[] {
  const notes = loadNotes()
  return notes.filter((n) => n.date === date).sort((a, b) => b.createdAt - a.createdAt)
}
