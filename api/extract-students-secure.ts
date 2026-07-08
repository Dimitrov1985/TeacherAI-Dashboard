import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'
import {
  authenticateRequest,
  checkRateLimit,
  setCORSHeaders,
  type AuthenticatedRequest,
} from './_middleware'

const MODEL = 'claude-haiku-4-5-20251001'
const MAX_TOKENS = 2048
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB

function validateImageSize(base64: string): boolean {
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

  // 2. RATE LIMITING - 5 запросов в минуту (меньше так как это тяжёлая операция)
  const rateLimit = checkRateLimit(userId, 'extract-students', {
    maxRequests: 5,
    windowMs: 60 * 1000,
  })

  res.setHeader('X-RateLimit-Limit', '5')
  res.setHeader('X-RateLimit-Remaining', String(rateLimit.remaining || 0))
  res.setHeader('X-RateLimit-Reset', String(rateLimit.resetAt || 0))

  if (!rateLimit.ok) {
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil((rateLimit.resetAt! - Date.now()) / 1000),
    })
  }

  // 3. ВАЛИДАЦИЯ INPUT
  const { image, className } = req.body

  if (!image) {
    return res.status(400).json({ error: 'Image is required' })
  }

  if (typeof image !== 'string') {
    return res.status(400).json({ error: 'Image must be a base64 string' })
  }

  if (!image.match(/^data:image\/(jpeg|png|webp);base64,/)) {
    return res.status(400).json({ error: 'Invalid image format' })
  }

  const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '')
  if (!validateImageSize(base64Data)) {
    return res.status(400).json({ error: 'Image too large (max 10MB)' })
  }

  // 4. ВЫЗОВ API
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API not configured' })
  }

  try {
    const anthropic = new Anthropic({ apiKey })

    const prompt = `Extract student information from this image and return ONLY valid JSON (no markdown fences).

Expected format:
{
  "students": [
    {
      "firstName": "string",
      "lastName": "string",
      "middleName": "string or empty",
      "dateOfBirth": "YYYY-MM-DD or empty"
    }
  ]
}

Rules:
- Extract all visible student names
- If the image contains a table/list, extract each row
- firstName and lastName are required
- middleName and dateOfBirth are optional
${className ? `- All students belong to class: ${className}` : ''}
- Return ONLY the JSON object, no additional text`

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
                media_type: 'image/jpeg',
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: prompt,
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

    const result = JSON.parse(responseText)

    console.log(`[API] User ${userId} extracted ${result.students?.length || 0} students`)

    return res.status(200).json(result)
  } catch (error: any) {
    console.error('Student extraction error:', error)
    return res.status(500).json({
      error: error.message || 'Failed to extract students',
    })
  }
}
