import { useRef, useState, useEffect } from 'react'
import type { ChangeEvent } from 'react'
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
  IconPencil,
} from './icons'
import { loadTeacher } from '../../lib/teacherStore'
import TeacherProfileModal from '../TeacherProfileModal'

const navItems = [
  { label: 'Dashboard', icon: IconHome, path: '/' },
  { label: 'My lessons', icon: IconCourses, path: '/lessons' },
  { label: 'Homework', icon: IconHomework, path: '/homework' },
  { label: 'Students', icon: IconStudents, path: '/students' },
  { label: 'Paid Courses', icon: IconCourses, path: '/paid-courses' },
  { label: 'Attendance', icon: IconAttendance, path: '/attendance' },
  { label: 'Duties', icon: IconDuties, path: '/duties' },
  { label: 'Grading', icon: IconGrading, path: '/grading' },
  { label: 'Alumni', icon: IconAlumni, path: '/alumni' },
]

const AVATAR_STORAGE_KEY = 'teacher-dashboard:avatar-image'

export default function Sidebar() {
  const location = useLocation()
  const [avatarImage, setAvatarImage] = useState<string | null>(() =>
    localStorage.getItem(AVATAR_STORAGE_KEY),
  )
  const [teacherName, setTeacherName] = useState('')
  const [teacherSubject, setTeacherSubject] = useState('')
  const [showProfileModal, setShowProfileModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    updateTeacherInfo()

    function handleTeacherChange() {
      updateTeacherInfo()
    }

    window.addEventListener('teacher-changed', handleTeacherChange)
    return () => window.removeEventListener('teacher-changed', handleTeacherChange)
  }, [])

  function updateTeacherInfo() {
    const teacher = loadTeacher()
    setTeacherName(teacher?.fullName || 'Teacher Name')
    setTeacherSubject(teacher?.subject || 'Учитель')
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setAvatarImage(dataUrl)
      localStorage.setItem(AVATAR_STORAGE_KEY, dataUrl)
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  return (
    <aside className="flex w-full flex-col gap-6 bg-[#DCE8F5] px-4 py-6 lg:h-full lg:w-60 lg:flex-shrink-0 lg:gap-8 lg:rounded-r-[30px] lg:overflow-y-auto">
      <div className="flex flex-col items-center gap-4">
        <div className="group relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            aria-label="Change avatar"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -top-3 left-1/2 z-10 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full bg-[#457B9D] text-white opacity-0 transition-opacity group-hover:opacity-100"
          >
            <IconPencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="Change avatar"
            onClick={() => fileInputRef.current?.click()}
            className="h-20 w-20 overflow-hidden rounded-full border-4 border-[#457B9D] bg-gray-300 transition-opacity group-hover:opacity-80 lg:h-[100px] lg:w-[100px]"
          >
            {avatarImage && (
              <img src={avatarImage} alt="Teacher avatar" className="h-full w-full object-cover" />
            )}
          </button>
        </div>
        <div className="flex flex-col items-center gap-0.5 text-center">
          <button
            onClick={() => setShowProfileModal(true)}
            className="text-sm font-medium text-[#1D3557] hover:underline cursor-pointer"
            title="Click to edit your profile"
          >
            {teacherName}
          </button>
          <span className="text-xs font-normal text-[#ACACAC]">{teacherSubject}</span>
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
