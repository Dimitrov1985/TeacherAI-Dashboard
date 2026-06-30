export type Student = {
  id: string
  studentId?: string // ID No. - номер студента
  firstName: string
  lastName: string
  middleName?: string
  classId: string // Reference to Class
  subjectId: string // Reference to Subject
  periodId: string // Reference to Period
  dateOfBirth?: string // ISO date
  photo?: string // URL or base64
  email?: string
  phone?: string
  parentName?: string
  parentPhone?: string
  notes?: string
  createdAt: number
}

export type Grade = {
  id: string
  studentId: string
  subject: string
  grade: number // 1-5 or 1-10 depending on system
  date: string // ISO date
  type: 'test' | 'homework' | 'classwork' | 'exam' | 'project'
  topic?: string
  notes?: string
}

export type Attendance = {
  id: string
  studentId: string
  date: string // ISO date
  status: 'present' | 'absent' | 'late' | 'excused'
  lessonId?: string // link to lesson
  notes?: string
}

export const GRADE_COLORS: Record<number, string> = {
  5: '#3ECD88', // green
  4: '#24B0C9', // teal
  3: '#D78D03', // orange
  2: '#FF4974', // red
  1: '#FF4974', // red
}

export const ATTENDANCE_COLORS = {
  present: '#3ECD88',
  absent: '#FF4974',
  late: '#D78D03',
  excused: '#24B0C9',
}

export const ATTENDANCE_LABELS = {
  present: 'Присутствует',
  absent: 'Отсутствует',
  late: 'Опоздал',
  excused: 'Уважительная',
}
