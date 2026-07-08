import { useState, useRef } from 'react'
// import { authenticatedFetch, handleAPIResponse, APIError } from '../../lib/api' // ⏳ Требует Supabase JWT

type GeneratedHomework = {
  title: string
  description: string
  tasks: string[]
  estimatedTime: string
  resources?: string[]
}

type GenerateHomeworkModalProps = {
  subject?: string
  grade?: string
  onClose: () => void
  onGenerate: (homework: GeneratedHomework) => void
}

export default function GenerateHomeworkModal({
  subject,
  grade,
  onClose,
  onGenerate,
}: GenerateHomeworkModalProps) {
  const [topic, setTopic] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setImage(reader.result as string)
      setError('')
    }
    reader.readAsDataURL(file)
  }

  async function handleGenerate() {
    if (!topic.trim() && !image) {
      setError('Please provide a topic or upload an image')
      return
    }

    setLoading(true)
    setError('')

    try {
      // ⏳ Временно используем старый незащищённый endpoint
      const response = await fetch('/api/generate-homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          image,
          subject,
          grade,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate homework')
      }

      const homework = await response.json()
      onGenerate(homework)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to generate homework')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-lg flex-col gap-5 rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-[#1D3557]">
              ✨ AI Homework Generator
            </h3>
            {subject && (
              <p className="mt-1 text-sm text-[#94a3b8]">
                {subject} {grade && `• ${grade}`}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-2xl text-[#B1B1B1] transition-colors hover:text-[#1D3557]"
          >
            ×
          </button>
        </div>

        {/* Topic Input */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#1D3557]">
            Topic or Description
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Photosynthesis process, Chapter 5 summary, Quadratic equations..."
            rows={3}
            className="resize-none rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm outline-none focus:border-[#7c3aed]"
          />
        </div>

        {/* Image Upload */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#1D3557]">
            Or Upload Textbook Page
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg border-2 border-dashed border-[#DCE8F5] bg-[#f8f9fa] px-4 py-3 text-sm text-[#94a3b8] transition-colors hover:border-[#7c3aed] hover:bg-[#7c3aed]/5"
          >
            {image ? '✅ Image uploaded' : '📷 Upload image'}
          </button>

          {image && (
            <div className="relative">
              <img
                src={image}
                alt="Preview"
                className="h-32 w-full rounded-lg object-cover"
              />
              <button
                onClick={() => setImage(null)}
                className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs text-white"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg border border-[#DCE8F5] px-4 py-2 text-sm font-medium text-[#457B9D] transition-colors hover:bg-[#DCE8F5] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex-1 rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6d28d9] disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Generating...
              </span>
            ) : (
              '✨ Generate Homework'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
