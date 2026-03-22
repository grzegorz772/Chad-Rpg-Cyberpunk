<script lang="ts">
	import { fade, scale, fly } from 'svelte/transition'
	import { backOut, cubicOut } from 'svelte/easing'

	import LetterByLetter from './LetterByLetter.svelte'
	import UiButtons from './UiButtons.svelte'
	import GameStartWindow from './GameStartWindow.svelte'
	import DescriptionWindow from './ItemDescWindow.svelte'
	import MessageWindows from './InGameWarnMsgs.svelte'
	import ActionBox from './ActionBox.svelte'
	import Choices from './Choices.svelte'
	import BackgroundImgs from './BackgroundImgs.svelte'

	import { game, character, selectedItem, misc, coolDowns, bgImage, ui } from '../../stores'
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
	generateAllRegionsWithAI
} from '$lib/components/utils/MapGenerator';

	// Import z pliku .ts (nie .svelte!)
	let mapGenerated = false;
	let mapGrid: any[] = [];
	let selectedTile: any = null;

	// Funkcje do obsługi canvas (muszą zostać)
	function renderMapCanvas() {
		const canvas = document.getElementById('gameMapCanvas') as HTMLCanvasElement;
		if (!canvas) {
			console.warn('Canvas element not found');
			return;
		}
		
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			console.warn('Could not get canvas context');
			return;
		}
		
		if (!mapGrid || !mapGrid.length) {
			console.warn('Map grid not ready');
			return;
		}
		
		canvas.width = MAP_SIZE * 10;
		canvas.height = MAP_SIZE * 10;
		canvas.style.width = `${MAP_SIZE * 10}px`;
		canvas.style.height = `${MAP_SIZE * 10}px`;
		
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		// Draw each tile
		for (let y = 0; y < mapGrid.length; y++) {
			const row = mapGrid[y];
			if (!row) continue;
			
			for (let x = 0; x < row.length; x++) {
				const tile = row[x];
				if (!tile) continue;
				
				ctx.fillStyle = tile.color || '#888888';
				ctx.fillRect(x * 10, y * 10, 10, 10);
				
				// Draw borders between different region types
				if (y > 0 && mapGrid[y-1] && mapGrid[y-1][x] && mapGrid[y-1][x].regionId !== tile.regionId) {
					ctx.fillStyle = "rgba(0,0,0,0.2)";
					ctx.fillRect(x * 10, y * 10, 10, 1);
				}
				if (x > 0 && mapGrid[y][x-1] && mapGrid[y][x-1].regionId !== tile.regionId) {
					ctx.fillStyle = "rgba(0,0,0,0.2)";
					ctx.fillRect(x * 10, y * 10, 1, 10);
				}
			}
		}
		
		// Draw selected tile highlight
		if (selectedTile && mapGrid[selectedTile.y] && mapGrid[selectedTile.y][selectedTile.x]) {
			ctx.strokeStyle = "#ffaa44";
			ctx.lineWidth = 2;
			ctx.strokeRect(selectedTile.x * 10 + 1, selectedTile.y * 10 + 1, 8, 8);
		}
		
		console.log('Map rendered successfully');
	}

	function handleMapClick(e: MouseEvent) {
		const canvas = document.getElementById('gameMapCanvas') as HTMLCanvasElement;
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		const scaleX = canvas.width / rect.width;
		const scaleY = canvas.height / rect.height;
		const mouseX = (e.clientX - rect.left) * scaleX;
		const mouseY = (e.clientY - rect.top) * scaleY;
		const x = Math.floor(mouseX / 10);
		const y = Math.floor(mouseY / 10);
		if (x < 0 || x >= MAP_SIZE || y < 0 || y >= MAP_SIZE) return;
		selectedTile = {x, y};
		renderMapCanvas();
		
		const tile = mapGrid[y][x];
		const infoDiv = document.getElementById('mapTileInfo');
		if (infoDiv) {
			infoDiv.style.display = 'block';
			infoDiv.innerHTML = `
				<strong>📍 ${tile.name}</strong><br>
				Type: ${tile.type}<br>
				${tile.description}<br>
				<small>[${x}, ${y}]</small>
			`;
		}
	}

	// W onMount:
// W Game.svelte, w sekcji onMount
onMount(() => {
	// Wygeneruj mapę
	mapGrid = generateMap();
	
	// Upewnij się, że canvas istnieje i ma odpowiedni ID
	const canvas = document.getElementById('gameMapCanvas') as HTMLCanvasElement;
	if (canvas) {
		console.log('Canvas found, rendering map...');
		canvas.addEventListener('click', handleMapClick);
		// Wywołaj renderowanie po krótkim opóźnieniu, aby upewnić się, że DOM jest gotowy
		setTimeout(() => {
			renderMapCanvas();
		}, 50);
	} else {
		console.error('Canvas with id "gameMapCanvas" not found!');
	}
	
	return () => {
		if (canvas) canvas.removeEventListener('click', handleMapClick);
	};
});
// Eksport dla +page.svelte
export function getMapGridFromGame() {
	return mapGrid;
}
	let answer: string = ''
	let chatMessages: any[] = []
	let enemyOnFrontend: boolean = false
	let dotty: string = '.'
	let quotaExceeded: boolean = false
	let highDemand: boolean = false
	let requestTimeout: boolean = false

	// Animation for loading dots
	onMount(() => {
		const interval = setInterval(() => {
			if (dotty === '...') {
				dotty = ''
			}
			dotty += '.'
		}, 400)

		return () => clearInterval(interval)
	})

	// Game logic functions
	async function handleSubmit() {
		$misc.loading = true
		chatMessages = [...chatMessages, { role: 'user', content: $misc.query }]

		const prompt = chatMessages.length > 0 ? $misc.query : getGamePrompt()
		console.log('Sending prompt:', prompt)

		const controller = new AbortController()
		const timeoutId = setTimeout(() => {
			if ($misc.loading) {
				requestTimeout = true
				$misc.loading = false
				controller.abort() // Actually stop the network request
			}
		}, 90000)

		try {
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ prompt }),
				signal: controller.signal // Link the abort signal
			})

			clearTimeout(timeoutId)
			requestTimeout = false

			// Check for quota exceeded error
			if (response.status === 429) {
				const errorData = await response.json()
				if (errorData.error === 'quota_exceeded') {
					quotaExceeded = true
					$misc.loading = false
					return
				}
			}

			// Check for high demand error
			if (response.status === 503) {
				const errorData = await response.json()
				if (errorData.error === 'high_demand') {
					highDemand = true
					requestTimeout = false
					$misc.loading = false
					return
				}
			}

			// Check for gateway timeout (Vercel/Prod)
			if (response.status === 504) {
				// If we already showed the 9s timeout modal, don't override it with the "High Traffic" one
				if (requestTimeout) return

				highDemand = true
				requestTimeout = false
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
				// Remove markdown code blocks
				let cleaned = text
					.replace(/```json\s*/g, '')
					.replace(/```\s*/g, '')
					.trim()

				// Find the first { and last matching }
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
				// If AI returns {gameData: {...}}, unwrap it; otherwise use as-is
				gameData = parsed.gameData || parsed
			} catch (error) {
				console.error(
					'JSON parse error, raw text:',
					responseData.candidates[0].content.parts[0].text
				)
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

			$misc.started = true
			$misc.place = $game.gameData.placeAndTime?.place || ''
			$misc.time = $game.gameData.placeAndTime?.time || '00:00'

			chatMessages = [...chatMessages, { role: 'assistant', content: gameData }]
		} catch (error: any) {
			if (error.name === 'AbortError' || requestTimeout) {
				console.log('Request was aborted or timed out at 9s mark')
				return // Keep the timeout modal visible and don't trigger handleError
			} else {
				console.error('Error in handleSubmit:', error)
				handleError(error)
			}
		} finally {
			// Do not reset $misc.loading here if it was a timeout,
			// because the timeout block already set it to false
			if (!requestTimeout) {
				$misc.loading = false
			}
		}
	}

	function getGamePrompt() {
		return `This is a role-playing game where you'll be the 1st person character and storyteller. You'll describe the world from a 3rd person perspective but when it's time for a conversation, interact with the player from a 1st person npc perspective. All these 1st person and 3rd person content will be in gameData.story! Shape the storyline based on players choices.

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

	function giveAnswer(choice: string) {
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
			answer = ''
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
		chatMessages = [];
		$game.gameData.lootBox = [];
		$game.gameData.placeAndTime = { place: '', time: '00:00' };
		$game.gameData.shop = [];
		$game.gameData.choices = [];
		$game.gameData.enemy = {};
		$game.gameData.event = { inCombat: false, shopMode: null, lootMode: false };
		$selectedItem = {};
		$character.gold = STARTING_VALUES.GOLD;

		const heroClass = $game.gameData.heroClass;
		if (heroClass === 'mage') {
			$character.stats = [CHARACTER_CLASSES.MAGE.stats];
			$character.spells = [...medievalMageSpells];
			$character.inventory = [...medievalMageInventory];
		} else if (heroClass === 'warrior') {
			$character.stats = [CHARACTER_CLASSES.WARRIOR.stats];
			$character.spells = [...medievalWarriorSpells];
			$character.inventory = [...medievalWarriorInventory];
		}
		
		if (!mapGenerated) {
			// Show loading message
			$ui.errorWarnMsg = "🌍 Generating world... (this may take a moment)";
			
			// Wygeneruj mapę proceduralnie
			mapGrid = generateMap();
			console.log('✅ Map generated with', mapGrid.length, 'rows');
			
			// Sprawdź czy canvas istnieje i wyrenderuj mapę
			setTimeout(() => {
				const canvas = document.getElementById('gameMapCanvas');
				if (canvas) {
					console.log('Canvas found, rendering map');
					renderMapCanvas();
				} else {
					console.warn('Canvas not found for initial render');
				}
			}, 100);
			
			// Uruchom generowanie regionów w tle (nie blokuje gry)
			generateAllRegionsWithAI()
				.then(() => {
					console.log('✨ All regions enhanced by AI!');
					// Odśwież mapę po zakończeniu
					setTimeout(() => {
						renderMapCanvas();
						$ui.errorWarnMsg = "";
						$ui.successMsg = "✨ World fully generated! ✨";
						setTimeout(() => $ui.successMsg = "", 3000);
					}, 100);
				})
				.catch(err => {
					console.error('Background generation failed:', err);
					$ui.errorWarnMsg = "⚠️ Some regions may have placeholder names";
					setTimeout(() => {
						if ($ui.errorWarnMsg === "⚠️ Some regions may have placeholder names") {
							$ui.errorWarnMsg = "";
						}
					}, 5000);
				});
			
			console.log('🌍 World ready (AI generating in background)!');
			mapGenerated = true;
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

	$: if (
		$game.gameData.event?.shopMode &&
		(!$game.gameData.shop || $game.gameData.shop.length !== SHOP_CONFIG.ITEMS_PER_SHOP)
	) {
		mixBuyables($game.gameData.event.shopMode)
	}
</script>

<div class="game-interface-root">
	<BackgroundImgs />

	<div class="debug-overlay">
		<Modal /> 
	</div>

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
						<div class="module-header">
							<span class="location-tag">{$misc.place || 'INITIALIZING...'}</span>
							<span class="time-tag">{$misc.time}</span>
						</div>
						
						<div class="viewport">
							{#if $misc.loading}
								<div class="neural-loading">
									<div class="spinner"></div>
									<span>SYNCING NEURAL FEED{dotty}</span>
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

	{#if quotaExceeded || highDemand || requestTimeout}
		<div class="quota-overlay" transition:fade>
			<div class="glass-modal error-state">
				<div class="quota-icon">{quotaExceeded ? '⚠️' : requestTimeout ? '🤖' : '🚀'}</div>
				<h2>{quotaExceeded ? 'QUOTA EXCEEDED' : requestTimeout ? 'TIMEOUT' : 'HIGH TRAFFIC'}</h2>
				<p>
					{quotaExceeded 
						? 'The neural network has reached its processing limit. Please stand by.' 
						: 'Connection to the central core is unstable. Retry sequence later.'}
				</p>
				<button class="dismiss-btn" on:click={() => { quotaExceeded = false; highDemand = false; requestTimeout = false; $misc.loading = false; }}>
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

	@media (max-width: 480px) {
		.main-content-layer { padding-bottom: 160px; }
		.glass-module { border-radius: 16px; }
	}

:root {
        /* Paleta Liquid Glass */
        --glass-bg: rgba(15, 15, 25, 0.6);
        --glass-border: rgba(255, 255, 255, 0.08);
        --accent-primary: #00f2ff;
        --accent-secondary: #7000ff;
        --accent-glow: rgba(0, 242, 255, 0.3);
        --text-main: #f8f9fa;
        --text-dim: rgba(248, 249, 250, 0.5);
        --surface-deep: #050508;
    }

    .game-interface-root {
        position: relative;
        width: 100%;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        background: var(--surface-deep);
        font-family: 'Plus Jakarta Sans', sans-serif;
        color: var(--text-main);
        overflow-x: hidden;
    }

    /* Dynamiczny efekt płynnego tła */
    .game-interface-root::before {
        content: "";
        position: fixed;
        top: -50%; left: -50%; width: 200%; height: 200%;
        background: radial-gradient(circle at center, var(--accent-secondary) 0%, transparent 25%),
                    radial-gradient(circle at 20% 30%, #1a1a2e 0%, transparent 40%),
                    radial-gradient(circle at 80% 70%, #0a0a15 0%, transparent 40%);
        opacity: 0.15;
        filter: blur(80px);
        animation: liquid-drift 20s infinite alternate;
        z-index: 1;
    }

    @keyframes liquid-drift {
        from { transform: rotate(0deg) scale(1); }
        to { transform: rotate(5deg) scale(1.1); }
    }

    .game-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 1100px;
        margin: 0 auto;
        padding: 2.5rem 1.5rem;
        position: relative;
        z-index: 10;
    }

    .main-content-layer {
        display: flex;
        flex-direction: column;
        gap: 2.5rem;
        width: 100%;
    }

    /* Zaawansowany efekt szklanego panelu */
    .glass-module {
        background: var(--glass-bg);
        backdrop-filter: blur(25px) saturate(180%);
        -webkit-backdrop-filter: blur(25px) saturate(180%);
        border: 1px solid var(--glass-border);
        border-radius: 32px;
        box-shadow: 
            0 10px 30px rgba(0, 0, 0, 0.4),
            inset 0 0 20px rgba(255, 255, 255, 0.02);
        transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), border-color 0.3s;
    }

    .glass-module:hover {
        border-color: rgba(255, 255, 255, 0.15);
    }

    .story-section {
        min-height: 280px;
        position: relative;
    }

    .module-header {
        padding: 1.25rem 2rem;
        border-bottom: 1px solid var(--glass-border);
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(255, 255, 255, 0.03);
    }

    .location-tag {
        font-size: 0.75rem;
        font-weight: 800;
        color: var(--accent-primary);
        letter-spacing: 0.2em;
        text-transform: uppercase;
        text-shadow: 0 0 15px var(--accent-glow);
    }

    .time-tag {
        font-size: 0.8rem;
        font-family: 'JetBrains Mono', monospace;
        color: var(--text-dim);
        background: rgba(0, 0, 0, 0.3);
        padding: 0.3rem 0.8rem;
        border-radius: 20px;
    }

    .viewport {
        padding: 2rem;
        line-height: 1.8;
    }

    .story-text {
        font-size: 1.1rem;
        color: var(--text-main);
        letter-spacing: -0.01em;
    }

    /* Przycisk Acknowledge i inne interakcje */
    .dismiss-btn {
        background: linear-gradient(135deg, var(--accent-primary), #00c2ff);
        color: #000;
        border-radius: 20px;
        padding: 1.2rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        box-shadow: 0 8px 20px var(--accent-glow);
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .dismiss-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 25px var(--accent-glow);
        filter: brightness(1.1);
    }

    /* Styl paska przewijania (Scrollbar) */
    .viewport::-webkit-scrollbar { width: 6px; }
    .viewport::-webkit-scrollbar-track { background: transparent; }
    .viewport::-webkit-scrollbar-thumb {
        background: var(--glass-border);
        border-radius: 10px;
    }

    /* Mobile Adaptability */
    @media (max-width: 768px) {
        .game-container { padding: 1.5rem 1rem; }
        .glass-module { border-radius: 24px; }
        .story-text { font-size: 1rem; }
    }

</style>
