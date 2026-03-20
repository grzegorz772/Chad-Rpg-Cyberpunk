import type { RequestHandler } from './$types'
import { json } from '@sveltejs/kit'
import { GOOGLE_AI_API_KEY } from '$env/static/private'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: GOOGLE_AI_API_KEY })

const regionEnhancementInstruction = `
You are a world generator for an RPG game.

You will receive a JSON with regions that need creative names and descriptions.
For each region, generate:
- A creative, fantasy-style name (2-3 words)
- A short atmospheric description (1-2 sentences) that fits the region type

Return ONLY JSON with regionId as key containing name and description.
`

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { prompt, type } = await request.json()
    
    if (type !== 'region_enhancement') {
      return json({ error: 'Invalid type' }, { status: 400 })
    }
    
    const finalPrompt = `
${regionEnhancementInstruction}

${prompt}

Return ONLY the JSON.
`
    
    const response = await ai.models.generateContent({
      model: 'gemma-3-27b-it',
      contents: finalPrompt
    })
    
    const responseText = response.text || ''
    
    let cleanJson = responseText
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim()
    
    const firstBrace = cleanJson.indexOf('{')
    const lastBrace = cleanJson.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanJson = cleanJson.substring(firstBrace, lastBrace + 1)
    }
    
    try {
      JSON.parse(cleanJson)
    } catch (e) {
      console.error('Invalid JSON:', cleanJson)
      return json({ error: 'Invalid JSON generated' }, { status: 500 })
    }
    
    return json({ regionData: JSON.parse(cleanJson) })
    
  } catch (error) {
    console.error('Error:', error)
    return json({ error: 'Failed' }, { status: 500 })
  }
}