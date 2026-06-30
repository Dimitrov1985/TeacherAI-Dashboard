import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'

type ImportedStudent = {
  studentId?: string
  firstName: string
  lastName: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { image, className } = req.body

    if (!image || !className) {
      return res.status(400).json({ error: 'Missing image or className' })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' })
    }

    const anthropic = new Anthropic({ apiKey })

    // Extract base64 data
    const base64Data = image.split(',')[1] || image
    const mediaType = image.includes('image/png') ? 'image/png' : 'image/jpeg'

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: `Проанализируй это изображение и извлеки список учеников класса "${className}".

Формат: Name Surname (ID не нужен)

Верни ТОЛЬКО JSON массив в следующем формате (без дополнительного текста):
[
  {
    "firstName": "Name или ชื่อ",
    "lastName": "Surname или สกุล"
  }
]

Правила:
- firstName - имя ученика
- lastName - фамилия ученика
- Порядковые номера (1, 2, 3...) и ID игнорируй
- Распознавай тайский, русский, английский текст
- Колонки หมายเหตุ, примечания, ID - игнорируй
- Если нет списка учеников, верни []

Примеры:
"1. สมชาย ใจดี" → {"firstName": "สมชาย", "lastName": "ใจดี"}
"John Smith" → {"firstName": "John", "lastName": "Smith"}
"Иван Петров" → {"firstName": "Иван", "lastName": "Петров"}

Верни ТОЛЬКО JSON, без пояснений.`,
            },
          ],
        },
      ],
    })

    // Extract JSON from response
    const textContent = message.content.find((c) => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      return res.status(500).json({ error: 'No text response from AI' })
    }

    // Parse JSON from response
    let students: ImportedStudent[] = []
    try {
      // Try to extract JSON from markdown code blocks or plain text
      const jsonMatch = textContent.text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        students = JSON.parse(jsonMatch[0])
      } else {
        students = JSON.parse(textContent.text)
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', textContent.text)
      return res.status(500).json({ error: 'Failed to parse AI response', rawResponse: textContent.text })
    }

    return res.status(200).json({ students })
  } catch (error) {
    console.error('Error processing image:', error)
    return res.status(500).json({
      error: 'Failed to process image',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
