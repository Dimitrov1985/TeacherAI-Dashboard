import { useState } from 'react'
import { IconAlertCircle, IconClock } from './icons'
import type { CalendarEvent } from '../../data/events'
import { addDays, toISODate } from '../../lib/date'
import EventModal from './EventModal'

type UpcomingEventsProps = {
  selectedDate: Date
  events: CalendarEvent[]
  onAddEvent: (event: CalendarEvent) => void
  onUpdateEvent: (id: string, event: CalendarEvent) => void
  onDeleteEvent: (id: string) => void
}

export default function UpcomingEvents({
  selectedDate,
  events: allEvents,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
}: UpcomingEventsProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)

  const selectedIso = toISODate(selectedDate)
  const onSelectedDay = allEvents.filter((event) => event.date === selectedIso)

  const displayEvents =
    onSelectedDay.length > 0
      ? onSelectedDay
      : allEvents
          .filter((event) => event.date >= selectedIso)
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(0, 4)

  const rangeStart = selectedDate
  const rangeEnd = addDays(selectedDate, 6)
  const rangeLabel = `${rangeStart.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} - ${rangeEnd.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`

  function handleOpenNew() {
    setEditingEvent(null)
    setModalOpen(true)
  }

  function handleEdit(event: CalendarEvent) {
    setEditingEvent(event)
    setModalOpen(true)
  }

  function handleSave(eventData: CalendarEvent) {
    if (editingEvent) {
      onUpdateEvent(editingEvent.id, eventData)
    } else {
      onAddEvent(eventData)
    }
  }

  function handleDelete() {
    if (editingEvent) {
      onDeleteEvent(editingEvent.id)
    }
  }

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl bg-white p-3 shadow-[0_6px_12px_rgba(148,163,184,0.15)]">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-base font-medium text-[#1D3557]">Upcoming Events</span>
          <span className="text-xs font-medium text-[#ACACAC]">{rangeLabel}</span>
        </div>
        <button
          type="button"
          onClick={handleOpenNew}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#457B9D] text-white transition-colors hover:bg-[#1D3557]"
          title="Добавить событие"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {displayEvents.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-[#DCE8F5] py-6 text-center">
          <svg className="h-8 w-8 text-[#ACACAC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm text-[#ACACAC]">Нет событий</p>
          <button
            type="button"
            onClick={handleOpenNew}
            className="mt-1 text-xs font-medium text-[#457B9D] hover:underline"
          >
            Добавить событие
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {displayEvents.map((event) => (
            <button
              key={event.id}
              type="button"
              onClick={() => handleEdit(event)}
              className="group flex cursor-pointer items-center gap-3 rounded border-l-[12px] bg-white px-4 py-2 text-left shadow-[0_4px_4px_rgba(148,163,184,0.15)] transition-shadow hover:shadow-md"
              style={{ borderLeftColor: event.color }}
            >
              <IconAlertCircle className="h-5 w-5 flex-shrink-0" style={{ color: event.color }} />
              <div className="flex flex-1 flex-col gap-1">
                <span className="text-xs font-medium text-[#457B9D] group-hover:text-[#1D3557]">
                  {event.title}
                </span>
                <span className="text-[10px] text-[#457B9D]">
                  {new Date(event.date).toLocaleDateString(undefined, {
                    day: 'numeric',
                    month: 'long',
                    weekday: 'long',
                  })}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-[#457B9D]">
                  <IconClock className="h-3 w-3 text-[#457B9D]" />
                  {event.time}
                </span>
              </div>
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
            </button>
          ))}
        </div>
      )}

      {modalOpen && (
        <EventModal
          event={editingEvent ?? undefined}
          onSave={handleSave}
          onDelete={editingEvent ? handleDelete : undefined}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
