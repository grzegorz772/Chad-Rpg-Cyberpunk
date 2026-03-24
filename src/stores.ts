import { writable, type Writable } from 'svelte/store'
import type {
	GameData,
	Character,
	UIState,
	MiscState,
	BackgroundImage,
	DescriptionWindow,
	CoolDowns,
	InventoryItem
} from '$lib/types/game'
import { STARTING_VALUES, LanguageSettingsData } from '$lib/config/constants'

// Game state store
export const game: Writable<{ gameData: GameData }> = writable({
	gameData: {
		lootBox: [],
		placeAndTime: { place: '', time: '00:00' },
		shop: [],
		choices: [],
		enemy: {},
		event: { inCombat: false, shopMode: null, lootMode: false },
		story: ''
	}
})

// Character state store
export const character: Writable<Character> = writable({
	stats: [{ hp: 0, maxHp: 0, mp: 0, maxMp: 0 }],
	gold: 0,
	spells: [],
	inventory: []
})

// UI state store
export const ui: Writable<UIState> = writable({
	errorWarnMsg: '',
	buyWarnMsg: '',
	sellWarnMsg: '',
	toastMsg: ''
})

// Selected item store for combat, selling, and buying
export const selectedItem: Writable<
	Partial<
		InventoryItem & {
			combatScore?: number
			prompt?: string
			showDescription?: string
		}
	>
> = writable({})

// Cooldowns store
export const coolDowns: Writable<CoolDowns> = writable({})

// Miscellaneous state store
export const misc: Writable<MiscState> = writable({
	showInfoWindow: false,
	loading: false,
	showDescription: 'none',
	x: 0,
	y: 0,
	diceNumber: 0,
	query: '',
	time: '00:00',
	place: '',
	currentImg: '',
	death: false,
	interactivePoints: STARTING_VALUES.INTERACTIVE_POINTS,
	bugWindow: false,
	maintenanceWindow: false,
	started: false,
	heroClass: '',
	showMapModal: false
})

// Background image store
export const bgImage: Writable<BackgroundImage> = writable({
	fetchedBg1: '',
	fetchedBg2: '',
	img1active: false,
	img2active: false
})

// Description window store
export const descWindow: Writable<DescriptionWindow> = writable({
	name: '',
	damage: 0,
	type: '',
	healing: 0,
	mana: 0,
	point: 0,
	armor: 0,
	element: '',
	weaponClass: '',
	manaCost: 0,
	price: 0,
	amount: 0
})

// Language settings store
export const languageSettings: Writable<{
	nativeLanguage: string
	foreignLanguage: string
	languageLevel: string
}> = writable({
	nativeLanguage: LanguageSettingsData.nativeLanguage,
	foreignLanguage: LanguageSettingsData.foreignLanguage,
	languageLevel: LanguageSettingsData.languageLevel
})

// stores.ts
export interface ChatHistoryEntry {
	id: number;
	timestamp: string;
	userChoice: string;  // Co wybrał/użytkownik wpisał
	aiResponse: string;   // Odpowiedź AI (story)
	choices: string[];    // Opcje które dostał użytkownik
	location: string;     // Miejsce akcji
}

export const gameState: Writable<{
	chatMessages: any[];
	chatHistory: ChatHistoryEntry[];  // <-- DODAJ
	enemyOnFrontend: boolean;
	quotaExceeded: boolean;
	highDemand: boolean;
	requestTimeout: boolean;
	worldPrompt: string;
	mapGenerated: boolean;
	mapGrid: any[];
	generatingWorld: boolean;
	answer: string;
	dotty: string;
}> = writable({
	chatMessages: [],
	chatHistory: [],  // <-- DODAJ
	enemyOnFrontend: false,
	quotaExceeded: false,
	highDemand: false,
	requestTimeout: false,
	worldPrompt: '',
	mapGenerated: false,
	mapGrid: [],
	generatingWorld: false,
	answer: '',
	dotty: '.'
});