import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext' // ⏳ Временно вернули
// import { useSupabaseAuth } from '../context/SupabaseAuthContext' // ✅ Вернём позже
import { celebrateSuccess } from '../lib/confetti'

const subjects = [
  'Applied Science',
  'Mathematics',
  'English',
  'History',
  'Technology',
  'Art',
  'Physical Education',
  'Biology',
  'Chemistry',
  'Physics',
]

type PasswordStrength = {
  width: string
  color: string
  text: string
}

export default function SignUpPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showToast, setShowToast] = useState(false)

  function getPasswordStrength(value: string): PasswordStrength {
    if (!value) {
      return { width: '0%', color: '#eee', text: '' }
    }

    let score = 0
    if (value.length >= 8) score++
    if (/[A-Z]/.test(value)) score++
    if (/[0-9]/.test(value)) score++
    if (/[^A-Za-z0-9]/.test(value)) score++

    const levels: PasswordStrength[] = [
      { width: '0%', color: '#eee', text: '' },
      { width: '25%', color: '#e05a5a', text: 'Weak password 😬' },
      { width: '50%', color: '#f09040', text: 'Fair password 🙂' },
      { width: '75%', color: '#5b9ef5', text: 'Good password 👍' },
      { width: '100%', color: '#3dba7a', text: 'Strong password 💪' },
    ]

    return levels[score] || levels[1]
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {}

    if (!firstName.trim()) newErrors.firstName = 'First name is required'
    if (!lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!subject) newErrors.subject = 'Please select your subject'

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Enter a valid email address'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!agreeTerms) {
      newErrors.terms = 'You must agree to the terms'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)

    try {
      await signup({ firstName, lastName, email, password })

      // 🎉 Запускаем анимацию конфетти
      await celebrateSuccess()

      // Редирект после анимации (toast уже не нужен, есть конфетти)
      navigate('/')
    } catch (error) {
      setErrors({ email: 'Registration failed. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const strength = getPasswordStrength(password)

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-8" style={{ background: 'linear-gradient(135deg, #dde8f8 0%, #ead6f0 50%, #d6e4f7 100%)' }}>
      <div className="w-full max-w-[480px] rounded-[28px] bg-white p-8 sm:p-10 shadow-[0_12px_50px_rgba(100,100,200,0.10)]">
        <div className="mb-8 text-center">
          <div className="mb-2 text-[52px]">🌸</div>
          <h1 className="mb-1.5 text-[22px] font-bold text-[#1a1a2e]">Hello, Teacher!</h1>
          <p className="text-sm text-[#aaa]">Let's create your cozy little space</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#555]">First name</label>
              <div className={`flex items-center gap-2 rounded-2xl border-[1.5px] bg-[#f9f0fb] px-4 py-3 transition-all ${errors.firstName ? 'border-[#e05a5a] shadow-[0_0_0_3px_rgba(224,90,90,0.10)]' : 'border-[#ddb4f0] focus-within:border-[#c77ddf] focus-within:shadow-[0_0_0_3px_rgba(199,125,223,0.12)]'}`}>
                <span className="text-base">👤</span>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-[15px] text-[#1a1a2e] outline-none placeholder:text-sm placeholder:text-[#bbb]"
                  placeholder="Janet"
                />
              </div>
              {errors.firstName && <span className="mt-1 block text-[11px] text-[#e05a5a]">{errors.firstName}</span>}
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#555]">Last name</label>
              <div className={`flex items-center gap-2 rounded-2xl border-[1.5px] bg-[#f9f0fb] px-4 py-3 transition-all ${errors.lastName ? 'border-[#e05a5a] shadow-[0_0_0_3px_rgba(224,90,90,0.10)]' : 'border-[#ddb4f0] focus-within:border-[#c77ddf] focus-within:shadow-[0_0_0_3px_rgba(199,125,223,0.12)]'}`}>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-[15px] text-[#1a1a2e] outline-none placeholder:text-sm placeholder:text-[#bbb]"
                  placeholder="Johnson"
                />
              </div>
              {errors.lastName && <span className="mt-1 block text-[11px] text-[#e05a5a]">{errors.lastName}</span>}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#555]">Email address</label>
            <div className={`flex items-center gap-2 rounded-2xl border-[1.5px] bg-[#f0f6ff] px-4 py-3 transition-all ${errors.email ? 'border-[#e05a5a] shadow-[0_0_0_3px_rgba(224,90,90,0.10)]' : 'border-[#aac8f5] focus-within:border-[#5b9ef5] focus-within:shadow-[0_0_0_3px_rgba(91,158,245,0.12)]'}`}>
              <span className="text-base">✉️</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-[15px] text-[#1a1a2e] outline-none placeholder:text-sm placeholder:text-[#bbb]"
                placeholder="janet@school.edu"
              />
            </div>
            {errors.email && <span className="mt-1 block text-[11px] text-[#e05a5a]">{errors.email}</span>}
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#555]">Subject</label>
            <div className={`flex items-center gap-2 rounded-2xl border-[1.5px] bg-[#fff8f0] px-4 py-3 transition-all ${errors.subject ? 'border-[#e05a5a] shadow-[0_0_0_3px_rgba(224,90,90,0.10)]' : 'border-[#f5c89a] focus-within:border-[#f09040] focus-within:shadow-[0_0_0_3px_rgba(240,144,64,0.12)]'}`}>
              <span className="text-base">📖</span>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="min-w-0 flex-1 cursor-pointer bg-transparent text-[15px] text-[#1a1a2e] outline-none"
              >
                <option value="" disabled>Select your subject</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <span className="inline-block rotate-90 text-xl text-[#bbb]">›</span>
            </div>
            {errors.subject && <span className="mt-1 block text-[11px] text-[#e05a5a]">{errors.subject}</span>}
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#555]">Password</label>
            <div className={`flex items-center gap-2 rounded-2xl border-[1.5px] bg-[#f0fbf5] px-4 py-3 transition-all ${errors.password ? 'border-[#e05a5a] shadow-[0_0_0_3px_rgba(224,90,90,0.10)]' : 'border-[#90dab0] focus-within:border-[#3dba7a] focus-within:shadow-[0_0_0_3px_rgba(61,186,122,0.12)]'}`}>
              <span className="text-base">🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-[15px] text-[#1a1a2e] outline-none placeholder:text-sm placeholder:text-[#bbb]"
                placeholder="Min. 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-base opacity-45 transition-opacity hover:opacity-100"
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
            {password && (
              <div className="mt-2">
                <div className="h-[5px] overflow-hidden rounded-full bg-[#eee]">
                  <div
                    className="h-full transition-all duration-[350ms] ease-out"
                    style={{ width: strength.width, background: strength.color }}
                  />
                </div>
                {strength.text && (
                  <span className="mt-1 block text-xs font-medium" style={{ color: strength.color }}>
                    {strength.text}
                  </span>
                )}
              </div>
            )}
            {errors.password && <span className="mt-1 block text-[11px] text-[#e05a5a]">{errors.password}</span>}
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#555]">Confirm password</label>
            <div className={`flex items-center gap-2 rounded-2xl border-[1.5px] bg-[#f0fbf5] px-4 py-3 transition-all ${errors.confirmPassword ? 'border-[#e05a5a] shadow-[0_0_0_3px_rgba(224,90,90,0.10)]' : 'border-[#90dab0] focus-within:border-[#3dba7a] focus-within:shadow-[0_0_0_3px_rgba(61,186,122,0.12)]'}`}>
              <span className="text-base">🔒</span>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-[15px] text-[#1a1a2e] outline-none placeholder:text-sm placeholder:text-[#bbb]"
                placeholder="Repeat password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="text-base opacity-45 transition-opacity hover:opacity-100"
              >
                {showConfirm ? '🙈' : '👁'}
              </button>
            </div>
            {errors.confirmPassword && <span className="mt-1 block text-[11px] text-[#e05a5a]">{errors.confirmPassword}</span>}
          </div>

          <div className="my-1.5 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 h-[18px] w-[18px] cursor-pointer accent-[#c77ddf]"
            />
            <label htmlFor="terms" className="cursor-pointer text-[13px] leading-relaxed text-[#888]">
              I agree to the{' '}
              <a href="#" className="font-medium text-[#c77ddf] hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="font-medium text-[#c77ddf] hover:underline">
                Privacy Policy
              </a>
            </label>
          </div>
          {errors.terms && <span className="block text-[11px] text-[#e05a5a]">{errors.terms}</span>}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`mt-1 w-full rounded-2xl border-none px-4 py-3.5 text-[15px] font-semibold tracking-wide text-white transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 ${
              isSubmitting
                ? 'bg-gradient-to-r from-[#c9a0e8] to-[#99bef7]'
                : 'bg-gradient-to-r from-[#b06ee0] to-[#6b9ef5] hover:opacity-90'
            }`}
          >
            {isSubmitting ? '⏳ Creating account...' : '✨ Join TeacherHub'}
          </button>

          <p className="text-center text-[13px] text-[#aaa]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#c77ddf] hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>

      {showToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-2xl bg-[#1a1a2e] px-7 py-3.5 text-sm font-medium text-white shadow-lg">
          ✅ Account created! Welcome aboard 🎉
        </div>
      )}
    </div>
  )
}
