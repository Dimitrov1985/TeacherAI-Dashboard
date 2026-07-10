import { useState } from 'react'
import { useAuth } from '../context/AuthContext' // ⏳ Временно вернули
// import { useSupabaseAuth } from '../context/SupabaseAuthContext' // ✅ Вернём позже

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [email, setEmail] = useState(user?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showToast, setShowToast] = useState(false)

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    updateProfile({ firstName, lastName, email })
    setIsEditing(false)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match')
      return
    }
    // Handle password change
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  return (
    <div
      className="flex flex-1 flex-col overflow-y-auto p-8"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      <div className="w-full max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold text-[#1D3557]">Мой профиль</h1>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-6 shadow-[0_6px_12px_rgba(148,163,184,0.15)]">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gray-300 text-5xl">
              👨‍🏫
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-[#1D3557]">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-sm text-[#457B9D]">{user?.email}</p>
            </div>
            <button className="rounded-lg border border-[#DCE8F5] px-4 py-2 text-sm font-medium text-[#457B9D] transition-colors hover:bg-[#DCE8F5]">
              Изменить фото
            </button>
          </div>

          {/* Profile Info */}
          <div className="md:col-span-2">
            <div className="mb-6 rounded-2xl bg-white p-6 shadow-[0_6px_12px_rgba(148,163,184,0.15)]">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#1D3557]">Личная информация</h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-sm font-medium text-[#457B9D] hover:underline"
                  >
                    Редактировать
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-[#1D3557]">Имя</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm text-[#1D3557] outline-none focus:border-[#457B9D]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-[#1D3557]">Фамилия</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm text-[#1D3557] outline-none focus:border-[#457B9D]"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-[#1D3557]">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm text-[#1D3557] outline-none focus:border-[#457B9D]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="rounded-lg bg-[#457B9D] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1D3557]"
                    >
                      Сохранить
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false)
                        setFirstName(user?.firstName || '')
                        setLastName(user?.lastName || '')
                        setEmail(user?.email || '')
                      }}
                      className="rounded-lg border border-[#DCE8F5] px-4 py-2 text-sm font-medium text-[#457B9D] transition-colors hover:bg-[#DCE8F5]"
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between border-b border-[#DCE8F5] pb-2">
                    <span className="text-sm text-[#B1B1B1]">Имя</span>
                    <span className="text-sm font-medium text-[#1D3557]">{user?.firstName}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#DCE8F5] pb-2">
                    <span className="text-sm text-[#B1B1B1]">Фамилия</span>
                    <span className="text-sm font-medium text-[#1D3557]">{user?.lastName}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#DCE8F5] pb-2">
                    <span className="text-sm text-[#B1B1B1]">Email</span>
                    <span className="text-sm font-medium text-[#1D3557]">{user?.email}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Change Password */}
            <div className="rounded-2xl bg-white p-6 shadow-[0_6px_12px_rgba(148,163,184,0.15)]">
              <h3 className="mb-4 text-lg font-semibold text-[#1D3557]">Изменить пароль</h3>
              <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-[#1D3557]">Текущий пароль</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm text-[#1D3557] outline-none focus:border-[#457B9D]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-[#1D3557]">Новый пароль</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm text-[#1D3557] outline-none focus:border-[#457B9D]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-[#1D3557]">Подтвердите пароль</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="rounded-lg border border-[#DCE8F5] px-3 py-2 text-sm text-[#1D3557] outline-none focus:border-[#457B9D]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-fit rounded-lg bg-[#457B9D] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1D3557]"
                >
                  Обновить пароль
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {showToast && (
        <div className="fixed bottom-8 right-8 rounded-lg bg-[#3dba7a] px-6 py-3 text-white shadow-lg">
          ✅ Изменения сохранены!
        </div>
      )}
    </div>
  )
}
