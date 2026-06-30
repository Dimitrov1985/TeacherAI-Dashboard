export const PERIODS = [
  '1st Quarter',
  '2nd Quarter',
  '3rd Quarter',
  '4th Quarter',
  'Semester 1',
  'Semester 2',
  'Year',
] as const

export type Period = typeof PERIODS[number]
