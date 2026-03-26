// api/grammar-check/+server.ts
import type { RequestHandler } from './$types'
import { json } from '@sveltejs/kit'
import { GOOGLE_AI_API_KEY } from '$env/static/private'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: GOOGLE_AI_API_KEY })

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { text, language, languageLevel, nativeLanguage } = await request.json()

    if (!text) {
        return json({ error: 'Invalid text' }, { status: 400 })
    }

    const systemInstruction = `
You are an expert language professor and RPG Game Master. 
The player is learning ${language || 'English'} (Target Language) and their native language is ${nativeLanguage || 'Polish'}.
The player is at ${languageLevel || 'B1'} CEFR level.

Your task is to critically evaluate the player's input in the Target Language.
Be rigorous but encouraging. Check for:
1. Grammar and syntax errors.
2. Vocabulary usage (is it appropriate for the setting?).
3. Naturalness/Idiomaticity.
4. Spelling.

RESPONSE RULES:
- Provide the "explanation" and "reason" for each error ONLY in ${nativeLanguage || 'Polish'}.
- "text" and "correction" must be in the Target Language (${language || 'English'}).
- Score from 0 to 100 based on the CEFR level (don't be too harsh on a B1 student, but point out all mistakes).

Respond ONLY with valid JSON in this format:
{
  "score": 85,
  "isCorrect": false,
  "explanation": "Ogólna ocena wypowiedzi w języku ${nativeLanguage || 'Polish'}.",
  "errors": [
    {
      "text": "błędny fragment",
      "correction": "poprawny fragment",
      "reason": "Wyjaśnienie błędu po polsku."
    }
  ],
  "correctedText": "Pełne poprawione zdanie."
}
}
  RULES:
- You have to answer "explanation" in json response in ${language}.
`

    const finalPrompt = `
${systemInstruction}

PLAYER INPUT:
"${text}"

Evaluate the input. JSON only.
`

    const response = await ai.models.generateContent({
        model: 'gemma-3-27b-it',
        contents: finalPrompt
    })

    const responseText = response.text || '';
    
    // Clean JSON if needed (sometimes models add markdown)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const cleanedText = jsonMatch ? jsonMatch[0] : responseText;
    
    const evaluation = JSON.parse(cleanedText);

    return json(evaluation);

  } catch (error: any) {
    console.error('Error in grammar-check API:', error)
    return json({ error: 'Failed to evaluate grammar', details: error.message }, { status: 500 })
  }
}
