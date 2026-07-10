import { useState, useEffect, useRef } from 'react'
import type { GeneratedLessonPlan } from '../data/lessonDetails'
import GeneratingLoader from './GeneratingLoader'
// import { authenticatedFetch, handleAPIResponse, APIError } from '../lib/api' // ⏳ Требует Supabase JWT

type GenerateLessonModalProps = {
  onClose: () => void
  onGenerate: (plan: GeneratedLessonPlan) => void
}

export default function GenerateLessonModal({ onClose, onGenerate }: GenerateLessonModalProps) {
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

    setLoading(true)
    setError(null)

    try {
      // ⏳ Временно используем старый незащищённый endpoint
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageDataUrl: preview }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate lesson plan')
      }

      const data = await response.json()

      if (!data.plan) {
        throw new Error('Invalid response format')
      }

      onGenerate(data.plan)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate lesson plan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={loading ? undefined : onClose}
    >
      {loading ? (
        <GeneratingLoader />
      ) : (
        <form
          onClick={(e) => e.stopPropagation()}
          onSubmit={handleSubmit}
          className="flex w-full max-w-lg flex-col gap-5 rounded-2xl p-6 shadow-xl"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
          }}
        >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>✨ Сгенерировать план урока</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-2xl transition-colors disabled:opacity-50"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Фото учебника</label>
          <div className="flex flex-col gap-3">
            <label
              className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 transition-colors"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--bg-surface-2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.backgroundColor = 'var(--bg-page)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.backgroundColor = 'var(--bg-surface-2)';
              }}
            >
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
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-full"
                    style={{ backgroundColor: 'var(--accent)20' }}
                  >
                    <svg
                      className="h-8 w-8"
                      style={{ color: 'var(--accent)' }}
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
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      Нажмите для загрузки фото
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>PNG, JPG до 10MB</p>
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

        {error && <p className="text-sm" style={{ color: '#CE1821' }}>{error}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = 'var(--bg-surface-2)')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent)' }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = 'var(--accent)')}
          >
            Сгенерировать план
          </button>
        </div>
      </form>
      )}
    </div>
  )
}
