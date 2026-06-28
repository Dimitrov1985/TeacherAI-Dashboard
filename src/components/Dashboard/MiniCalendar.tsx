import { IconArrowLeft, IconArrowRight } from './icons'
import { MONTH_NAMES, buildMonthGrid, isSameDay } from '../../lib/date'

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

type MiniCalendarProps = {
  month: Date
  selectedDate: Date
  noteDates: Set<string>
  onSelectDate: (date: Date) => void
  onPrevMonth: () => void
  onNextMonth: () => void
}

export default function MiniCalendar({
  month,
  selectedDate,
  noteDates,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: MiniCalendarProps) {
  const days = buildMonthGrid(month)

  return (
    <div className="flex w-full flex-col gap-2 rounded-xl bg-white px-3 py-2 shadow-[0_6px_12px_rgba(148,163,184,0.15)]">
      <div className="flex items-center justify-between py-2">
        <button type="button" aria-label="Previous month" onClick={onPrevMonth} className="transition-opacity hover:opacity-70">
          <IconArrowLeft className="h-5 w-5 text-[#457B9D]" />
        </button>
        <span className="text-base font-medium text-[#1D3557]">
          {MONTH_NAMES[month.getMonth()]} {month.getFullYear()}
        </span>
        <button type="button" aria-label="Next month" onClick={onNextMonth} className="transition-opacity hover:opacity-70">
          <IconArrowRight className="h-5 w-5 text-[#457B9D]" />
        </button>
      </div>

      <div className="grid grid-cols-7">
        {weekdays.map((d) => (
          <div key={d} className="py-1.5 text-center text-xs text-[#1D3557]">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((cell) => {
          const selected = isSameDay(cell.date, selectedDate)
          const hasNote = noteDates.has(cell.iso)
          return (
            <div key={cell.iso} className="flex items-center justify-center py-2">
              <button
                type="button"
                onClick={() => onSelectDate(cell.date)}
                className={`relative flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors ${
                  selected
                    ? 'bg-[#1D3557] text-white'
                    : cell.inCurrentMonth
                      ? 'text-[#457B9D] hover:bg-[#DCE8F5]'
                      : 'text-[#CBD5E1] hover:bg-[#DCE8F5]'
                }`}
              >
                {cell.day}
                {!selected && hasNote && (
                  <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-[#F9CB32]" />
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
