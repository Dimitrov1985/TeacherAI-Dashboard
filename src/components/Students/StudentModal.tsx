import { useState } from 'react'
import type { Student } from '../../data/students'
import { SUBJECTS } from '../../data/subjects'

type StudentModalProps = {
  student?: Student
  onSave: (data: Omit<Student, 'id' | 'createdAt'>) => void
  onDelete?: () => void
  onClose: () => void
}

export default function StudentModal({ student, onSave, onDelete, onClose }: StudentModalProps) {
  const [studentId, setStudentId] = useState(student?.studentId || '')
  const [firstName, setFirstName] = useState(student?.firstName || '')
  const [lastName, setLastName] = useState(student?.lastName || '')
  const [middleName, setMiddleName] = useState(student?.middleName || '')
  const [className, setClassName] = useState(student?.className || '')
  const [subject, setSubject] = useState(student?.subject || '')
  const [dateOfBirth, setDateOfBirth] = useState(student?.dateOfBirth || '')
  const [email, setEmail] = useState(student?.email || '')
  const [phone, setPhone] = useState(student?.phone || '')
  const [parentName, setParentName] = useState(student?.parentName || '')
  const [parentPhone, setParentPhone] = useState(student?.parentPhone || '')
  const [notes, setNotes] = useState(student?.notes || '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim() || !className.trim()) return

    onSave({
      studentId: studentId.trim() || undefined,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      middleName: middleName.trim() || undefined,
      className: className.trim(),
      subject: subject.trim() || undefined,
      dateOfBirth: dateOfBirth || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      parentName: parentName.trim() || undefined,
      parentPhone: parentPhone.trim() || undefined,
      notes: notes.trim() || undefined,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex w-full max-w-2xl flex-col gap-6 rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1D3557]">
            {student ? 'Редактировать ученика' : 'Добавить ученика'}
          </h2>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Student ID */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#1D3557]">
              ID No. <span className="text-xs text-[#ACACAC]">(ลำดับ / Номер студента)</span>
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="12345"
              className="rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm text-[#1D3557] outline-none transition-colors focus:border-[#457B9D]"
            />
          </div>

          {/* Name fields */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#1D3557]">
                Фамилия / สกุล <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm text-[#1D3557] outline-none transition-colors focus:border-[#457B9D]"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#1D3557]">
                Имя / ชื่อ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm text-[#1D3557] outline-none transition-colors focus:border-[#457B9D]"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#1D3557]">Отчество</label>
              <input
                type="text"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                className="rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm text-[#1D3557] outline-none transition-colors focus:border-[#457B9D]"
              />
            </div>
          </div>

          {/* Class, Subject and DOB */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#1D3557]">
                Class <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="M.4/1"
                className="rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm text-[#1D3557] outline-none transition-colors focus:border-[#457B9D]"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#1D3557]">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm text-[#1D3557] outline-none transition-colors focus:border-[#457B9D]"
              >
                <option value="">Select Subject</option>
                {SUBJECTS.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#1D3557]">Date of Birth</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm text-[#1D3557] outline-none transition-colors focus:border-[#457B9D]"
              />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#1D3557]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm text-[#1D3557] outline-none transition-colors focus:border-[#457B9D]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#1D3557]">Телефон</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm text-[#1D3557] outline-none transition-colors focus:border-[#457B9D]"
              />
            </div>
          </div>

          {/* Parent info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#1D3557]">ФИО родителя</label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm text-[#1D3557] outline-none transition-colors focus:border-[#457B9D]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#1D3557]">Телефон родителя</label>
              <input
                type="tel"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                className="rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm text-[#1D3557] outline-none transition-colors focus:border-[#457B9D]"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#1D3557]">
              Заметки / หมายเหตุ
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm text-[#1D3557] outline-none transition-colors focus:border-[#457B9D]"
              placeholder="Дополнительная информация об ученике..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-2">
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Удалить этого ученика? Все оценки и посещаемость будут также удалены.')) {
                    onDelete()
                    onClose()
                  }
                }}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
              >
                Удалить
              </button>
            )}
            <div className="ml-auto flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-[#DCE8F5] px-4 py-2 text-sm font-medium text-[#1D3557] transition-colors hover:bg-[#DCE8F5]"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#457B9D] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1D3557]"
              >
                {student ? 'Сохранить' : 'Добавить'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
