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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="flex w-full max-w-lg flex-col gap-5 rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-[#1D3557]">Add Homework</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-[#B1B1B1] transition-colors hover:text-[#1D3557]"
          >
            ×
          </button>
        </div>

        {/* AI Generate button */}
        <button
          type="button"
          onClick={() => setShowAIModal(true)}
          className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#7c3aed] bg-[#7c3aed]/5 px-4 py-3 text-sm font-medium text-[#7c3aed] transition-colors hover:bg-[#7c3aed]/10"
        >
          <span>✨</span>
          <span>Generate with AI</span>
        </button>

        {/* Title */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#1D3557]">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Read Chapter 5 & summarize"
            className="rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm outline-none focus:border-[#457B9D]"
            required
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#1D3557]">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed instructions for students..."
            rows={4}
            className="resize-none rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm outline-none focus:border-[#457B9D]"
          />
        </div>

        {/* Subject & Class */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#1D3557]">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm outline-none focus:border-[#457B9D]"
            >
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#1D3557]">Class *</label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm outline-none focus:border-[#457B9D]"
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
          <label className="text-sm font-medium text-[#1D3557]">Due Date *</label>
          <input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className="rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm outline-none focus:border-[#457B9D]"
            required
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-[#DCE8F5] px-4 py-2 text-sm font-medium text-[#457B9D] transition-colors hover:bg-[#DCE8F5]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 rounded-lg bg-[#457B9D] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1D3557]"
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
