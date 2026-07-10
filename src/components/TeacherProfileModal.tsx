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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div
        className="w-full max-w-md rounded-xl shadow-xl"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Teacher Profile</h2>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g., Нефедова Ольга Борисовна"
              className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-colors"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              autoFocus
            />
          </div>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Mathematics, English, Geography"
              className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-colors"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-3 px-6 py-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <button
            onClick={onClose}
            className="rounded-lg px-6 py-2 text-sm font-medium transition-colors"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface-2)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg px-6 py-2 text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: 'var(--accent)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent)'}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
