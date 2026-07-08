import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  IconHome,
  IconCourses,
  IconHomework,
  IconStudents,
  IconAttendance,
  IconDuties,
  IconGrading,
  IconAlumni,
} from './icons'
import { loadTeacher } from '../../lib/teacherStore'
import TeacherProfileModal from '../TeacherProfileModal'

const navItems = [
  { label: 'Dashboard', icon: IconHome, path: '/' },
  { label: 'My lessons', icon: IconCourses, path: '/lessons' },
  { label: 'Homework', icon: IconHomework, path: '/homework' },
  { label: 'Students', icon: IconStudents, path: '/students' },
  { label: 'Attendance', icon: IconAttendance, path: '/attendance' },
  { label: 'Duties', icon: IconDuties, path: '/duties' },
  { label: 'Grading', icon: IconGrading, path: '/grading' },
  { label: 'Alumni', icon: IconAlumni, path: '/alumni' },
]

export default function Sidebar() {
  const location = useLocation()
  const [teacherName, setTeacherName] = useState('')
  const [showProfileModal, setShowProfileModal] = useState(false)

  useEffect(() => {
    updateTeacherInfo()

    function handleTeacherChange() {
      updateTeacherInfo()
    }

    window.addEventListener('teacher-changed', handleTeacherChange)
    return () => {
      window.removeEventListener('teacher-changed', handleTeacherChange)
    }
  }, [])

  function updateTeacherInfo() {
    const teacher = loadTeacher()
    setTeacherName(teacher?.fullName || 'Teacher Name')
  }

  return (
    <aside className="flex w-full flex-col gap-6 bg-[#DCE8F5] px-4 py-6 lg:h-full lg:w-60 lg:flex-shrink-0 lg:gap-8 lg:rounded-r-[30px] lg:overflow-y-auto">
      <div className="flex flex-col items-center gap-3">
        {/* TeacherHub Logo */}
        <svg width="80" height="80" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="TeacherHub icon">
          <circle cx="24" cy="15" r="11" fill="#F9CB32"/>
          <circle cx="24" cy="15" r="7.5" fill="#F9E27A"/>
          <path d="M2 24 C10 18.5, 19 18.5, 24 22 C29 18.5, 38 18.5, 46 24 L46 40 C38 34.5, 29 34.5, 24 38 C19 34.5, 10 34.5, 2 40 Z" fill="#457B9D"/>
          <path d="M4.5 26 C11.5 21.5, 19.5 21.5, 24 24.5 L24 35.5 C19.5 32.5, 11.5 32.5, 4.5 37 Z" fill="#DCE8F5"/>
          <path d="M43.5 26 C36.5 21.5, 28.5 21.5, 24 24.5 L24 35.5 C28.5 32.5, 36.5 32.5, 43.5 37 Z" fill="#DCE8F5"/>
          <line x1="24" y1="24.5" x2="24" y2="35.5" stroke="#457B9D" strokeWidth="1"/>
          <line x1="8.5" y1="27" x2="19.5" y2="25.7" stroke="#9FBFD8" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="8.5" y1="30" x2="19.5" y2="28.7" stroke="#9FBFD8" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="28.5" y1="25.7" x2="39.5" y2="27" stroke="#9FBFD8" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="28.5" y1="28.7" x2="39.5" y2="30" stroke="#9FBFD8" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        <div className="flex flex-col items-center gap-0.5 text-center">
          <h1 className="text-lg font-bold text-[#1D3557]">TeacherHub</h1>
          <button
            onClick={() => setShowProfileModal(true)}
            className="text-xs font-medium text-[#457B9D] hover:underline cursor-pointer"
            title="Click to edit your profile"
          >
            {teacherName}
          </button>
        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#457B9D] to-transparent" />

      <nav className="flex flex-col gap-1">
        {navItems.map(({ label, icon: Icon, path }) => {
          const isActive = location.pathname === path
          return (
            <Link
              key={label}
              to={path}
              className={`flex items-center gap-4 rounded-2xl px-4 py-2 text-base font-medium transition-colors ${
                isActive ? 'bg-[#457B9D] text-white' : 'text-[#457B9D] hover:bg-[#457B9D]/10'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Teacher Profile Modal */}
      {showProfileModal && (
        <TeacherProfileModal onClose={() => setShowProfileModal(false)} />
      )}
    </aside>
  )
}
