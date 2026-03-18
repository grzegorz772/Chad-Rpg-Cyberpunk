import type { RequestHandler } from './$types'
import { json } from '@sveltejs/kit'
import { GOOGLE_AI_API_KEY } from '$env/static/private'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: GOOGLE_AI_API_KEY })

const systemInstruction = `
You are an RPG game master.

You MUST respond ONLY with valid JSON.

FORMAT:
{
  "gameData": {
    "placeAndTime": { "place": "Location Name", "time": "HH:MM" },
    "story": "Narrative text",
    "event": { "inCombat": false, "shopMode": null, "lootMode": false },
    "choices": ["Choice 1", "Choice 2", "Choice 3"],
    "enemy": {},
    "lootBox": []
  }
}

RULES:
<<<<<<< HEAD
Rules:
- Always include at least 3 choices
- story should be immersive 3rd person narrative
- When in combat, set inCombat to true and populate enemy with {name, enemyHp, enemyMaxHp}
- When in shop, set shopMode to shop type like "Weaponsmith" or "PotionShop" or "SpellShop"
- NEVER include markdown code blocks or any text outside the JSON
=======
- at least 3 choices
- no markdown
- no text outside JSON
>>>>>>> d973287 (Gemma LLM support)
`
const worldGenerationInstruction = `
You are a world generator for a text-based RPG game.

Based on the user's description, create a detailed starting prompt that will be used as the first message in the game.

The prompt should:
1. Set the scene in a specific location appropriate for the genre
2. Describe the atmosphere, sounds, smells, and key visual details
3. Introduce an interesting character, creature, or situation
4. End with the player character arriving
5. Start with: "Start off as a new adventurer in [genre description]. Player enters..."

Return ONLY the prompt text, no explanations, no markdown, no JSON.
`

export const POST: RequestHandler = async ({ request }) => {
  try {
const { prompt, type } = await request.json()

let finalPrompt
if (type === 'world_generation') {
  finalPrompt = `
${worldGenerationInstruction}

USER REQUEST:
${prompt}

Remember: Return ONLY the prompt text.
`
} else {
  finalPrompt = `
${systemInstruction}

USER INPUT:
${prompt}

Remember: JSON only.
`
}

const response = await ai.models.generateContent({
  model: 'gemma-3-27b-it',
  contents: finalPrompt
})

const responseText = response.text || ''

if (type === 'world_generation') {
  // Wyczyść odpowiedź dla world generation
  const cleanPrompt = responseText
    .replace(/```/g, '')
    .replace(/^["']|["']$/g, '')
    .trim()
  
  return json({ worldPrompt: cleanPrompt })
} else {
  return json({
    candidates: [
      {
        content: {
          parts: [{ text: responseText }]
        }
      }
    ]
  })
}
  } catch (error: unknown) {
    console.error('Error in chat API:', error)

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