export type CalendarNote = {
  id: string
  date: string // ISO yyyy-mm-dd
  title: string
  content: string
  color: string
  createdAt: number
}

export const DEFAULT_NOTE_COLORS = [
  '#CE1821', // Red
  '#F99132', // Orange
  '#F9CB32', // Yellow
  '#3ECD88', // Green
  '#457B9D', // Blue
  '#9B59B6', // Purple
  '#E91E63', // Pink
]
