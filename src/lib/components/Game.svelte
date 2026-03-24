<script lang="ts">
	import { fade, scale, fly } from 'svelte/transition'
	import { backOut, cubicOut } from 'svelte/easing'

	import LetterByLetter from './LetterByLetter.svelte'
	import GameStartWindow from './GameStartWindow.svelte'
	import DescriptionWindow from './ItemDescWindow.svelte'
	import MessageWindows from './InGameWarnMsgs.svelte'
	import ActionBox from './ActionBox.svelte'
	import Choices from './Choices.svelte'
	import BackgroundImgs from './BackgroundImgs.svelte'

	import { game, character, selectedItem, misc, coolDowns, bgImage, ui, languageSettings } from '../../stores'
	import { supabase } from '$lib/supabaseClient'

	import buyWeapons from '$lib/gamedata/weapons.json'
	import buySpells from '$lib/gamedata/spells.json'
	import buyPotions from '$lib/gamedata/potions.json'
	import staticPlaces from '$lib/gamedata/places.json'

	import medievalMageInventory from '$lib/gamedata/gamestarters/medievalMageInventory.json'
	import medievalMageSpells from '$lib/gamedata/gamestarters/medievalMageSpells.json'
	import medievalWarriorInventory from '$lib/gamedata/gamestarters/medievalWarriorInventory.json'
	import medievalWarriorSpells from '$lib/gamedata/gamestarters/medievalWarriorSpells.json'

	import Modal from './testing/Modal.svelte'
	import { CHARACTER_CLASSES, STARTING_VALUES, SHOP_CONFIG } from '$lib/config/constants'
	import { onMount } from 'svelte'
	import { 
		generateMap, 
		getFullWorldData, 
		getMapGrid, 
		MAP_SIZE,
		findStartingLocation,
		getRegionsInRadius,
		enhanceRegionsWithAI,
		updateWorldWithEnhancedRegions,
		generateAllRegionsWithAI,
		enhanceWorldTheme
	} from '$lib/components/utils/MapGenerator';
	import { gameState } from '../../stores';
	import { FunctionResponseScheduling } from '@google/genai'


	export interface GameState {
		chatMessages: ChatMessage[];
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
	}

	export interface ChatMessage {
		role: 'user' | 'assistant';
		content: any;
	}


	// Eksport dla +page.svelte
	export function getMapGridFromGame() {
		return $gameState.mapGrid;
	}

onMount(() => {
	// Istniejący interval dla dotty
	const dottyInterval = setInterval(() => {
		if ($gameState.dotty === '...') {
			$gameState.dotty = ''
		}
		$gameState.dotty += '.'
	}, 400)

	// Logger stanu gry co 5 sekund
	const logInterval = setInterval(() => {
		console.log('=== GAME STATE LOG (5s) ===');
		console.log('Chat Messages:', $gameState.chatMessages);
		console.log('Chat History:', $gameState.chatHistory);
		console.log('World Prompt:', $gameState.worldPrompt);
		console.log('Map Generated:', $gameState.mapGenerated);
		console.log('Generating World:', $gameState.generatingWorld);
		console.log('Quota Exceeded:', $gameState.quotaExceeded);
		console.log('High Demand:', $gameState.highDemand);
		console.log('Request Timeout:', $gameState.requestTimeout);
		console.log('Answer:', $gameState.answer);
		console.log('Dotty:', $gameState.dotty);
		console.log('========================');
	}, 5000);

	// Cleanup przy odmontowaniu komponentu
	return () => {
		clearInterval(dottyInterval);
		clearInterval(logInterval);
	}
})


	// Game.svelte - dodaj tę funkcję
	function addToChatHistory(userChoice: string, aiResponse: string, choices: string[], location: string) {
		const newEntry: ChatHistoryEntry = {
			id: $gameState.chatHistory.length + 1,
			timestamp: new Date().toISOString(),
			userChoice: userChoice,
			aiResponse: aiResponse,
			choices: choices,
			location: location
		};
		
		$gameState.chatHistory = [...$gameState.chatHistory, newEntry];
		console.log('📜 Chat history updated:', newEntry);
	}
	
	async function handleSubmit() {
		$misc.loading = true
		
		// Zapisz wybór użytkownika
		const userChoice = $misc.query
		
		// Dodaj do chatMessages (dla kompatybilności)
		$gameState.chatMessages = [...$gameState.chatMessages, { 
			role: 'user', 
			content: userChoice 
		}]

		const prompt = $gameState.chatMessages.length > 0 ? $misc.query : getGamePrompt()
		console.log('Sending prompt:', prompt)

		// Pobierz aktualne ustawienia językowe z store
		const currentLang = $languageSettings
		const language = currentLang.foreignLanguage
		const languageLevel = currentLang.languageLevel

		const controller = new AbortController()
		const timeoutId = setTimeout(() => {
			if ($misc.loading) {
				$gameState.requestTimeout = true
				$misc.loading = false
				controller.abort()
			}
		}, 90000)

		try {
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					prompt,
					language,
					languageLevel,
					chatHistory: $gameState.chatHistory,
					player: $gameState.player
				}),
				signal: controller.signal
			})

			clearTimeout(timeoutId)
			$gameState.requestTimeout = false

			// Check for quota exceeded error
			if (response.status === 429) {
				const errorData = await response.json()
				if (errorData.error === 'quota_exceeded') {
					$gameState.quotaExceeded = true
					$misc.loading = false
					return
				}
			}

			// Check for high demand error
			if (response.status === 503) {
				const errorData = await response.json()
				if (errorData.error === 'high_demand') {
					$gameState.highDemand = true
					$gameState.requestTimeout = false
					$misc.loading = false
					return
				}
			}

			// Check for gateway timeout (Vercel/Prod)
			if (response.status === 504) {
				if ($gameState.requestTimeout) return
				$gameState.highDemand = true
				$gameState.requestTimeout = false
				$misc.loading = false
				return
			}

			if (!response.ok) {
				throw new Error(`HTTP Error: ${response.status}`)
			}

			const responseData = await response.json()
			let gameData

			// Helper to extract JSON from text that might have extra content
			const extractJSON = (text: string): string => {
				let cleaned = text
					.replace(/```json\s*/g, '')
					.replace(/```\s*/g, '')
					.trim()

				const firstBrace = cleaned.indexOf('{')
				if (firstBrace === -1) return cleaned

				let braceCount = 0
				let lastBrace = firstBrace
				for (let i = firstBrace; i < cleaned.length; i++) {
					if (cleaned[i] === '{') braceCount++
					if (cleaned[i] === '}') {
						braceCount--
						if (braceCount === 0) {
							lastBrace = i
							break
						}
					}
				}
				return cleaned.substring(firstBrace, lastBrace + 1)
			}

			try {
				const rawText = responseData.candidates[0].content.parts[0].text
				const jsonString = extractJSON(rawText)
				const parsed = JSON.parse(jsonString)
				gameData = parsed.gameData || parsed
			} catch (error) {
				console.error('JSON parse error, raw text:', responseData.candidates[0].content.parts[0].text)
				throw error
			}

			console.log('Parsed gameData:', gameData)

			// Preserve enemy HP
			let hpOfEnemy = 0
			if ($game.gameData.enemy?.enemyHp) {
				hpOfEnemy = $game.gameData.enemy.enemyHp
			}

			$game = { gameData }

			if (hpOfEnemy && $game.gameData.enemy?.enemyHp) {
				$game.gameData.enemy.enemyHp = hpOfEnemy
			}

			if (!$game.gameData.enemy?.enemyMaxHp && $game.gameData.enemy?.enemyHp) {
				$game.gameData.enemy.enemyMaxHp = $game.gameData.enemy.enemyHp
			}

			// ZAPISZ DO HISTORII
			addToChatHistory(
				userChoice,
				gameData.story,
				gameData.choices,
				gameData.placeAndTime?.place || ''
			)

			$misc.started = true
			$misc.place = $game.gameData.placeAndTime?.place || ''
			$misc.time = $game.gameData.placeAndTime?.time || '00:00'

			$gameState.chatMessages = [...$gameState.chatMessages, { 
				role: 'assistant', 
				content: gameData 
			}]
			
		} catch (error: any) {
			if (error.name === 'AbortError' || $gameState.requestTimeout) {
				console.log('Request was aborted or timed out at 9s mark')
				return
			} else {
				console.error('Error in handleSubmit:', error)
				handleError(error)
			}
		} finally {
			if (!$gameState.requestTimeout) {
				$misc.loading = false
			}
		}
	}
	function getGamePrompt() {
		const worldContext = $gameState.worldPrompt 
			? `The game world is described as follows: "${$gameState.worldPrompt}". Use this context for all storytelling.`
			: "This is a standard fantasy role-playing game world.";

		return `This is a role-playing game where you'll be the 1st person character and storyteller. ${worldContext} 

		VISUAL STYLE: All character, enemy, and location descriptions should evoke a "PixelArtRedmond 1.5V" aesthetic - high-quality, vibrant, detailed pixel art with a modern fantasy feel.

		You'll describe the world from a 3rd person perspective but when it's time for a conversation, interact with the player from a 1st person npc perspective. All these 1st person and 3rd person content will be in gameData.story! Shape the storyline based on players choices.

		All of your responses MUST include a valid json object, with this exact properties(keys):

		"gameData": {
			"placeAndTime": { "place": "Enchanted Library", "time": "14:00" },
			"story": "As you step into the vast, towering library...",
			"event": { "inCombat": false, "shopMode": null, "lootMode": false },
			"choices": ["Approach the librarian for assistance.", "Browse the shelves for a specific book.", "Sit down and read a random tome."],
			"enemy": {},
			"lootBox": []
		}

		Don't forget to include at least 3 unique choices for the user to choose.`
	}
	function handleError(error: any) {
		console.error('Game error:', error)
		setTimeout(() => {
			if ($misc.query) {
				giveAnswer($misc.query)
			}
		}, 1000)
	}

	export function giveAnswer(choice: string) {
		if (!choice || choice.trim().length === 0) return

		if (choice.includes('sex') || choice.includes('kill')) {
			if (!choice.includes('skill')) {
				$ui.errorWarnMsg = "There's a flawed word in your answer."
				return
			}
		}

		$game.gameData.story = ''
		$game.gameData.choices = []
		$game.gameData.shop = []

		// Increment cooldowns
		for (const key in $coolDowns) {
			if ($coolDowns.hasOwnProperty(key)) {
				$coolDowns[key] += 1
			}
		}

		$selectedItem.showDescription = 'none'
		$misc.query = choice

		handleSubmit().then(() => {
			$misc.query = ''
			$gameState.answer = ''
		})

		if (!$misc.started) {
			$misc.started = true
		}
	}

	// Image count per location folder in Supabase storage
	// Update these values when you add/remove images from storage
	const locationImageCounts: Record<string, number> = {
		Academy: 2,
		Armorsmith: 7,
		Beach: 3,
		Blacksmith: 7,
		Castle: 5,
		Cathedral: 2,
		Cave: 4,
		City: 4,
		'City-night': 4,
		Dock: 4,
		Dungeon: 4,
		Forest: 3,
		'Forest-night': 3,
		Garden: 3,
		Graveyard: 3,
		Harbor: 4,
		Inn: 6,
		Library: 4,
		Mansion: 3,
		Market: 7,
		Marketplace: 7,
		Merchant: 7,
		Monastery: 3,
		Mountain: 3,
		PotionShop: 7,
		River: 3,
		Shop: 7,
		Shore: 4,
		SpellShop: 7,
		Tavern: 6,
		Town: 4,
		'Town-night': 5,
		Village: 4,
		Weaponsmith: 7,
		Woods: 3,
		'Woods-night': 3
	}

	async function fetchImg() {
		// Check if place is the same
		if ($game.gameData.placeAndTime?.place === $misc.currentImg) return

		const places = [...staticPlaces] as string[]
		const currentPlace = $game.gameData.placeAndTime?.place || ''

		// Find matching place name (places is array of strings)
		const matchedPlace =
			places.find((place) => currentPlace.toLowerCase().includes(place.toLowerCase())) || places[0]

		// Get the number of images available for this location (default to 3 if unknown)
		const imageCount = locationImageCounts[matchedPlace] || 3

		// Pick a random image number based on available count
		const randomImgNum = Math.floor(Math.random() * imageCount) + 1
		const imgPath = `${matchedPlace}/${randomImgNum}.webp`

		try {
			const { data, error } = await supabase.storage.from('imgs').download(imgPath)

			if (error) {
				// Gracefully handle missing bucket or image - just warn, don't error
				console.warn('Image not available:', imgPath, error.message || error)
				return
			}

			const url = URL.createObjectURL(data)
			updateBackgroundImage(url)
			$misc.currentImg = currentPlace
		} catch (error) {
			console.warn('Could not load background image:', error)
		}
	}

	function updateBackgroundImage(url: string) {
		// Preload the new image before triggering the crossfade
		const img = new Image()
		img.onload = () => {
			if ($bgImage.img1active) {
				$bgImage.fetchedBg2 = url
				// Small delay to ensure the new image is rendered before fading
				setTimeout(() => {
					$bgImage.img2active = true
					$bgImage.img1active = false
				}, 50)
			} else {
				$bgImage.fetchedBg1 = url
				setTimeout(() => {
					$bgImage.img1active = true
					$bgImage.img2active = false
				}, 50)
			}
		}
		img.src = url
	}

	function mixBuyables(category: string) {
		let items
		switch (category) {
			case 'Weaponsmith':
			case 'Armorsmith':
			case 'Blacksmith':
				items = buyWeapons
				break
			case 'SpellShop':
			case 'Spell Shop':
			case 'Shop':
			case 'Marketplace':
				items = buySpells
				break
			case 'PotionShop':
			case 'Potion Shop':
			case 'Market':
			case 'Merchant':
				items = buyPotions
				break
			default:
				items = buyPotions
				break
		}

		// Shuffle and take first items
		const shuffled = [...items]
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1))
			;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
		}

		$game.gameData.shop = shuffled.slice(0, SHOP_CONFIG.ITEMS_PER_SHOP)
	}

	function handleEmittedAnswer(event: CustomEvent) {
		giveAnswer(event.detail.answer)
	}

	// handleMedievalGameStart również musi być async
	async function handleMedievalGameStart(event: CustomEvent) {
		await startMedievalGame(event.detail.answer)
	}
	async function startMedievalGame(answer: string) {
		// Reset game state
		$gameState.chatMessages = [];
		$game.gameData.lootBox = [];
		$game.gameData.placeAndTime = { place: '', time: '00:00' };
		$game.gameData.shop = [];
		$game.gameData.choices = [];
		$game.gameData.enemy = {};
		$game.gameData.event = { inCombat: false, shopMode: null, lootMode: false };
		$selectedItem = {};
		$character.gold = STARTING_VALUES.GOLD;
		
		// Save world prompt for future context
		$gameState.worldPrompt = answer;

		const heroClass = $game.gameData.heroClass;
		let stats = { hp: 100, maxHp: 100, mp: 50, maxMp: 50, strength: 10, agility: 10, intelligence: 10, defense: 5 };
		
		if (heroClass === 'mage') {
			$character.stats = [CHARACTER_CLASSES.MAGE.stats];
			$character.spells = [...medievalMageSpells];
			$character.inventory = [...medievalMageInventory];
			stats = { ...stats, ...CHARACTER_CLASSES.MAGE.stats, intelligence: 20, mp: 100, maxMp: 100 };
		} else if (heroClass === 'warrior') {
			$character.stats = [CHARACTER_CLASSES.WARRIOR.stats];
			$character.spells = [...medievalWarriorSpells];
			$character.inventory = [...medievalWarriorInventory];
			stats = { ...stats, ...CHARACTER_CLASSES.WARRIOR.stats, strength: 20, defense: 15 };
		}
		
		if (!$gameState.mapGenerated) {
			$gameState.generatingWorld = true;
			
			// Wygeneruj mapę proceduralnie (najpierw szara)
			$gameState.mapGrid = generateMap();
			console.log('✅ Base map generated');

			// Find starting location (City)
			const startLoc = findStartingLocation();
			$gameState.player = {
				gold: STARTING_VALUES.GOLD,
				x: startLoc.x,
				y: startLoc.y,
				stats: stats,
				inventory: Array(6).fill(null)
			};

			// 1. Najpierw pobierz motyw wizualny (kolory i nazwy typów)
			enhanceWorldTheme(answer).then(success => {
				if (success) {
					console.log('🎨 Visual theme applied!');
				}
			});
			
			// 2. Uruchom generowanie konkretnych regionów w tle
			generateAllRegionsWithAI()
				.then(() => {
					console.log('✨ All regions enhanced by AI!');
					$gameState.generatingWorld = false;
					$ui.successMsg = "World fully generated!";
					setTimeout(() => $ui.successMsg = "", 3000);
				})
				.catch(err => {
					console.error('Background generation failed:', err);
					$gameState.generatingWorld = false;
				});
			
			$gameState.mapGenerated = true;
		} else {
			const startLoc = findStartingLocation();
			$gameState.player.x = startLoc.x;
			$gameState.player.y = startLoc.y;
		}
		
		giveAnswer(answer);
	}

	// Reactive statements
	$: if (
		$game.gameData.placeAndTime?.place &&
		$game.gameData.placeAndTime.place !== $misc.currentImg
	) {
		fetchImg()
	}

</script>

<div class="game-interface-root">
	<BackgroundImgs />

	<div class="debug-overlay"></div>

	{#if $misc.maintenanceWindow}
		<div class="maintenance-overlay">
			<div class="glass-modal">
				<h2>SYSTEM MAINTENANCE</h2>
				<p>The interface is currently undergoing recalibration. Please stand by.</p>
			</div>
		</div>
	{:else}
		<div style="padding: 0 !important;" class="game-container">
			{#if !$misc.started}
				<GameStartWindow on:emittedAnswer={handleMedievalGameStart} />
			{:else}
				<div class="main-content-layer">
					<!-- Story Section -->
					<div
						class="story-section glass-module"
						in:scale={{ duration: 600, start: 0.95, delay: 100, easing: backOut }}
					>
						<div class="viewport">
							{#if $misc.loading}
								<div class="neural-loading">
									<div class="spinner"></div>
									<span>Generating Responses{$gameState.dotty}</span>
								</div>
							{:else if $game.gameData.story}
								<div class="story-text" transition:fade>
									<LetterByLetter text={$game.gameData.story} />
								</div>
							{/if}
						</div>
					</div>

					<!-- Choices Section -->
					<div class="choices-section">
						{#if $game.gameData.choices && $game.gameData.choices.length > 0}
							<div
								in:fly={{ y: 20, duration: 600, delay: 200, easing: cubicOut }}
								style="width: 100%;"
							>
								<Choices on:emittedAnswer={handleEmittedAnswer} />
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</div>

		<DescriptionWindow />
		<MessageWindows />
	{/if}

	<!-- World generation overlay - POZA game-container -->
	{#if $gameState.generatingWorld}
		<div class="quota-overlay" transition:fade>
			<div class="glass-modal loading-state">
				<div class="spinner"></div>
				<h2 style="margin-top: 1.5rem;">GENERATING WORLD</h2>
				<p>Syncing neural patterns and regional data. Please stand by.</p>
				<button class="dismiss-btn" on:click={() => $gameState.generatingWorld = false}>
					GOT IT
				</button>
			</div>
		</div>
	{/if}

	<!-- Error overlays - POZA game-container -->
	{#if $gameState.quotaExceeded || $gameState.highDemand || $gameState.requestTimeout}
		<div class="quota-overlay" transition:fade>
			<div class="glass-modal error-state">
				<div class="quota-icon">
					{$gameState.quotaExceeded ? '⚠️' : $gameState.requestTimeout ? '🤖' : '🚀'}
				</div>
				<h2>
					{$gameState.quotaExceeded ? 'QUOTA EXCEEDED' : $gameState.requestTimeout ? 'TIMEOUT' : 'HIGH TRAFFIC'}
				</h2>
				<p>
					{$gameState.quotaExceeded 
						? 'The neural network has reached its processing limit. Please stand by.' 
						: 'Connection to the central core is unstable. Retry sequence later.'}
				</p>
				<button class="dismiss-btn" on:click={() => { 
					$gameState.quotaExceeded = false; 
					$gameState.highDemand = false; 
					$gameState.requestTimeout = false; 
					$misc.loading = false; 
				}}>
					ACKNOWLEDGE
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	:root {
		--glass-bg: rgba(255, 255, 255, 0.03);
		--glass-border: rgba(255, 255, 255, 0.1);
		--accent-primary: #00f2ff;
		--accent-secondary: #7000ff;
		--text-main: #e0e0e0;
		--text-dim: rgba(224, 224, 224, 0.5);
	}

	.game-interface-root {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: #050508;
		font-family: 'Inter', system-ui, sans-serif;
	}

	.debug-overlay {
		position: fixed;
		top: 1rem;
		right: 1rem;
		z-index: 1000;
	}

	.game-container {
		margin-top: 1rem;
		flex: 1;
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: 1000px;
		margin: 0 auto;
		padding: 2rem;
		position: relative;
		z-index: 10;
	}

	.main-content-layer {
		padding-bottom: .3rem !important;
		width: 95% !important;
		padding-top: 3rem;
		margin-left: auto;
		margin-right: auto;
		display: flex;
		flex-direction: column;
		gap: 2rem;
		width: 100%;
		padding-bottom: 120px;
	}

	/* Glass Module Style */
	.glass-module {
		background: rgba(10, 10, 15, 0.4);
		backdrop-filter: blur(40px);
		-webkit-backdrop-filter: blur(40px);
		border: 1px solid var(--glass-border);
		border-radius: 24px;
		box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.story-section {
		margin-right: auto;
		margin-left: auto;
		min-width: 93%;
		max-width: 93%;
		min-height: 200px;
		max-height: 55vh;
	}

	.module-header {
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--glass-border);
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: rgba(255, 255, 255, 0.02);
	}

	.location-tag {
		font-size: 0.7rem;
		font-weight: 800;
		color: var(--accent-primary);
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.time-tag {
		font-size: 0.75rem;
		font-family: monospace;
		color: var(--text-dim);
	}

	.viewport {
		flex: 1;
		padding: 1.5rem;
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: var(--glass-border) transparent;
	}

	.story-text {
		font-size: 1.05rem;
		line-height: 1.7;
		color: var(--text-main);
	}

	/* Loading State */
	.neural-loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		min-height: 150px;
		gap: 1.5rem;
		color: var(--accent-primary);
		font-weight: 700;
		font-size: 0.8rem;
		letter-spacing: 0.15em;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 3px solid rgba(0, 242, 255, 0.1);
		border-top-color: var(--accent-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin { to { transform: rotate(360deg); } }

	/* Choices */
	.choices-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
	}

	/* Overlays & Modals */
	.maintenance-overlay,
	.quota-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.85);
		backdrop-filter: blur(10px);
		z-index: 2000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.glass-modal {
		background: rgba(20, 22, 35, 0.8);
		backdrop-filter: blur(30px);
		border: 1px solid var(--glass-border);
		border-radius: 32px;
		padding: 3rem;
		max-width: 450px;
		width: 100%;
		text-align: center;
		box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.glass-modal h2 {
		font-size: 1.5rem;
		font-weight: 800;
		color: white;
		margin-bottom: 1rem;
		letter-spacing: 0.05em;
	}

	.glass-modal p {
		color: var(--text-dim);
		line-height: 1.6;
		font-size: 0.95rem;
	}

	.dismiss-btn {
		margin-top: 2rem;
		background: var(--accent-primary);
		color: black;
		border: none;
		padding: 1rem 2rem;
		border-radius: 16px;
		font-weight: 800;
		cursor: pointer;
		width: 100%;
		transition: all 0.3s;
	}

	.dismiss-btn:hover {
		transform: scale(1.02);
		filter: brightness(1.1);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.game-container { padding: 1rem; }
		.main-content-layer { gap: 1.5rem; padding-bottom: 140px; }
		.story-section { min-height: 180px; }
		.module-header { padding: 0.8rem 1.2rem; }
		.viewport { padding: 1.2rem; }
		.story-text { font-size: 0.95rem; }
		.glass-modal { padding: 2rem; }
	}
</style>
