import { useEffect, useState } from 'react'
import type { Lesson } from '../../data/lessons'
import { LESSON_DETAILS, type Homework, type Material } from '../../data/lessonDetails'
import { loadMaterials, saveMaterials } from '../../lib/materialsStore'
import { exportLessonPlanToWord } from '../../lib/exportToWord'
import { emitMaterialsChange } from '../../lib/storageEvents'
import { IconClock } from './icons'
import GeneratePlanModal from './GeneratePlanModal'
import LessonPlanViewer from './LessonPlanViewer'

type Tab = 'materials' | 'homework'

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-[#5272E9]/15 text-[#1a237e]',
  graded: 'bg-[#3ECD88]/15 text-[#1b5e20]',
  overdue: 'bg-[#FF4974]/15 text-[#c62828]',
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

type LessonDetailModalProps = {
  lesson: Lesson
  onClose: () => void
  onEdit: () => void
}

export default function LessonDetailModal({ lesson, onClose, onEdit }: LessonDetailModalProps) {
  const detail = LESSON_DETAILS[lesson.title]
  const [tab, setTab] = useState<Tab>('materials')
  const [homework, setHomework] = useState<Homework[]>(detail?.homework ?? [])
  const [materials, setMaterials] = useState<Material[]>(() =>
    loadMaterials(lesson.id, detail?.materials ?? []),
  )
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null)
  const [generateOpen, setGenerateOpen] = useState(false)
  const [viewingPlanIndex, setViewingPlanIndex] = useState<number | null>(null)

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  function toggleHomework(index: number) {
    setHomework((current) =>
      current.map((hw, i) => (i === index ? { ...hw, done: !hw.done } : hw)),
    )
  }

  function addMaterial(material: Material) {
    const updated = [...materials, material]
    setMaterials(updated)
    saveMaterials(lesson.id, updated)
    emitMaterialsChange()
  }

  function removeMaterial(index: number) {
    const updated = materials.filter((_, i) => i !== index)
    setMaterials(updated)
    saveMaterials(lesson.id, updated)
    setConfirmDeleteIndex(null)
    emitMaterialsChange()
  }

  async function handleDownloadMaterial(material: Material, event: React.MouseEvent) {
    event.stopPropagation()
    if (!material.plan) return

    try {
      await exportLessonPlanToWord(material.plan)
    } catch (error) {
      console.error('Error exporting to Word:', error)
      alert('Ошибка при экспорте в Word')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-md flex-col gap-4 rounded-2xl bg-white p-5 shadow-xl"
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
            style={{ backgroundColor: detail?.iconBg ?? lesson.bg }}
          >
            {detail?.icon ?? '📘'}
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold text-[#1D3557]">{lesson.title}</span>
            <span className="flex items-center gap-1 text-xs text-[#457B9D]">
              <IconClock className="h-3 w-3" />
              {lesson.start} – {lesson.end}
            </span>
          </div>
          <button
            type="button"
            onClick={onEdit}
            className="ml-auto rounded-lg px-3 py-1.5 text-sm font-medium text-[#457B9D] hover:bg-[#DCE8F5]"
          >
            Edit
          </button>
        </div>

        <div className="flex gap-1 border-b border-[#DCE8F5]">
          {(['materials', 'homework'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-3 py-2 text-sm font-medium capitalize transition-colors ${
                tab === t ? 'border-b-2 border-[#457B9D] text-[#457B9D]' : 'text-[#B1B1B1] hover:text-[#457B9D]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === 'materials' ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                {materials.map((m, index) =>
                  confirmDeleteIndex === index ? (
                    <div
                      key={`${m.title}-${index}`}
                      className="flex items-center gap-3 rounded-lg bg-[#FF4974]/10 px-3 py-2"
                    >
                      <span className="flex-1 text-sm text-[#c62828]">Delete "{m.title}"? Are you sure?</span>
                      <button
                        type="button"
                        onClick={() => removeMaterial(index)}
                        className="rounded-lg bg-[#FF4974] px-2.5 py-1 text-xs font-medium text-white hover:bg-[#c62828]"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteIndex(null)}
                        className="rounded-lg px-2.5 py-1 text-xs font-medium text-[#457B9D] hover:bg-white"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div key={`${m.title}-${index}`} className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-[#DCE8F5]/50">
                      <button
                        type="button"
                        onClick={() => m.plan && setViewingPlanIndex(index)}
                        disabled={!m.plan}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-default"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#DCE8F5] text-lg">
                          {m.icon}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-sm font-medium text-[#1D3557]">{m.title}</span>
                          <span className="text-xs text-[#B1B1B1]">{m.meta}</span>
                        </div>
                        <span className="text-[#457B9D]">{m.plan ? '🗂️' : '⬇'}</span>
                      </button>
                      {m.plan && (
                        <button
                          type="button"
                          aria-label="Download as Word"
                          onClick={(e) => handleDownloadMaterial(m, e)}
                          className="text-[#457B9D] hover:text-[#1D3557]"
                          title="Скачать Word"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      )}
                      <button
                        type="button"
                        aria-label="Remove material"
                        onClick={() => setConfirmDeleteIndex(index)}
                        className="text-[#B1B1B1] hover:text-[#FF4974]"
                      >
                        ✕
                      </button>
                    </div>
                  ),
                )}
                {materials.length === 0 && (
                  <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-[#DCE8F5] py-8 text-center">
                    <span className="text-3xl">📂</span>
                    <p className="text-sm font-medium text-[#457B9D]">No materials yet</p>
                    <p className="px-6 text-xs text-[#B1B1B1]">
                      Generated lesson plans and uploaded files will show up here.
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-[#DCE8F5] pt-3">
                <button
                  type="button"
                  onClick={() => setGenerateOpen(true)}
                  className="w-full rounded-lg bg-[#457B9D] px-3 py-2 text-sm font-medium text-white hover:bg-[#1D3557]"
                >
                  Сгенерировать план урока
                </button>
              </div>
            </div>
          ) : homework.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-[#DCE8F5] py-8 text-center">
              <span className="text-3xl">🎉</span>
              <p className="text-sm font-medium text-[#457B9D]">No homework yet</p>
              <p className="px-6 text-xs text-[#B1B1B1]">Assignments for this lesson will appear here.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {homework.map((hw, index) => (
                <div key={hw.title} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleHomework(index)}
                    aria-label={hw.done ? 'Mark as not done' : 'Mark as done'}
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 text-xs text-white transition-colors ${
                      hw.done ? 'border-[#3ECD88] bg-[#3ECD88]' : 'border-[#DCE8F5] bg-white'
                    }`}
                  >
                    {hw.done && '✓'}
                  </button>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium text-[#1D3557]">{hw.title}</span>
                    <span className="text-xs text-[#B1B1B1]">{hw.due}</span>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[hw.status]}`}>
                    {capitalize(hw.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="self-end rounded-lg px-3 py-2 text-sm font-medium text-[#457B9D] hover:bg-[#DCE8F5]"
        >
          Close
        </button>
      </div>

      {generateOpen && (
        <GeneratePlanModal onClose={() => setGenerateOpen(false)} onGenerate={addMaterial} />
      )}

      {viewingPlanIndex !== null && materials[viewingPlanIndex]?.plan && (
        <LessonPlanViewer
          plan={materials[viewingPlanIndex].plan!}
          onClose={() => setViewingPlanIndex(null)}
        />
      )}
    </div>
  )
}
