import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function validate(): boolean {
    const newErrors: Record<string, string> = {}

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Enter a valid email address'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)

    try {
      await login(email, password)
      navigate('/')
    } catch (error) {
      setErrors({ password: 'Invalid email or password' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-8" style={{ background: 'linear-gradient(135deg, #dde8f8 0%, #ead6f0 50%, #d6e4f7 100%)' }}>
      <div className="w-full max-w-[480px] rounded-[28px] bg-white p-8 sm:p-10 shadow-[0_12px_50px_rgba(100,100,200,0.10)]">
        <div className="mb-8 text-center">
          <div className="mb-2 text-[52px]">👋</div>
          <h1 className="mb-1.5 text-[22px] font-bold text-[#1a1a2e]">Welcome Back!</h1>
          <p className="text-sm text-[#aaa]">Sign in to your TeacherHub account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
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
            <label className="mb-1.5 block text-[13px] font-medium text-[#555]">Password</label>
            <div className={`flex items-center gap-2 rounded-2xl border-[1.5px] bg-[#f0fbf5] px-4 py-3 transition-all ${errors.password ? 'border-[#e05a5a] shadow-[0_0_0_3px_rgba(224,90,90,0.10)]' : 'border-[#90dab0] focus-within:border-[#3dba7a] focus-within:shadow-[0_0_0_3px_rgba(61,186,122,0.12)]'}`}>
              <span className="text-base">🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-[15px] text-[#1a1a2e] outline-none placeholder:text-sm placeholder:text-[#bbb]"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-base opacity-45 transition-opacity hover:opacity-100"
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
            {errors.password && <span className="mt-1 block text-[11px] text-[#e05a5a]">{errors.password}</span>}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-[18px] w-[18px] cursor-pointer accent-[#c77ddf]"
              />
              <span className="text-[13px] text-[#888]">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-[13px] font-medium text-[#c77ddf] hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`mt-1 w-full rounded-2xl border-none px-4 py-3.5 text-[15px] font-semibold tracking-wide text-white transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 ${
              isSubmitting
                ? 'bg-gradient-to-r from-[#c9a0e8] to-[#99bef7]'
                : 'bg-gradient-to-r from-[#b06ee0] to-[#6b9ef5] hover:opacity-90'
            }`}
          >
            {isSubmitting ? '⏳ Signing in...' : '🔓 Sign In'}
          </button>
        </form>

        <p className="mt-4 text-center text-[13px] text-[#aaa]">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-[#c77ddf] hover:underline">
            Sign up
          </Link>
        </p>

        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#ddd]" />
          <span className="text-xs text-[#bbb]">OR</span>
          <div className="h-px flex-1 bg-[#ddd]" />
        </div>

        <div className="mt-4">
          <button className="flex w-full items-center justify-center gap-2 rounded-2xl border-[1.5px] border-[#ddd] bg-white px-4 py-3 text-[14px] font-medium text-[#1a1a2e] transition-all hover:bg-[#f5f5f5]">
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  )
}
