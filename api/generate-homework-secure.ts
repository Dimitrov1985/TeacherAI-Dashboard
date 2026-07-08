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
const MAX_TOPIC_LENGTH = 500

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

  // 2. RATE LIMITING - 15 запросов в минуту
  const rateLimit = checkRateLimit(userId, 'generate-homework', {
    maxRequests: 15,
    windowMs: 60 * 1000,
  })

  res.setHeader('X-RateLimit-Limit', '15')
  res.setHeader('X-RateLimit-Remaining', String(rateLimit.remaining || 0))
  res.setHeader('X-RateLimit-Reset', String(rateLimit.resetAt || 0))

  if (!rateLimit.ok) {
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil((rateLimit.resetAt! - Date.now()) / 1000),
    })
  }

  // 3. ВАЛИДАЦИЯ INPUT
  const { image, topic, subject, grade } = req.body

  if (!image && !topic) {
    return res.status(400).json({ error: 'Either image or topic is required' })
  }

  // Валидация topic
  if (topic) {
    if (typeof topic !== 'string') {
      return res.status(400).json({ error: 'Topic must be a string' })
    }
    if (topic.length > MAX_TOPIC_LENGTH) {
      return res.status(400).json({ error: `Topic too long (max ${MAX_TOPIC_LENGTH} chars)` })
    }
  }

  // Валидация image
  if (image) {
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
  }

  // 4. ВЫЗОВ API
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API not configured' })
  }

  try {
    const anthropic = new Anthropic({ apiKey })

    const promptText = `You are an expert teacher creating a homework assignment.

${subject ? `Subject: ${subject}` : ''}
${grade ? `Grade/Class: ${grade}` : ''}
${topic ? `Topic: ${topic}` : ''}

Generate a clear and engaging homework assignment with the following structure:

{
  "title": "Brief assignment title (max 60 characters)",
  "description": "Detailed instructions for students (2-4 sentences)",
  "tasks": [
    "Task 1 - specific activity",
    "Task 2 - specific activity",
    "Task 3 - specific activity"
  ],
  "estimatedTime": "Estimated completion time (e.g., '30-45 minutes')",
  "resources": ["Resource 1", "Resource 2"]
}

IMPORTANT:
- Generate EVERYTHING in English
- Make tasks specific and actionable
- Include realistic time estimate
- Keep title concise
- Return ONLY valid JSON, no markdown or explanation`

    const content: any[] = []

    if (image) {
      const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '')
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/jpeg',
          data: base64Data,
        },
      })
    }

    content.push({
      type: 'text',
      text: promptText,
    })

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [{ role: 'user', content }],
    })

    const textContent = message.content.find((block: any) => block.type === 'text')
    if (!textContent) {
      throw new Error('No text response from API')
    }

    let responseText = textContent.text.trim()
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '')

    const homework = JSON.parse(responseText)

    console.log(`[API] User ${userId} generated homework`)

    return res.status(200).json(homework)
  } catch (error: any) {
    console.error('Homework generation error:', error)
    return res.status(500).json({
      error: error.message || 'Failed to generate homework',
    })
  }
}
