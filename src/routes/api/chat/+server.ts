import type { RequestHandler } from './$types'
import { json } from '@sveltejs/kit'
import { GOOGLE_AI_API_KEY } from '$env/static/private'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: GOOGLE_AI_API_KEY })

const worldEnhancementInstruction = `
You are a world generator for an RPG game.

You will receive a JSON structure with placeholders "LLM" and "RND".
Your task is to replace all placeholders with creative, immersive content:

- Replace "LLM" with:
  * For names: creative, fantasy-style names (2-4 words, e.g., "Silverwind City", "Gloomroot Forest")
  * For descriptions: atmospheric, 1-2 sentence descriptions that fit the region type

- Replace "RND" with:
  * Realistic numeric IDs (e.g., "weapon_001", "potion_heal_003", "enemy_012")
  * For buildings: meaningful IDs based on building type
  * For enemies: IDs based on enemy type

Keep the exact same JSON structure. Return ONLY the enhanced JSON, no explanations, no markdown.
`

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { prompt, type } = await request.json()

    if (type !== 'world_enhancement') {
      return json({ error: 'Invalid type' }, { status: 400 })
    }

    const finalPrompt = `
${worldEnhancementInstruction}

Here is the world JSON to enhance:

${prompt}

Return ONLY the enhanced JSON.
`

    const response = await ai.models.generateContent({
      model: 'gemma-3-27b-it',
      contents: finalPrompt
    })

    const responseText = response.text || ''

    console.log('World enhancement response received')

    // Wyczyść odpowiedź z markdown
    let cleanText = responseText
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim()

    // Znajdź pierwszy { i ostatni }
    const firstBrace = cleanText.indexOf('{')
    const lastBrace = cleanText.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanText = cleanText.substring(firstBrace, lastBrace + 1)
    }

    // Sprawdź czy to poprawny JSON
    try {
      JSON.parse(cleanText)
    } catch (e) {
      console.error('Invalid JSON from AI:', cleanText)
      return json({ error: 'Invalid JSON generated' }, { status: 500 })
    }

    return json({ worldData: JSON.parse(cleanText) })

  } catch (error: unknown) {
    console.error('Error in world enhancement API:', error)

    if (error && typeof error === 'object' && 'status' in error) {
      const status = (error as { status: number }).status

      if (status === 429) {
        return json(
          {
            error: 'quota_exceeded',
            message: 'API quota exceeded. Please try again later.'
          },
          { status: 429 }
        )
      }

      if (status === 503) {
        return json(
          {
            error: 'high_demand',
            message: 'The AI model is currently experiencing high demand.'
          },
          { status: 503 }
        )
      }
    }

    return json({ error: 'Failed to process request' }, { status: 500 })
  }
}