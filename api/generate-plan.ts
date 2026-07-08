import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'

const MODEL = 'claude-haiku-4-5-20251001' // Claude Haiku 4.5 - faster and cheaper with vision support

type GeneratePlanRequestBody = {
  imageDataUrl?: string
}

function parseDataUrl(dataUrl: string): { mimeType: string; base64: string } | null {
  const match = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/.exec(dataUrl)
  if (!match) return null
  return { mimeType: match[1], base64: match[2] }
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
    const anthropic = new Anthropic({
      apiKey: apiKey,
    })

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 8192,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: parsed.mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: parsed.base64,
              },
            },
            {
              type: 'text',
              text: `You are an expert assistant for a school teacher. Read the textbook page in the photo and produce a DETAILED lesson plan based on it.

IMPORTANT: Generate EVERYTHING in English language only. All text, titles, descriptions, and instructions must be in English.

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
      "instructions": [
        "step 1 in English",
        "step 2 in English",
        "step 3 in English"
      ]
    }
  ],
  "materialsNeeded": ["material description in English", "another material in English"]
}

REQUIREMENTS:
- Write EVERYTHING in English language
- Include 5-7 flashcards covering key terms/concepts from the textbook page
- Create 4-6 diverse activities:
  * 1 warmup (5-10 min) - engagement/review of prior knowledge
  * 2-3 main activities (10-15 min each) - teaching new content
  * 1-2 practice activities (10-15 min) - hands-on application
  * 1 review/closure (5-10 min) - summarize and assess learning
- Each activity must have: type, title, duration, goal, and 3-5 step-by-step instructions
- Make activities interactive, practical, and age-appropriate
- Total lesson time should be 45-60 minutes
- All content (objectives, activities, materials, flashcards) must be written in English`,
            },
          ],
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      res.status(502).json({ error: 'Unexpected response type from Claude' })
      return
    }

    const text = content.text
    if (!text) {
      res.status(502).json({ error: 'No response from the model' })
      return
    }

    // Remove markdown code fences if present
    const jsonText = text.trim().replace(/^```json\s*|\s*```$/g, '')
    const plan = JSON.parse(jsonText)

    res.status(200).json({ plan })
  } catch (error) {
    console.error('generate-plan failed', error)
    res.status(500).json({ error: 'Failed to generate lesson plan' })
  }
}
