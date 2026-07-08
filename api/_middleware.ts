import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

// Используем service role key для проверки токенов
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Rate limiting store (в продакшене использовать Redis/Upstash)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

export interface AuthenticatedRequest extends VercelRequest {
  userId?: string
  userEmail?: string
}

/**
 * Middleware для проверки JWT токена из Supabase
 */
export async function authenticateRequest(
  req: AuthenticatedRequest
): Promise<{ success: boolean; userId?: string; error?: string }> {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { success: false, error: 'Missing or invalid authorization header' }
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    // Проверить JWT токен через Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user) {
      return { success: false, error: 'Invalid or expired token' }
    }

    // Добавить userId в request для использования в handlers
    req.userId = user.id
    req.userEmail = user.email

    return { success: true, userId: user.id }
  } catch (error) {
    console.error('Auth error:', error)
    return { success: false, error: 'Authentication failed' }
  }
}

/**
 * Rate limiting middleware
 * @param userId - ID пользователя
 * @param endpoint - название endpoint
 * @param limits - лимиты { maxRequests, windowMs }
 */
export function checkRateLimit(
  userId: string,
  endpoint: string,
  limits: { maxRequests: number; windowMs: number }
): { ok: boolean; remaining?: number; resetAt?: number } {
  const key = `${userId}:${endpoint}`
  const now = Date.now()

  const stored = rateLimitStore.get(key)

  if (!stored || now > stored.resetAt) {
    // Новое окно
    const resetAt = now + limits.windowMs
    rateLimitStore.set(key, { count: 1, resetAt })
    return { ok: true, remaining: limits.maxRequests - 1, resetAt }
  }

  if (stored.count >= limits.maxRequests) {
    return { ok: false, resetAt: stored.resetAt }
  }

  stored.count++
  rateLimitStore.set(key, stored)

  return {
    ok: true,
    remaining: limits.maxRequests - stored.count,
    resetAt: stored.resetAt,
  }
}

/**
 * Очистка старых записей rate limit (вызывать периодически)
 */
export function cleanupRateLimitStore() {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetAt) {
      rateLimitStore.delete(key)
    }
  }
}

// Очистка каждые 5 минут
setInterval(cleanupRateLimitStore, 5 * 60 * 1000)

/**
 * CORS headers для безопасного API
 */
export function setCORSHeaders(req: VercelRequest, res: VercelResponse) {
  const allowedOrigins = [
    process.env.VITE_APP_URL || 'http://localhost:3001',
    // Добавьте production URLs
  ]

  const origin = req.headers.origin
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type')
  res.setHeader('Access-Control-Max-Age', '86400') // 24 hours

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return true
  }

  return false
}
