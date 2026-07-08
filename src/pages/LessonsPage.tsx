import { useState, useEffect } from 'react'
import GenerateLessonModal from '../components/GenerateLessonModal'
import LinkToScheduleModal from '../components/LinkToScheduleModal'
import LessonsStatistics from '../components/LessonsStatistics'
import { loadLessonPlans, saveLessonPlan, deleteLessonPlan, linkLessonPlan, type SavedLessonPlan } from '../lib/lessonsStore'
import { exportLessonPlanToWord } from '../lib/exportToWord'

export default function LessonsPage() {
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showGradeModal, setShowGradeModal] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<any>(null)
  const [selectedPlanForLink, setSelectedPlanForLink] = useState<string | null>(null)
  const [lessonPlans, setLessonPlans] = useState<SavedLessonPlan[]>([])
  const [filterGrade, setFilterGrade] = useState('')
  const [filterTopic, setFilterTopic] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    // Загрузить планы при монтировании
    setLessonPlans(loadLessonPlans())

    // Подписаться на изменения
    function handlePlansChange() {
      setLessonPlans(loadLessonPlans())
    }

    window.addEventListener('lesson-plans-changed', handlePlansChange)

    return () => {
      window.removeEventListener('lesson-plans-changed', handlePlansChange)
    }
  }, [])

  function handleGenerateClick() {
    setShowGenerateModal(true)
  }

  function handleGenerate(plan: any) {
    setCurrentPlan(plan)
    setShowGenerateModal(false)
    setShowGradeModal(true)
  }

  function handleSaveWithGrade(grade: string) {
    if (currentPlan) {
      const saved = saveLessonPlan(currentPlan, grade)
      setLessonPlans([saved, ...lessonPlans])
      setShowGradeModal(false)
      setCurrentPlan(null)
    }
  }

  function handleDelete(id: string) {
    deleteLessonPlan(id)
    setLessonPlans(lessonPlans.filter(p => p.id !== id))
  }

  async function handleDownload(plan: SavedLessonPlan) {
    try {
      await exportLessonPlanToWord(plan.plan)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  function handleLinkClick(planId: string) {
    setSelectedPlanForLink(planId)
    setShowLinkModal(true)
  }

  function handleLink(lessonId: string) {
    if (selectedPlanForLink) {
      linkLessonPlan(selectedPlanForLink, lessonId)
      setLessonPlans(loadLessonPlans())
      setShowLinkModal(false)
      setSelectedPlanForLink(null)
    }
  }

  const filteredPlans = lessonPlans.filter(plan => {
    const matchesGrade = !filterGrade || plan.grade.toLowerCase().includes(filterGrade.toLowerCase())
    const matchesTopic = !filterTopic || plan.plan.title.toLowerCase().includes(filterTopic.toLowerCase())
    return matchesGrade && matchesTopic
  })

  return (
    <main className="flex flex-1 flex-col overflow-y-auto bg-white p-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#1D3557]">Мои уроки</h1>

          {/* Переключатель вида */}
          <div className="flex gap-2 rounded-lg bg-[#f0f6ff] p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-[#457B9D] shadow-sm'
                  : 'text-[#B1B1B1] hover:text-[#457B9D]'
              }`}
            >
              <span className="text-base">▦</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-[#457B9D] shadow-sm'
                  : 'text-[#B1B1B1] hover:text-[#457B9D]'
              }`}
            >
              <span className="text-base">☰</span>
            </button>
          </div>
        </div>

        {/* Фильтры */}
        <div className="mb-6 flex gap-3">
          <input
            type="text"
            placeholder="Фильтр по классу..."
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="rounded-lg border border-[#DCE8F5] px-4 py-2 text-sm outline-none focus:border-[#457B9D]"
          />
          <input
            type="text"
            placeholder="Фильтр по теме..."
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
            className="rounded-lg border border-[#DCE8F5] px-4 py-2 text-sm outline-none focus:border-[#457B9D]"
          />
        </div>

        {/* Статистика */}
        <LessonsStatistics lessonPlans={lessonPlans} />

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Карточка для генерации урока */}
            <button
              onClick={handleGenerateClick}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#DCE8F5] p-6 text-center transition-colors hover:border-[#457B9D] hover:bg-[#DCE8F5]/50"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#457B9D]/10">
                <span className="text-3xl">✨</span>
              </div>
              <div>
                <p className="font-semibold text-[#1D3557]">Сгенерировать план урока</p>
                <p className="text-sm text-[#B1B1B1]">Создайте план с помощью AI</p>
              </div>
            </button>

            {/* Карточки планов уроков */}
            {filteredPlans.map((lesson) => (
              <div
                key={lesson.id}
                className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-[0_6px_12px_rgba(148,163,184,0.15)] transition-shadow hover:shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#457B9D]/10 text-2xl">
                    📘
                  </div>
                  <span className="rounded-full bg-[#3ECD88]/10 px-3 py-1 text-xs font-medium text-[#3ECD88]">
                    {lesson.grade}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-semibold text-[#1D3557]">{lesson.plan.title}</h3>
                  <p className="line-clamp-2 text-sm text-[#457B9D]">
                    {lesson.plan.objectives?.join(', ') || 'Цели урока'}
                  </p>
                  {lesson.linkedLessonId && (
                    <span className="text-xs text-[#3ECD88]">🔗 Привязан к расписанию</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(lesson)}
                    className="flex-1 rounded-lg bg-[#457B9D] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1D3557]"
                  >
                    Скачать
                  </button>
                  <button
                    onClick={() => handleLinkClick(lesson.id)}
                    className="rounded-lg border border-[#457B9D] px-3 py-2 text-sm font-medium text-[#457B9D] transition-colors hover:bg-[#457B9D]/10"
                    title="Привязать к расписанию"
                  >
                    🔗
                  </button>
                  <button
                    onClick={() => handleDelete(lesson.id)}
                    className="rounded-lg border border-[#CE1821] px-3 py-2 text-sm font-medium text-[#CE1821] transition-colors hover:bg-[#CE1821]/10"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="space-y-3">
            {/* Кнопка генерации в режиме списка */}
            <button
              onClick={handleGenerateClick}
              className="flex w-full items-center gap-4 rounded-xl border-2 border-dashed border-[#DCE8F5] bg-white p-4 text-left transition-colors hover:border-[#457B9D] hover:bg-[#DCE8F5]/50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#457B9D]/10">
                <span className="text-2xl">✨</span>
              </div>
              <div>
                <p className="font-semibold text-[#1D3557]">Сгенерировать план урока</p>
                <p className="text-xs text-[#B1B1B1]">Создайте план с помощью AI</p>
              </div>
            </button>

            {/* Список планов */}
            {filteredPlans.map((lesson) => (
              <div
                key={lesson.id}
                className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-[0_4px_8px_rgba(148,163,184,0.1)] transition-shadow hover:shadow-lg"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#457B9D]/10 text-xl">
                  📘
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[#1D3557]">{lesson.plan.title}</h3>
                    <span className="rounded-full bg-[#3ECD88]/10 px-2 py-0.5 text-xs font-medium text-[#3ECD88]">
                      {lesson.grade}
                    </span>
                    {lesson.linkedLessonId && (
                      <span className="text-xs text-[#3ECD88]">🔗</span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-1 text-sm text-[#457B9D]">
                    {lesson.plan.objectives?.join(', ') || 'Цели урока'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(lesson)}
                    className="rounded-lg bg-[#457B9D] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1D3557]"
                  >
                    Скачать
                  </button>
                  <button
                    onClick={() => handleLinkClick(lesson.id)}
                    className="rounded-lg border border-[#457B9D] px-3 py-2 text-sm font-medium text-[#457B9D] transition-colors hover:bg-[#457B9D]/10"
                    title="Привязать к расписанию"
                  >
                    🔗
                  </button>
                  <button
                    onClick={() => handleDelete(lesson.id)}
                    className="rounded-lg border border-[#CE1821] px-3 py-2 text-sm font-medium text-[#CE1821] transition-colors hover:bg-[#CE1821]/10"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showGenerateModal && (
        <GenerateLessonModal
          onClose={() => setShowGenerateModal(false)}
          onGenerate={handleGenerate}
        />
      )}

      {showGradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-semibold text-[#1D3557]">Укажите класс</h3>
            <input
              type="text"
              placeholder="Например: 6А или Grade 6"
              className="mb-4 w-full rounded-lg border border-[#DCE8F5] px-4 py-2 text-sm outline-none focus:border-[#457B9D]"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSaveWithGrade((e.target as HTMLInputElement).value)
                }
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowGradeModal(false)}
                className="flex-1 rounded-lg border border-[#DCE8F5] px-4 py-2 text-sm font-medium text-[#457B9D]"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  const input = document.querySelector('input[placeholder*="класс"]') as HTMLInputElement
                  handleSaveWithGrade(input?.value || '')
                }}
                className="flex-1 rounded-lg bg-[#457B9D] px-4 py-2 text-sm font-medium text-white"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {showLinkModal && (
        <LinkToScheduleModal
          onClose={() => {
            setShowLinkModal(false)
            setSelectedPlanForLink(null)
          }}
          onLink={handleLink}
        />
      )}
    </main>
  )
}
