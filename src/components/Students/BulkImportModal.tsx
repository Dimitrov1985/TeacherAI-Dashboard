import { useState, useEffect } from 'react'
import type { Student } from '../../data/students'
import { loadClasses, loadSubjects, loadPeriods, addClass, updateClassSubjects } from '../../lib/referencesStore'
import type { Subject, Period } from '../../data/references'

type ImportedStudent = {
  studentId?: string
  firstName: string
  lastName: string
}

type BulkImportModalProps = {
  onImport: (students: Omit<Student, 'id' | 'createdAt'>[]) => void
  onClose: () => void
}

export default function BulkImportModal({ onImport, onClose }: BulkImportModalProps) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [periods, setPeriods] = useState<Period[]>([])

  const [className, setClassName] = useState('')
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([])
  const [periodId, setPeriodId] = useState('')

  const [importMethod, setImportMethod] = useState<'photo' | 'text' | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [textInput, setTextInput] = useState('')
  const [parsedStudents, setParsedStudents] = useState<ImportedStudent[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadedSubjects = loadSubjects()
    const loadedPeriods = loadPeriods()

    setSubjects(loadedSubjects)
    setPeriods(loadedPeriods)

    if (loadedPeriods[0]) setPeriodId(loadedPeriods[0].id)
  }, [])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImageFile(file)
    setError(null)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  async function handleProcessImage() {
    if (!className.trim() || selectedSubjectIds.length === 0 || !periodId) {
      setError('Please enter Class, select at least one Subject and Period')
      return
    }

    if (!imageFile) {
      setError('Please upload an image')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target?.result as string

        const response = await fetch('/api/extract-students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64,
            className: className,
          }),
        })

        if (!response.ok) {
          throw new Error('Ошибка обработки изображения')
        }

        const data = await response.json()
        setParsedStudents(data.students || [])
        setIsProcessing(false)
      }

      reader.onerror = () => {
        setError('Ошибка чтения файла')
        setIsProcessing(false)
      }

      reader.readAsDataURL(imageFile)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обработки')
      setIsProcessing(false)
    }
  }

  function handleProcessText() {
    if (!className.trim() || selectedSubjectIds.length === 0 || !periodId) {
      setError('Please enter Class, select at least one Subject and Period first')
      return
    }

    if (!textInput.trim()) {
      setError('Please enter student list')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const students = parseStudentList(textInput)
      setParsedStudents(students)
      setIsProcessing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error parsing list')
      setIsProcessing(false)
    }
  }

  function parseStudentList(text: string): ImportedStudent[] {
    const lines = text.split('\n').filter((line) => line.trim())
    const students: ImportedStudent[] = []

    for (const line of lines) {
      const trimmed = line.trim()

      // Remove leading order number (1., 1), etc.)
      let cleaned = trimmed.replace(/^[\d]+[\.)]\s*/, '')

      // Split by whitespace or tabs
      const parts = cleaned.split(/[\s\t]+/).filter((p) => p.length > 0)

      if (parts.length >= 2) {
        // Format: "FirstName LastName"
        students.push({
          firstName: parts[0],
          lastName: parts[1],
        })
      }
    }

    return students
  }

  function handleImportAll() {
    console.log('=== handleImportAll START ===')
    console.log('className:', className)
    console.log('selectedSubjectIds:', selectedSubjectIds)
    console.log('periodId:', periodId)
    console.log('parsedStudents:', parsedStudents)

    if (!className.trim() || selectedSubjectIds.length === 0 || !periodId || parsedStudents.length === 0) {
      setError('Please enter Class, select at least one Subject, Period and add students')
      console.log('Validation failed!')
      return
    }

    // Find or create class with subjects
    const allClasses = loadClasses()
    let classMatch = allClasses.find(c => c.name.toLowerCase() === String(className).toLowerCase())

    if (!classMatch) {
      // Create new class with selected subjects
      classMatch = addClass(String(className).trim(), selectedSubjectIds)
    } else {
      // Update existing class subjects (merge with existing)
      const mergedSubjects = Array.from(new Set([...(classMatch.subjectIds || []), ...selectedSubjectIds]))
      updateClassSubjects(classMatch.id, mergedSubjects)
    }

    // Use first subject for student record (legacy compatibility)
    const primarySubjectId = selectedSubjectIds[0]

    const studentsToImport = parsedStudents.map((s) => ({
      firstName: s.firstName,
      lastName: s.lastName,
      classId: classMatch!.id,
      subjectId: primarySubjectId,
      periodId,
    }))

    console.log('studentsToImport:', studentsToImport)
    console.log('Calling onImport...')
    onImport(studentsToImport)
    console.log('onImport completed, closing modal...')

    // Close modal after a small delay to ensure state updates
    setTimeout(() => {
      onClose()
      console.log('Modal closed')
    }, 50)

    console.log('=== handleImportAll END ===')
  }

  function removeStudent(index: number) {
    setParsedStudents(parsedStudents.filter((_, i) => i !== index))
  }

  function editStudent(index: number, field: 'firstName' | 'lastName', value: string) {
    const updated = [...parsedStudents]
    updated[index] = { ...updated[index], [field]: value }
    setParsedStudents(updated)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex h-[90vh] w-full max-w-4xl flex-col gap-6 overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DCE8F5] p-6">
          <div>
            <h2 className="text-xl font-bold text-[#1D3557]">Массовое добавление учеников</h2>
            <p className="text-sm text-[#ACACAC]">Загрузите фото списка или вставьте текст</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#ACACAC] transition-colors hover:bg-[#DCE8F5] hover:text-[#1D3557]"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {/* Class, Subject and Period */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#1D3557]">
                Class <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="e.g., M.4/1, 10A, Grade 5"
                className="w-full rounded-lg border border-[#DCE8F5] px-4 py-3 text-sm text-[#1D3557] outline-none transition-colors focus:border-[#457B9D]"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#1D3557]">
                Subjects <span className="text-red-500">*</span> <span className="text-xs text-[#ACACAC]">(select one or more)</span>
              </label>
              <div className="max-h-48 overflow-y-auto rounded-lg border border-[#DCE8F5] p-2">
                {subjects.map((subj) => (
                  <label key={subj.id} className="flex items-center gap-2 p-2 hover:bg-[#F8F9FA] rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSubjectIds.includes(subj.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSubjectIds([...selectedSubjectIds, subj.id])
                        } else {
                          setSelectedSubjectIds(selectedSubjectIds.filter(id => id !== subj.id))
                        }
                      }}
                      className="w-4 h-4 text-[#457B9D] border-[#DCE8F5] rounded focus:ring-[#457B9D]"
                    />
                    <span className="text-sm text-[#1D3557]">{subj.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#1D3557]">
                Period <span className="text-red-500">*</span>
              </label>
              <select
                value={periodId}
                onChange={(e) => setPeriodId(e.target.value)}
                className="w-full rounded-lg border border-[#DCE8F5] px-4 py-3 text-sm text-[#1D3557] outline-none transition-colors focus:border-[#457B9D]"
              >
                {periods.map((per) => (
                  <option key={per.id} value={per.id}>
                    {per.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Method selection */}
          {!importMethod && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setImportMethod('photo')}
                className="flex flex-col items-center gap-4 rounded-xl border-2 border-[#DCE8F5] p-8 transition-all hover:border-[#457B9D] hover:bg-[#F8F9FA]"
              >
                <svg className="h-16 w-16 text-[#457B9D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="text-center">
                  <p className="font-semibold text-[#1D3557]">Загрузить фото</p>
                  <p className="text-sm text-[#ACACAC]">Сфотографируйте список класса</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setImportMethod('text')}
                className="flex flex-col items-center gap-4 rounded-xl border-2 border-[#DCE8F5] p-8 transition-all hover:border-[#457B9D] hover:bg-[#F8F9FA]"
              >
                <svg className="h-16 w-16 text-[#457B9D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="text-center">
                  <p className="font-semibold text-[#1D3557]">Вставить текст</p>
                  <p className="text-sm text-[#ACACAC]">Скопируйте список учеников</p>
                </div>
              </button>
            </div>
          )}

          {/* Photo upload */}
          {importMethod === 'photo' && (
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => setImportMethod(null)}
                className="flex w-fit items-center gap-2 text-sm text-[#457B9D] hover:underline"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Назад
              </button>

              <div className="rounded-lg border-2 border-dashed border-[#DCE8F5] p-8">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex cursor-pointer flex-col items-center gap-4"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="max-h-64 rounded-lg" />
                  ) : (
                    <>
                      <svg className="h-12 w-12 text-[#ACACAC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <div className="text-center">
                        <p className="font-medium text-[#1D3557]">Нажмите для загрузки</p>
                        <p className="text-sm text-[#ACACAC]">PNG, JPG до 10MB</p>
                      </div>
                    </>
                  )}
                </label>
              </div>

              {imageFile && (
                <button
                  type="button"
                  onClick={handleProcessImage}
                  disabled={isProcessing}
                  className="rounded-lg bg-[#457B9D] px-6 py-3 font-medium text-white transition-colors hover:bg-[#1D3557] disabled:bg-[#ACACAC]"
                >
                  {isProcessing ? 'Обработка...' : 'Распознать текст с AI'}
                </button>
              )}
            </div>
          )}

          {/* Text input */}
          {importMethod === 'text' && (
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => setImportMethod(null)}
                className="flex w-fit items-center gap-2 text-sm text-[#457B9D] hover:underline"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Назад
              </button>

              <div className="rounded-lg border border-[#DCE8F5] p-4">
                <p className="mb-2 text-xs text-[#ACACAC]">
                  Формат: <strong>Name Surname</strong> (каждый ученик на новой строке)<br />
                  ID будет присвоен автоматически
                </p>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  rows={15}
                  placeholder="John Smith&#10;Jane Doe&#10;สมชาย ใจดี&#10;Иван Петров"
                  className="w-full rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm text-[#1D3557] outline-none transition-colors focus:border-[#457B9D]"
                />
              </div>

              <button
                type="button"
                onClick={handleProcessText}
                disabled={isProcessing}
                className="rounded-lg bg-[#457B9D] px-6 py-3 font-medium text-white transition-colors hover:bg-[#1D3557] disabled:bg-[#ACACAC]"
              >
                {isProcessing ? 'Обработка...' : 'Обработать список'}
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Parsed students */}
          {parsedStudents.length > 0 && (
            <div className="mt-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#1D3557]">
                  Найдено учеников: {parsedStudents.length}
                </h3>
                <button
                  type="button"
                  onClick={handleImportAll}
                  className="rounded-lg bg-[#3ECD88] px-6 py-2 font-medium text-white transition-colors hover:bg-[#24B0C9]"
                >
                  Импортировать всех
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {parsedStudents.map((student, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-lg border border-[#DCE8F5] p-3"
                  >
                    <span className="text-sm font-medium text-[#ACACAC]">{index + 1}</span>
                    <input
                      type="text"
                      value={student.firstName}
                      onChange={(e) => editStudent(index, 'firstName', e.target.value)}
                      placeholder="Name / ชื่อ"
                      className="flex-1 rounded border border-[#DCE8F5] px-2 py-1 text-sm outline-none focus:border-[#457B9D]"
                    />
                    <input
                      type="text"
                      value={student.lastName}
                      onChange={(e) => editStudent(index, 'lastName', e.target.value)}
                      placeholder="Surname / สกุล"
                      className="flex-1 rounded border border-[#DCE8F5] px-2 py-1 text-sm outline-none focus:border-[#457B9D]"
                    />
                    <button
                      type="button"
                      onClick={() => removeStudent(index)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
