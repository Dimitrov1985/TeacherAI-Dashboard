import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'
import {
  authenticateRequest,
  checkRateLimit,
  setCORSHeaders,
  type AuthenticatedRequest,
} from './_middleware'

const MODEL = 'claude-haiku-4-5-20251001'
const MAX_TOKENS = 4096 // Уменьшено для безопасности
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB

type GeneratePlanRequestBody = {
  imageDataUrl?: string
}

function parseDataUrl(dataUrl: string): { mimeType: string; base64: string } | null {
  const match = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/.exec(dataUrl)
  if (!match) return null
  return { mimeType: match[1], base64: match[2] }
}

function validateImageSize(base64: string): boolean {
  // Base64 size ≈ original size * 1.37
  const estimatedSize = (base64.length * 3) / 4
  return estimatedSize <= MAX_IMAGE_SIZE
}

export default async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  // CORS
  if (setCORSHeaders(req, res)) return

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 1. АУТЕНТИФИКАЦИЯ
  const authResult = await authenticateRequest(req)
  if (!authResult.success) {
    return res.status(401).json({ error: authResult.error || 'Unauthorized' })
  }

  const userId = authResult.userId!

  // 2. RATE LIMITING - 10 запросов в минуту
  const rateLimit = checkRateLimit(userId, 'generate-plan', {
    maxRequests: 10,
    windowMs: 60 * 1000,
  })

  res.setHeader('X-RateLimit-Limit', '10')
  res.setHeader('X-RateLimit-Remaining', String(rateLimit.remaining || 0))
  res.setHeader('X-RateLimit-Reset', String(rateLimit.resetAt || 0))

  if (!rateLimit.ok) {
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil((rateLimit.resetAt! - Date.now()) / 1000),
    })
  }

  // 3. ВАЛИДАЦИЯ INPUT
  const { imageDataUrl } = req.body as GeneratePlanRequestBody

  if (!imageDataUrl) {
    return res.status(400).json({ error: 'imageDataUrl is required' })
  }

  const parsed = parseDataUrl(imageDataUrl)
  if (!parsed) {
    return res.status(400).json({ error: 'Invalid image format' })
  }

  // Проверить размер
  if (!validateImageSize(parsed.base64)) {
    return res.status(400).json({ error: 'Image too large (max 10MB)' })
  }

  // 4. ВЫЗОВ ANTHROPIC API
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API not configured' })
  }

  try {
    const anthropic = new Anthropic({ apiKey })

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: parsed.mimeType as
                  | 'image/jpeg'
                  | 'image/png'
                  | 'image/gif'
                  | 'image/webp',
                data: parsed.base64,
              },
            },
            {
              type: 'text',
              text: `You are an expert assistant for a school teacher. Read the textbook page in the photo and produce a DETAILED lesson plan based on it.

IMPORTANT: Generate EVERYTHING in English language only.

Respond with ONLY valid JSON, no markdown fences, matching exactly this shape:
{
  "title": "lesson title in English",
  "objectives": ["learning objective in English", "another objective in English"],
  "flashcards": [
    { "front": "term or question in English", "back": "definition or answer in English" }
  ],
  "activities": [
    {
      "type": "warmup|main|practice|review",
      "title": "activity name in English",
      "duration": "5-10 min",
      "goal": "what students will achieve in English",
      "instructions": ["step 1 in English", "step 2 in English"]
    }
  ],
  "materials": ["material in English"],
  "assessment": ["assessment method in English"]
}`,
            },
          ],
        },
      ],
    })

    const textContent = message.content.find((block: any) => block.type === 'text')
    if (!textContent) {
      throw new Error('No text response from API')
    }

    let responseText = textContent.text.trim()
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '')

    const lessonPlan = JSON.parse(responseText)

    // 5. ЛОГИРОВАНИЕ (опционально - для мониторинга)
    console.log(`[API] User ${userId} generated plan, tokens: ${MAX_TOKENS}`)

    return res.status(200).json(lessonPlan)
  } catch (error: any) {
    console.error('Generate plan error:', error)
    return res.status(500).json({
      error: error.message || 'Failed to generate lesson plan',
    })
  }
}
