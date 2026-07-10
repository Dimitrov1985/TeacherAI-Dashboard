import { useState, useEffect } from 'react'
import type { Homework } from '../lib/homeworkStore'
import { loadHomework } from '../lib/homeworkStore'
import { loadClasses } from '../lib/referencesStore'
import AddHomeworkModal from '../components/Homework/AddHomeworkModal'
import HomeworkCard from '../components/Homework/HomeworkCard'
import SubmissionsModal from '../components/Homework/SubmissionsModal'

export default function HomeworkPage() {
  const [homework, setHomework] = useState<Homework[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null)
  const [filterClass, setFilterClass] = useState('')
  const [filterSubject, setFilterSubject] = useState('')

  useEffect(() => {
    loadData()

    function handleChange() {
      loadData()
    }

    window.addEventListener('homework-changed', handleChange)
    return () => window.removeEventListener('homework-changed', handleChange)
  }, [])

  function loadData() {
    setHomework(loadHomework())
  }

  // Фильтрация
  const filtered = homework.filter((hw) => {
    if (filterClass && hw.classId !== filterClass) return false
    if (filterSubject && hw.subject !== filterSubject) return false
    return true
  })

  // Загрузить классы из справочника
  const classes = loadClasses()

  // Уникальные предметы из заданий
  const subjects = Array.from(new Set(homework.map((hw) => hw.subject).filter(Boolean)))

  return (
    <div
      className="flex flex-1 flex-col gap-6 overflow-y-auto p-8"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1D3557]">Homework</h1>
          <p className="text-sm text-[#94a3b8]">{filtered.length} assignments</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filters */}
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm outline-none"
          >
            <option value="">All classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm outline-none"
          >
            <option value="">All subjects</option>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-lg bg-[#457B9D] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1D3557]"
          >
            + Add Homework
          </button>
        </div>
      </div>

      {/* Homework Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((hw) => (
          <HomeworkCard
            key={hw.id}
            homework={hw}
            onClick={() => setSelectedHomework(hw)}
          />
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 text-6xl">📚</div>
          <h3 className="mb-2 text-lg font-semibold text-[#1D3557]">No homework yet</h3>
          <p className="mb-4 text-sm text-[#94a3b8]">Create your first homework assignment</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-lg bg-[#457B9D] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1D3557]"
          >
            + Add Homework
          </button>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddHomeworkModal onClose={() => setShowAddModal(false)} />
      )}

      {selectedHomework && (
        <SubmissionsModal
          homework={selectedHomework}
          onClose={() => setSelectedHomework(null)}
        />
      )}
    </div>
  )
}
