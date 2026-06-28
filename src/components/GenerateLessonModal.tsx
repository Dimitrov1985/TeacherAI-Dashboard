import { useState, useEffect, useRef } from 'react'
import type { GeneratedLessonPlan } from '../data/lessonDetails'

type GenerateLessonModalProps = {
  onClose: () => void
  onGenerate: (plan: GeneratedLessonPlan) => void
}

export default function GenerateLessonModal({ onClose, onGenerate }: GenerateLessonModalProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [grade, setGrade] = useState('')
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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!preview) {
      setError('Загрузите фото учебника')
      return
    }
    if (!grade.trim()) {
      setError('Укажите класс')
      return
    }

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
      onGenerate(plan)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate lesson plan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={loading ? undefined : onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="flex w-full max-w-lg flex-col gap-5 rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-[#1D3557]">✨ Сгенерировать план урока</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-2xl text-[#B1B1B1] transition-colors hover:text-[#1D3557] disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#1D3557]">Фото учебника</label>
          <div className="flex flex-col gap-3">
            <label className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#DCE8F5] bg-[#f8f9fa] p-6 transition-colors hover:border-[#457B9D] hover:bg-[#f0f6ff]">
              {preview ? (
                <div className="relative w-full">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-[300px] w-full rounded-lg object-contain"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setPreview(null)
                      setFileName(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    disabled={loading}
                    className="absolute right-2 top-2 rounded-full bg-red-500 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                  >
                    Удалить
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#457B9D]/10">
                    <svg
                      className="h-8 w-8 text-[#457B9D]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-[#1D3557]">
                      Нажмите для загрузки фото
                    </p>
                    <p className="text-xs text-[#B1B1B1]">PNG, JPG до 10MB</p>
                  </div>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={loading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#1D3557]">Класс</label>
          <input
            type="text"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            disabled={loading}
            placeholder="Например: 6А или Grade 6"
            className="rounded-lg border border-[#DCE8F5] px-3 py-2.5 text-sm text-[#1D3557] outline-none transition-colors focus:border-[#457B9D] disabled:opacity-50"
          />
        </div>

        {error && <p className="text-sm text-[#CE1821]">{error}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg border border-[#DCE8F5] px-4 py-2.5 text-sm font-medium text-[#457B9D] transition-colors hover:bg-[#DCE8F5] disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-[#457B9D] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1D3557] disabled:opacity-50"
          >
            {loading ? '⏳ Генерация...' : 'Сгенерировать план'}
          </button>
        </div>
      </form>
    </div>
  )
}
