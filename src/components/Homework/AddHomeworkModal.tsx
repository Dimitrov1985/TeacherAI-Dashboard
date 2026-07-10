import { useState, useEffect } from 'react'
import type { Homework, HomeworkSubmission } from '../../lib/homeworkStore'
import { addHomework } from '../../lib/homeworkStore'
import { loadStudents } from '../../lib/studentsStore'
import { loadClasses, loadSubjects } from '../../lib/referencesStore'
import GenerateHomeworkModal from './GenerateHomeworkModal'

type AddHomeworkModalProps = {
  onClose: () => void
}

export default function AddHomeworkModal({ onClose }: AddHomeworkModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState('')
  const [classId, setClassId] = useState('')
  const [due, setDue] = useState('')
  const [showAIModal, setShowAIModal] = useState(false)

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Загрузить классы и предметы из справочников
  const classes = loadClasses()
  const subjects = loadSubjects()
  const students = loadStudents()

  function handleAIGenerate(generated: any) {
    setTitle(generated.title)
    setDescription(
      generated.description +
      '\n\nTasks:\n' +
      generated.tasks.map((t: string, i: number) => `${i + 1}. ${t}`).join('\n') +
      (generated.estimatedTime ? `\n\nEstimated time: ${generated.estimatedTime}` : '') +
      (generated.resources?.length ? `\n\nResources: ${generated.resources.join(', ')}` : '')
    )
    setShowAIModal(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!title.trim() || !classId || !due) {
      alert('Please fill in all required fields')
      return
    }

    // Найти название класса
    const selectedClass = classes.find((c) => c.id === classId)
    if (!selectedClass) {
      alert('Class not found')
      return
    }

    // Создать submissions для всех студентов класса
    const classStudents = students.filter((s) => s.classId === classId)
    const submissions: HomeworkSubmission[] = classStudents.map((s) => ({
      studentId: s.id,
      done: false,
      grade: null,
    }))

    const homework: Homework = {
      id: `hw-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      subject: subject.trim() || 'General',
      classId,
      className: selectedClass.name,
      due,
      submissions,
      createdAt: Date.now(),
    }

    addHomework(homework)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="flex w-full max-w-lg flex-col gap-5 rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Add Homework</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            ×
          </button>
        </div>

        {/* AI Generate button */}
        <button
          type="button"
          onClick={() => setShowAIModal(true)}
          className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-3 text-sm font-medium transition-colors"
          style={{
            borderColor: '#7c3aed',
            backgroundColor: '#7c3aed10',
            color: '#7c3aed',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7c3aed20'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7c3aed10'}
        >
          <span>✨</span>
          <span>Generate with AI</span>
        </button>

        {/* Title */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Read Chapter 5 & summarize"
            className="rounded-lg px-3 py-2 text-sm outline-none"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            required
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed instructions for students..."
            rows={4}
            className="resize-none rounded-lg px-3 py-2 text-sm outline-none"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Subject & Class */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="rounded-lg px-3 py-2 text-sm outline-none"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Class *</label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="rounded-lg px-3 py-2 text-sm outline-none"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              required
            >
              <option value="">Select class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Due Date */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Due Date *</label>
          <input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm outline-none"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            required
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface-2)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: 'var(--accent)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent)'}
          >
            Create Homework
          </button>
        </div>
      </form>

      {/* AI Generation Modal */}
      {showAIModal && (
        <GenerateHomeworkModal
          subject={subject}
          grade={classes.find(c => c.id === classId)?.name}
          onClose={() => setShowAIModal(false)}
          onGenerate={handleAIGenerate}
        />
      )}
    </div>
  )
}
