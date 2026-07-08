// Безопасные API вызовы с JWT авторизацией
import { supabase } from './supabase'

/**
 * Получить текущий JWT токен из Supabase session
 */
async function getAccessToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.access_token || null
}

/**
 * Безопасный fetch с автоматическим добавлением JWT токена
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAccessToken()

  if (!token) {
    throw new Error('Not authenticated. Please login.')
  }

  const headers = new Headers(options.headers)
  headers.set('Authorization', `Bearer ${token}`)
  headers.set('Content-Type', 'application/json')

  return fetch(url, {
    ...options,
    headers,
  })
}

/**
 * Проверить rate limit из response headers
 */
export function checkRateLimitHeaders(response: Response): {
  limit: number | null
  remaining: number | null
  resetAt: number | null
} {
  return {
    limit: response.headers.get('X-RateLimit-Limit')
      ? parseInt(response.headers.get('X-RateLimit-Limit')!)
      : null,
    remaining: response.headers.get('X-RateLimit-Remaining')
      ? parseInt(response.headers.get('X-RateLimit-Remaining')!)
      : null,
    resetAt: response.headers.get('X-RateLimit-Reset')
      ? parseInt(response.headers.get('X-RateLimit-Reset')!)
      : null,
  }
}

/**
 * Обработать API ошибки с деталями
 */
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public retryAfter?: number
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export async function handleAPIResponse<T>(response: Response): Promise<T> {
  if (response.status === 429) {
    const data = await response.json()
    throw new APIError(
      'Too many requests. Please try again later.',
      429,
      data.retryAfter
    )
  }

  if (response.status === 401) {
    throw new APIError('Unauthorized. Please login again.', 401)
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new APIError(data.error || 'Request failed', response.status)
  }

  return response.json()
}
