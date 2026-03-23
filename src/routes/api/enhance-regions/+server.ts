import type { RequestHandler } from './$types'
import { json } from '@sveltejs/kit'
import { GOOGLE_AI_API_KEY } from '$env/static/private'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: GOOGLE_AI_API_KEY })

const defaultInstruction = `
You are a world generator for an RPG game.
Your task is to enhance the world data provided in the prompt.
Return ONLY valid JSON. No explanations, no markdown blocks.
`

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { prompt, type, instructions } = await request.json()
    
    // We can pass custom instructions or use defaults based on type
    let finalInstruction = instructions || defaultInstruction;
    
    if (type === 'region_enhancement' && !instructions) {
      finalInstruction = `
You are a world generator for an RPG game.
You will receive a JSON with regions that need creative names and descriptions.
For each region, generate:
- A creative, fantasy-style name (2-3 words)
- A short atmospheric description (1-2 sentences) that fits the region type
Return ONLY JSON with regionId as key containing name and description.
`;
    } else if (type === 'theme_enhancement' && !instructions) {
      finalInstruction = `
You are a world generator for an RPG game.
Based on a world description, you must create a visual theme.
For each region type (city, plains, water, desert, forest, mountain), provide:
1. A base HEX color that fits the theme.
2. A theme-appropriate name for that type of terrain.

Return ONLY a JSON object in this format:
{
  "theme": {
    "city": { "name": "...", "color": "#HEX" },
    "plains": { "name": "...", "color": "#HEX" },
    "water": { "name": "...", "color": "#HEX" },
    "desert": { "name": "...", "color": "#HEX" },
    "forest": { "name": "...", "color": "#HEX" },
    "mountain": { "name": "...", "color": "#HEX" }
  }
}
`;
    }
    
    const finalPrompt = `
${finalInstruction}

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
      const parsed = JSON.parse(cleanJson);
      // If it's theme enhancement, wrap it in a way that matches what MapGenerator expects if needed
      // MapGenerator expects data.theme or data.regionData.theme
      return json({ regionData: parsed, theme: parsed.theme })
    } catch (e) {
      console.error('Invalid JSON:', cleanJson)
      return json({ error: 'Invalid JSON generated' }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Error:', error)
    return json({ error: 'Failed' }, { status: 500 })
  }
}
