import type { CalendarEvent } from '../data/events'

const EVENTS_STORAGE_KEY = 'teacher-dashboard:calendar-events'

export function loadEvents(): CalendarEvent[] {
  const raw = localStorage.getItem(EVENTS_STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as CalendarEvent[]
  } catch {
    console.warn('Failed to parse calendar events from localStorage')
  }
  return []
}

export function saveEvents(events: CalendarEvent[]): void {
  localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events))
}

export function addEvent(event: CalendarEvent): CalendarEvent[] {
  const events = loadEvents()
  events.push(event)
  saveEvents(events)
  return events
}

export function updateEvent(id: string, updates: Partial<CalendarEvent>): CalendarEvent[] {
  const events = loadEvents()
  const index = events.findIndex((e) => e.id === id)
  if (index !== -1) {
    events[index] = { ...events[index], ...updates }
    saveEvents(events)
  }
  return events
}

export function deleteEvent(id: string): CalendarEvent[] {
  const events = loadEvents()
  const filtered = events.filter((e) => e.id !== id)
  saveEvents(filtered)
  return filtered
}

export function getAllEvents(): CalendarEvent[] {
  return loadEvents().sort((a, b) => a.date.localeCompare(b.date))
}
