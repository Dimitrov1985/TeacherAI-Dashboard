import { useEffect, useRef, useState } from 'react'
import type { GeneratedLessonPlan, Material } from '../../data/lessonDetails'

type GeneratePlanModalProps = {
  onClose: () => void
  onGenerate: (material: Material) => void
}

export default function GeneratePlanModal({ onClose, onGenerate }: GeneratePlanModalProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && !loading) onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose, loading])

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setError(null)
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function handleGenerate() {
    if (!preview) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageDataUrl: preview }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to generate lesson plan')
      }
      const plan = data.plan as GeneratedLessonPlan
      onGenerate({
        icon: '📘',
        title: plan.title,
        meta: `AI-generated · ${plan.flashcards.length} flashcards`,
        plan,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate lesson plan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4"
      onClick={(event) => {
        event.stopPropagation()
        if (!loading) onClose()
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-white p-5 shadow-xl"
      >
        <h3 className="text-base font-semibold text-[#1D3557]">Generate lesson plan</h3>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#DCE8F5] py-8 text-center transition-colors hover:border-[#457B9D] disabled:opacity-60"
        >
          {preview ? (
            <img src={preview} alt={fileName ?? 'Textbook page'} className="max-h-40 rounded-lg object-contain" />
          ) : (
            <>
              <span className="text-3xl">📷</span>
              <span className="text-sm font-medium text-[#457B9D]">Загрузите страницу учебника</span>
              <span className="text-xs text-[#B1B1B1]">PNG, JPG</span>
            </>
          )}
        </button>

        {fileName && <p className="truncate text-xs text-[#B1B1B1]">{fileName}</p>}
        {error && <p className="text-xs text-[#FF4974]">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg px-3 py-2 text-sm font-medium text-[#457B9D] hover:bg-[#DCE8F5] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!preview || loading}
            className="rounded-lg bg-[#457B9D] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D3557] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? 'Analyzing photo…' : 'Generate'}
          </button>
        </div>
      </div>
    </div>
  )
}
