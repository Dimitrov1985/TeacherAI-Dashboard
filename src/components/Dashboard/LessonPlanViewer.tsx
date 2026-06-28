import { useEffect, useState } from 'react'
import type { GeneratedLessonPlan } from '../../data/lessonDetails'
import { exportLessonPlanToWord } from '../../lib/exportToWord'

type LessonPlanViewerProps = {
  plan: GeneratedLessonPlan
  onClose: () => void
}

export default function LessonPlanViewer({ plan, onClose }: LessonPlanViewerProps) {
  const [cardIndex, setCardIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const card = plan.flashcards[cardIndex]

  function nextCard() {
    setFlipped(false)
    setCardIndex((i) => (i + 1) % plan.flashcards.length)
  }

  function prevCard() {
    setFlipped(false)
    setCardIndex((i) => (i - 1 + plan.flashcards.length) % plan.flashcards.length)
  }

  async function handleDownloadWord() {
    try {
      await exportLessonPlanToWord(plan)
    } catch (error) {
      console.error('Error exporting to Word:', error)
      alert('Ошибка при экспорте в Word')
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4"
      onClick={(event) => {
        event.stopPropagation()
        onClose()
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
      >
        <h3 className="text-base font-semibold text-[#1D3557]">{plan.title}</h3>

        <div>
          <h4 className="mb-1 text-sm font-semibold text-[#457B9D]">Objectives</h4>
          <ul className="list-disc pl-5 text-sm text-[#1D3557]">
            {plan.objectives.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </div>

        {plan.flashcards.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-[#457B9D]">
              Flashcards ({cardIndex + 1}/{plan.flashcards.length})
            </h4>
            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              className="flex min-h-28 w-full items-center justify-center rounded-xl bg-[#DCE8F5] p-4 text-center text-sm font-medium text-[#1D3557] transition-colors hover:bg-[#DCE8F5]/70"
            >
              {flipped ? card.back : card.front}
            </button>
            <div className="mt-2 flex items-center justify-between">
              <button type="button" onClick={prevCard} className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#457B9D] hover:bg-[#DCE8F5]">
                ← Prev
              </button>
              <span className="text-xs text-[#B1B1B1]">Tap card to flip</span>
              <button type="button" onClick={nextCard} className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#457B9D] hover:bg-[#DCE8F5]">
                Next →
              </button>
            </div>
          </div>
        )}

        <div>
          <h4 className="mb-1 text-sm font-semibold text-[#457B9D]">Activities</h4>
          <ul className="list-disc pl-5 text-sm text-[#1D3557]">
            {plan.activities.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-1 text-sm font-semibold text-[#457B9D]">Materials needed</h4>
          <ul className="list-disc pl-5 text-sm text-[#1D3557]">
            {plan.materialsNeeded.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleDownloadWord}
            className="flex items-center gap-2 rounded-lg bg-[#457B9D] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#457B9D]/90"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Скачать Word
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-[#457B9D] hover:bg-[#DCE8F5]"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  )
}
