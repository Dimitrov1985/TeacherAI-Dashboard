import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'

const MODEL = 'claude-haiku-4-5-20251001'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { image, topic, subject, grade } = req.body

    if (!image && !topic) {
      return res.status(400).json({ error: 'Either image or topic is required' })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })
    }

    const anthropic = new Anthropic({ apiKey })

    // Построить промпт
    let promptText = `You are an expert teacher creating a homework assignment.

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
  "resources": ["Resource 1", "Resource 2"] // optional materials needed
}

IMPORTANT:
- Generate EVERYTHING in English
- Make tasks specific and actionable
- Include realistic time estimate
- Keep title concise
- Return ONLY valid JSON, no markdown or explanation`

    const content: any[] = []

    // Если есть изображение, добавить его
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

    // Добавить текстовый промпт
    content.push({
      type: 'text',
      text: promptText,
    })

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content,
        },
      ],
    })

    const textContent = message.content.find((block: any) => block.type === 'text')
    if (!textContent) {
      throw new Error('No text response from API')
    }

    let responseText = textContent.text.trim()

    // Убрать markdown code blocks если есть
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '')

    const homework = JSON.parse(responseText)

    return res.status(200).json(homework)
  } catch (error: any) {
    console.error('Homework generation error:', error)
    return res.status(500).json({
      error: error.message || 'Failed to generate homework',
    })
  }
}
