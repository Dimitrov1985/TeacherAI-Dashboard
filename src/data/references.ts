// Reference data types
export type Class = {
  id: string
  name: string
}

export type Subject = {
  id: string
  name: string
}

export type Period = {
  id: string
  name: string
}

export type Teacher = {
  id: string
  fullName: string
}

// Initial reference data
export const INITIAL_CLASSES: Class[] = []

export const INITIAL_SUBJECTS: Subject[] = [
  { id: '1', name: 'Mathematics' },
  { id: '2', name: 'Physics' },
  { id: '3', name: 'Chemistry' },
  { id: '4', name: 'Biology' },
  { id: '5', name: 'English' },
  { id: '6', name: 'Thai' },
  { id: '7', name: 'Chinese' },
  { id: '8', name: 'History' },
  { id: '9', name: 'Geography' },
  { id: '10', name: 'Social Studies' },
  { id: '11', name: 'Computer Science' },
  { id: '12', name: 'Physical Education' },
  { id: '13', name: 'Art' },
  { id: '14', name: 'Music' },
]

export const INITIAL_PERIODS: Period[] = [
  { id: '1', name: '1st Quarter' },
  { id: '2', name: '2nd Quarter' },
  { id: '3', name: '3rd Quarter' },
  { id: '4', name: '4th Quarter' },
  { id: '5', name: 'Semester 1' },
  { id: '6', name: 'Semester 2' },
  { id: '7', name: 'Year' },
]

export const INITIAL_TEACHERS: Teacher[] = [
  { id: '1', fullName: 'Teacher Name' },
]
