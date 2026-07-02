import { useState, useEffect } from 'react'
import { loadTeacher, updateTeacherProfile } from '../lib/teacherStore'

type TeacherProfileModalProps = {
  onClose: () => void
}

export default function TeacherProfileModal({ onClose }: TeacherProfileModalProps) {
  const [fullName, setFullName] = useState('')
  const [subject, setSubject] = useState('')

  useEffect(() => {
    const teacher = loadTeacher()
    if (teacher) {
      setFullName(teacher.fullName)
      setSubject(teacher.subject || '')
    }
  }, [])

  function handleSave() {
    if (!fullName.trim()) {
      alert('Please enter your name')
      return
    }
    updateTeacherProfile({
      fullName: fullName.trim(),
      subject: subject.trim() || undefined,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DCE8F5] px-6 py-4">
          <h2 className="text-xl font-bold text-[#1D3557]">Teacher Profile</h2>
          <button
            onClick={onClose}
            className="text-[#ACACAC] transition-colors hover:text-[#1D3557]"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-[#1D3557]">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g., Нефедова Ольга Борисовна"
              className="w-full rounded-lg border border-[#DCE8F5] px-4 py-3 text-sm text-[#1D3557] outline-none transition-colors focus:border-[#457B9D]"
              autoFocus
            />
          </div>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-[#1D3557]">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Mathematics, English, Geography"
              className="w-full rounded-lg border border-[#DCE8F5] px-4 py-3 text-sm text-[#1D3557] outline-none transition-colors focus:border-[#457B9D]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-[#DCE8F5] px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-[#DCE8F5] px-6 py-2 text-sm font-medium text-[#1D3557] transition-colors hover:bg-[#F8F9FA]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-[#457B9D] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1D3557]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
