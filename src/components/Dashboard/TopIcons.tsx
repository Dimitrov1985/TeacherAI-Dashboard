import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext' // ⏳ Временно вернули
// import { useSupabaseAuth } from '../../context/SupabaseAuthContext' // ✅ Вернём позже
import { IconBell, IconMessage } from './icons'
import ThemeToggle from '../ThemeToggle'

export default function TopIcons() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const menuItems = [
    { label: 'Мой профиль', icon: '👤', action: () => navigate('/profile') },
    { label: 'Настройки', icon: '⚙️', action: () => console.log('Settings') },
    {
      label: 'Выйти',
      icon: '🚪',
      danger: true,
      action: () => {
        logout()
        navigate('/signup')
      }
    },
  ]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isMenuOpen])

  return (
    <div className="flex items-center justify-center gap-3">
      {/* Theme Toggle */}
      <ThemeToggle />

      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-lg"
        style={{
          backgroundColor: 'var(--bg-surface)',
          boxShadow: 'var(--card-shadow)',
        }}
      >
        <IconBell className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
      </button>
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-lg"
        style={{
          backgroundColor: 'var(--bg-surface)',
          boxShadow: 'var(--card-shadow)',
        }}
      >
        <IconMessage className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
      </button>

      <div ref={menuRef} className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="h-[42px] w-[42px] flex-shrink-0 rounded-full border-2 border-white bg-gray-300 shadow-[0_4px_4px_rgba(148,163,184,0.25)]"
          aria-label="User menu"
        >
          <div className="flex h-full w-full items-center justify-center text-lg">👨‍🏫</div>
        </button>

        {isMenuOpen && (
          <div
            className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl py-2 shadow-lg"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
            </div>
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsMenuOpen(false)
                  item.action()
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors"
                style={{
                  color: item.danger ? '#CE1821' : 'var(--text-primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = item.danger ? '#FFBABE20' : 'var(--bg-surface-2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span className="text-base">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
