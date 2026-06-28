import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'

const MODEL = 'claude-sonnet-4-6'

type GeneratePlanRequestBody = {
  imageDataUrl?: string
}

function parseDataUrl(dataUrl: string): { mediaType: string; base64: string } | null {
  const match = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/.exec(dataUrl)
  if (!match) return null
  return { mediaType: match[1], base64: match[2] }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured on the server' })
    return
  }

  const { imageDataUrl } = req.body as GeneratePlanRequestBody
  if (!imageDataUrl) {
    res.status(400).json({ error: 'imageDataUrl is required' })
    return
  }

  const parsed = parseDataUrl(imageDataUrl)
  if (!parsed) {
    res.status(400).json({ error: 'imageDataUrl must be a base64 image data URL' })
    return
  }

  try {
    const client = new Anthropic({ apiKey })

    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: parsed.mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: parsed.base64,
              },
            },
            {
              type: 'text',
              text: `You are an assistant for a school teacher. Read the textbook page in the photo and produce a complete lesson plan based on it.

Respond with ONLY valid JSON, no markdown fences, matching exactly this shape:
{
  "title": "short lesson title",
  "objectives": ["3 to 5 learning objectives"],
  "flashcards": [{ "front": "term or question", "back": "definition or answer" }],
  "activities": ["2 to 3 classroom activities"],
  "materialsNeeded": ["physical or digital materials needed"]
}

Include at least 5 flashcards covering the key terms/concepts from the page.`,
            },
          ],
        },
      ],
    })

    const textBlock = message.content.find((block) => block.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      res.status(502).json({ error: 'No text response from the model' })
      return
    }

    const jsonText = textBlock.text.trim().replace(/^```json\s*|\s*```$/g, '')
    const plan = JSON.parse(jsonText)

    res.status(200).json({ plan })
  } catch (error) {
    console.error('generate-plan failed', error)
    res.status(500).json({ error: 'Failed to generate lesson plan' })
  }
}
