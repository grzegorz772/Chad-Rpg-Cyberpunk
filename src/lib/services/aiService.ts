// src/lib/services/aiService.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function fetchAiChat(params: {
    apiKey: string;
    prompt: string;
    language: string;
    languageLevel: string;
    nativeLanguage: string;
    chatHistory: any[];
    player: any;
}) {
    const genAI = new GoogleGenerativeAI(params.apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemma-3-27b-it' });

    const playerContext = params.player ? `
PLAYER STATUS:
- Gold: ${params.player.gold}
- Position: [${params.player.x}, ${params.player.y}]
- Stats: HP: ${params.player.stats.hp}/${params.player.stats.maxHp}, MP: ${params.player.stats.mp}/${params.player.stats.maxMp}, STR: ${params.player.stats.strength}, AGI: ${params.player.stats.agility}, INT: ${params.player.stats.intelligence}, DEF: ${params.player.stats.defense}
- Inventory: ${JSON.stringify(params.player.inventory)}
` : '';

    const systemInstruction = `
You are an RPG game master.

LANGUAGE SETTINGS:
- Target Language: ${params.language || 'English'}
- Native Language: ${params.nativeLanguage || 'Polish'}
- CEFR level for Target Language: ${params.languageLevel || 'B1'}

${playerContext}

You MUST respond ONLY with valid JSON.

FORMAT:
{
  "gameData": {
    "placeAndTime": { "place": "Location Name", "time": "HH:MM" },
    "story": "Narrative text in Target Language",
    "storyNative": "The SAME Narrative text translated into Native Language",
    "event": { "inCombat": false, "lootMode": false },
    "choices": ["Choice 1", "Choice 2", "Choice 3"],
    "enemy": {},
    "lootBox": []
  }
}

RULES:
- story in ${params.language} (CEFR ${params.languageLevel}), storyNative in ${params.nativeLanguage}.
- Include at least 3 choices.
- JSON only.
`;

    const finalPrompt = `${systemInstruction}\n\nUSER INPUT:\n${params.prompt}`;
    
    const result = await model.generateContent(finalPrompt);
    return result.response.text();
}

export async function fetchGrammarCheck(params: {
    apiKey: string;
    text: string;
    language: string;
    languageLevel: string;
    nativeLanguage: string;
}) {
    const genAI = new GoogleGenerativeAI(params.apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemma-3-27b-it' });

    const systemInstruction = `
You are an expert language professor. Evaluate the player's input in ${params.language} at ${params.languageLevel} level.
Native Language: ${params.nativeLanguage}.

Respond ONLY with valid JSON:
{
  "score": 0-100,
  "isCorrect": boolean,
  "explanation": "Assessment in ${params.nativeLanguage}",
  "errors": [
    { "text": "wrong", "correction": "right", "reason": "why in ${params.nativeLanguage}" }
  ],
  "correctedText": "Full correct text"
}
`;

    const result = await model.generateContent(`${systemInstruction}\n\nINPUT: "${params.text}"`);
    return result.response.text();
}
