<script lang="ts">
	// Eksportuj funkcje i dane mapy dla +page.svelte
	export function getMapGrid() {
		return mapGrid;
	}

	export function getCurrentSeed() {
		return currentSeed;
	}
	export let mapData = {
		mapGrid: [],
		currentSeed: 0,
		generateMap: () => {},
		regenerateMap: () => {},
		getMapGrid: () => mapGrid,
		getCurrentSeed: () => currentSeed
	};
	import { fade, scale } from 'svelte/transition'
	import { backOut } from 'svelte/easing'

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

	// ===== GENERATOR MAPY =====
	const MAP_SIZE = 20;
	let mapGenerated = false;
	const staticNames = [
		{n: "Vaeloria", d: "Zapomniane miasto w chmurach"},
		{n: "Kranz", d: "Posterunek na skraju świata"},
		{n: "Onyx Ridge", d: "Czarne skały pełne echa"},
		{n: "Greenfell", d: "Wiecznie zielone doliny"},
		{n: "Ironhold", d: "Twierdza wykuta w granicie"},
		{n: "Silvershadow", d: "Lustrzane tafle jezior"},
		{n: "Dustmourn", d: "Piaszczyste pustkowia"},
		{n: "Everbloom", d: "Oaza niegasnących kwiatów"},
		{n: "Stormreach", d: "Wzgórza targane wiatrem"},
		{n: "Nightshade", d: "Mroczny, gęsty las"},
		{n: "Highfall", d: "Kaskady spadającej wody"},
		{n: "Cinder Peak", d: "Wygasły wulkaniczny stożek"},
		{n: "Mistwatch", d: "Wieża we mgle"},
		{n: "Solitude", d: "Ciche miejsce odosobnienia"},
		{n: "Wraithwood", d: "Szept starej puszczy"},
		{n: "Goldleaf", d: "Jesienne gaje klonowe"},
		{n: "Obsidian", d: "Gładka, ciemna otchłań"},
		{n: "Frostpeak", d: "Zmarznięta iglica świata"},
		{n: "Dawnstar", d: "Pierwszy blask poranka"},
		{n: "Ravenloft", d: "Gniazdo czarnych kruków"}
	];

const regionSchema = {
	"001": { 
		type: "city", 
		baseColor: "#b82121",
		name: "City",
		getColor: (x: number, y: number, seed: number) => {
			const variation = Math.floor(Math.abs(Math.sin(x * 7 + y * 13 + seed) * 100) % 11) - 5;
			const factor = 1 + (variation * 0.05);
			const base = regionSchema["001"].baseColor;
			const r = Math.min(255, Math.max(0, Math.floor(parseInt(base.slice(1,3), 16) * factor)));
			const g = Math.min(255, Math.max(0, Math.floor(parseInt(base.slice(3,5), 16) * factor)));
			const b = Math.min(255, Math.max(0, Math.floor(parseInt(base.slice(5,7), 16) * factor)));
			return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
		}
	},
	"002": { 
		type: "plains", 
		baseColor: "#b3f23a",
		name: "Plains",
		getColor: (x: number, y: number, seed: number) => {
			const variation = Math.floor(Math.abs(Math.sin(x * 5 + y * 11 + seed * 1.3) * 100) % 11) - 5;
			const factor = 1 + (variation * 0.05);
			const base = regionSchema["002"].baseColor;
			const r = Math.min(255, Math.max(0, Math.floor(parseInt(base.slice(1,3), 16) * factor)));
			const g = Math.min(255, Math.max(0, Math.floor(parseInt(base.slice(3,5), 16) * factor)));
			const b = Math.min(255, Math.max(0, Math.floor(parseInt(base.slice(5,7), 16) * factor)));
			return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
		}
	},
	"003": { 
		type: "water", 
		baseColor: "#0d5da8",
		name: "Water",
		getColor: (x: number, y: number, seed: number) => {
			const variation = Math.floor(Math.abs(Math.sin(x * 3 + y * 9 + seed * 1.7) * 100) % 11) - 5;
			const factor = 1 + (variation * 0.05);
			const base = regionSchema["003"].baseColor;
			const r = Math.min(255, Math.max(0, Math.floor(parseInt(base.slice(1,3), 16) * factor)));
			const g = Math.min(255, Math.max(0, Math.floor(parseInt(base.slice(3,5), 16) * factor)));
			const b = Math.min(255, Math.max(0, Math.floor(parseInt(base.slice(5,7), 16) * factor)));
			return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
		}
	},
	"004": { 
		type: "desert", 
		baseColor: "#e8b043",
		name: "Desert",
		getColor: (x: number, y: number, seed: number) => {
			const variation = Math.floor(Math.abs(Math.sin(x * 11 + y * 5 + seed * 2.1) * 100) % 11) - 5;
			const factor = 1 + (variation * 0.05);
			const base = regionSchema["004"].baseColor;
			const r = Math.min(255, Math.max(0, Math.floor(parseInt(base.slice(1,3), 16) * factor)));
			const g = Math.min(255, Math.max(0, Math.floor(parseInt(base.slice(3,5), 16) * factor)));
			const b = Math.min(255, Math.max(0, Math.floor(parseInt(base.slice(5,7), 16) * factor)));
			return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
		}
	},
	"005": { 
		type: "forest", 
		baseColor: "#427021",
		name: "Forest",
		getColor: (x: number, y: number, seed: number) => {
			const variation = Math.floor(Math.abs(Math.sin(x * 8 + y * 6 + seed * 2.5) * 100) % 11) - 5;
			const factor = 1 + (variation * 0.05);
			const base = regionSchema["005"].baseColor;
			const r = Math.min(255, Math.max(0, Math.floor(parseInt(base.slice(1,3), 16) * factor)));
			const g = Math.min(255, Math.max(0, Math.floor(parseInt(base.slice(3,5), 16) * factor)));
			const b = Math.min(255, Math.max(0, Math.floor(parseInt(base.slice(5,7), 16) * factor)));
			return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
		}
	},
	"006": { 
		type: "mountain", 
		baseColor: "#524e4b",
		name: "Mountain",
		getColor: (x: number, y: number, seed: number) => {
			const variation = Math.floor(Math.abs(Math.sin(x * 9 + y * 7 + seed * 1.9) * 100) % 11) - 5;
			const factor = 1 + (variation * 0.05);
			const base = regionSchema["006"].baseColor;
			const r = Math.min(255, Math.max(0, Math.floor(parseInt(base.slice(1,3), 16) * factor)));
			const g = Math.min(255, Math.max(0, Math.floor(parseInt(base.slice(3,5), 16) * factor)));
			const b = Math.min(255, Math.max(0, Math.floor(parseInt(base.slice(5,7), 16) * factor)));
			return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
		}
	}
};

	const Perlin = {
		p: new Uint8Array(512),
		init(seed: number) {
			let s = seed;
			const random = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
			for(let i=0; i<256; i++) this.p[i] = i;
			for(let i=255; i>0; i--) {
				let j = Math.floor(random() * (i + 1));
				[this.p[i], this.p[j]] = [this.p[j], this.p[i]];
			}
			for(let i=0; i<256; i++) this.p[256+i] = this.p[i];
		},
		fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); },
		lerp(t: number, a: number, b: number) { return a + t * (b - a); },
		grad(hash: number, x: number, y: number) {
			const h = hash & 15;
			const u = h < 8 ? x : y;
			const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
			return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
		},
		noise(x: number, y: number) {
			const X = Math.floor(x) & 255;
			const Y = Math.floor(y) & 255;
			const xf = x - Math.floor(x);
			const yf = y - Math.floor(y);
			const u = this.fade(xf);
			const v = this.fade(yf);
			const A = this.p[X]+Y, AA = this.p[A], AB = this.p[A+1];
			const B = this.p[X+1]+Y, BA = this.p[B], BB = this.p[B+1];
			return this.lerp(v, this.lerp(u, this.grad(this.p[AA], xf, yf), this.grad(this.p[BA], xf-1, yf)),
							this.lerp(u, this.grad(this.p[AB], xf, yf-1), this.grad(this.p[BB], xf-1, yf-1)));
		}
	};

	function prng(seed: number, index: number) {
		let val = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453;
		return val - Math.floor(val);
	}

	let mapGrid: any[] = [];
	let selectedTile: any = null;
	let currentSeed: number = 0;

	function generateMap() {
		// Losowe ziarno przy pierwszym wywołaniu
		if (currentSeed === 0) {
			currentSeed = Math.floor(Math.random() * 10000) + 1;
		}
		
		console.log('🗺️ GENERATING MAP with seed:', currentSeed);
		
		const seed = currentSeed;
		Perlin.init(seed);
		
		let raw = Array.from({length: MAP_SIZE}, () => Array(MAP_SIZE).fill("002"));
		
		for(let y=0; y<MAP_SIZE; y++) {
			for(let x=0; x<MAP_SIZE; x++) {
				let nx = x / 7.0;
				let ny = y / 7.0;
				let elevation = (Perlin.noise(nx, ny) + 1) / 2;
				let dx = Math.abs(x - MAP_SIZE/2) / (MAP_SIZE/2);
				let dy = Math.abs(y - MAP_SIZE/2) / (MAP_SIZE/2);
				let dist = Math.sqrt(dx*dx + dy*dy);
				elevation -= (dist * 0.22); 
				
				if (elevation < 0.28) { 
					raw[y][x] = "003"; 
				} else {
					let moisture = (Perlin.noise(nx + 20, ny + 20) + 1) / 2;
					if (moisture < 0.35) {
						raw[y][x] = "004"; 
					} else if (moisture > 0.65) {
						raw[y][x] = "005"; 
					} else {
						raw[y][x] = "002"; 
					}
				}
			}
		}

		for(let pass=0; pass<3; pass++) {
			let temp = JSON.parse(JSON.stringify(raw));
			for(let y=0; y<MAP_SIZE; y++) {
				for(let x=0; x<MAP_SIZE; x++) {
					let neighbors = [];
					if(y>0) neighbors.push(raw[y-1][x]);
					if(y<MAP_SIZE-1) neighbors.push(raw[y+1][x]);
					if(x>0) neighbors.push(raw[y][x-1]);
					if(x<MAP_SIZE-1) neighbors.push(raw[y][x+1]);
					let counts: any = {};
					neighbors.forEach(n => counts[n] = (counts[n] || 0) + 1);
					let maxCount = 0;
					let dominant = raw[y][x];
					for(let type in counts) {
						if(counts[type] > maxCount) {
							maxCount = counts[type];
							dominant = type;
						}
					}
					if (maxCount >= 3) temp[y][x] = dominant;
				}
			}
			raw = temp;
		}

		let landTiles = [];
		for(let y=0; y<MAP_SIZE; y++) {
			for(let x=0; x<MAP_SIZE; x++) {
				if (raw[y][x] !== "003") landTiles.push({x, y});
			}
		}
		landTiles.sort((a,b) => prng(seed, a.x*MAP_SIZE+a.y) - prng(seed, b.x*MAP_SIZE+b.y));

		const cities = [];
		let cityCandidates = landTiles.filter(t => raw[t.y][t.x] === "002" || raw[t.y][t.x] === "004");
		for (let pos of cityCandidates) {
			if (cities.length >= 4) break;
			if (cities.every(p => Math.hypot(p.x - pos.x, p.y - pos.y) > 6)) {
				cities.push(pos);
				raw[pos.y][pos.x] = "001";
			}
		}

		const monos = [];
		for (let pos of landTiles) {
			if (monos.length >= 2) break;
			if (raw[pos.y][pos.x] === "001") continue; 
			
			const farFromCities = cities.every(p => Math.hypot(p.x - pos.x, p.y - pos.y) > 6);
			const farFromMonos = monos.every(p => Math.hypot(p.x - pos.x, p.y - pos.y) > 8);
			
			if (farFromCities && farFromMonos) {
				monos.push(pos);
				raw[pos.y][pos.x] = "006";
			}
		}

	mapGrid = raw.map((row, y) => row.map((id, x) => {
		const base = regionSchema[id as keyof typeof regionSchema];
		const nameIdx = (x * 7 + y * 13 + seed) % staticNames.length;
		const data = staticNames[nameIdx];
		
		// Użyj funkcji getColor do pobrania koloru na podstawie pozycji i ziarna
		const color = base.getColor(x, y, seed);
		
		return {
			x, y, regionId: id, type: base.type,
			name: id === "001" ? "City of " + data.n : (id === "006" ? "Mount " + data.n : data.n),
			description: data.d,
			color: color  // ← teraz kolor jest dynamiczny
		};
	}));
		
		// LOG MAPY W JSON
		console.log('🗺️ MAP JSON:', JSON.stringify(mapGrid, null, 2));
		console.log('🗺️ MAP SIZE:', mapGrid.length, 'x', mapGrid[0]?.length);
		console.log('🗺️ SEED USED:', currentSeed);
		
		selectedTile = null;
		renderMapCanvas();
	}

	function renderMapCanvas() {
		const canvas = document.getElementById('gameMapCanvas') as HTMLCanvasElement;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx || !mapGrid.length) return;
		
		canvas.width = MAP_SIZE * 10;
		canvas.height = MAP_SIZE * 10;
		canvas.style.width = `${MAP_SIZE * 10}px`;
		canvas.style.height = `${MAP_SIZE * 10}px`;
		
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		mapGrid.forEach((row, y) => {
			row.forEach((tile: any, x: number) => {
				ctx.fillStyle = tile.color;
				ctx.fillRect(x * 10, y * 10, 10, 10);
				
				// Dodaj delikatną krawędź między różnymi typami
				if (y > 0 && mapGrid[y-1][x].regionId !== tile.regionId) {
					ctx.fillStyle = "rgba(0,0,0,0.2)";
					ctx.fillRect(x * 10, y * 10, 10, 1);
				}
				if (x > 0 && mapGrid[y][x-1].regionId !== tile.regionId) {
					ctx.fillStyle = "rgba(0,0,0,0.2)";
					ctx.fillRect(x * 10, y * 10, 1, 10);
				}
			});
		});
		
		if (selectedTile) {
			ctx.strokeStyle = "#ffaa44";
			ctx.lineWidth = 2;
			ctx.strokeRect(selectedTile.x * 10 + 1, selectedTile.y * 10 + 1, 8, 8);
		}
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
				Type: ${regionSchema[tile.regionId as keyof typeof regionSchema]?.name || tile.type}<br>
				${tile.description}<br>
				<small>[${x}, ${y}]</small>
			`;
		}
	}

	function regenerateMap() {
		currentSeed = Math.floor(Math.random() * 10000) + 1;
		console.log('🗺️ REGENERATING MAP with new seed:', currentSeed);
		generateMap();
	}

	onMount(() => {
		generateMap();
		const canvas = document.getElementById('gameMapCanvas');
		if (canvas) {
			canvas.addEventListener('click', handleMapClick);
		}
		
		// Ustaw dane mapy dla eksportu
		mapData.mapGrid = mapGrid;
		mapData.currentSeed = currentSeed;
		mapData.generateMap = generateMap;
		mapData.regenerateMap = regenerateMap;
		mapData.getMapGrid = () => mapGrid;
		mapData.getCurrentSeed = () => currentSeed;
		
		return () => {
			if (canvas) canvas.removeEventListener('click', handleMapClick);
		};
	});


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

	function handleMedievalGameStart(event: CustomEvent) {
		startMedievalGame(event.detail.answer)
	}

	function startMedievalGame(answer: string) {
		// Reset game state
		chatMessages = []
		$game.gameData.lootBox = []
		$game.gameData.placeAndTime = { place: '', time: '00:00' }
		$game.gameData.shop = []
		$game.gameData.choices = []
		$game.gameData.enemy = {}
		$game.gameData.event = { inCombat: false, shopMode: null, lootMode: false }
		$selectedItem = {}
		$character.gold = STARTING_VALUES.GOLD

		const heroClass = $game.gameData.heroClass
		if (heroClass === 'mage') {
			$character.stats = [CHARACTER_CLASSES.MAGE.stats]
			$character.spells = [...medievalMageSpells]
			$character.inventory = [...medievalMageInventory]
		} else if (heroClass === 'warrior') {
			$character.stats = [CHARACTER_CLASSES.WARRIOR.stats]
			$character.spells = [...medievalWarriorSpells]
			$character.inventory = [...medievalWarriorInventory]
		}
		if (!mapGenerated) {
		generateMap();
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

<div>
	<BackgroundImgs />

<div class="debug-overlay">
        <Modal /> 
</div>
	{#if $misc.maintenanceWindow}
		<div class="maintenance-overlay">
			<div class="maintenance-content">
				<h2>Game Maintenance</h2>
				<p>The game is currently under maintenance. Please check back later.</p>
			</div>
		</div>
	{:else}
		<div class="game-container">
			{#if !$misc.started}
				<GameStartWindow on:emittedAnswer={handleMedievalGameStart} />
			{:else}
				<div class="game-content">
					<div
						class="story-section"
						in:scale={{ duration: 600, start: 0.9, delay: 100, easing: backOut }}
					>
						{#if $misc.loading}
							<div class="loading-message">
								<LetterByLetter text={dotty} />
							</div>
						{:else if $game.gameData.story}
							<div class="story-text" transition:fade>
								<LetterByLetter text={$game.gameData.story} />
							</div>
						{/if}
					</div>
					<div class="choices-section">
						{#if $game.gameData.choices && $game.gameData.choices.length > 0}
							<div
								in:scale={{ duration: 600, start: 0.9, delay: 100, easing: backOut }}
								out:scale={{ duration: 300, start: 0.95, easing: backOut }}
								style="width: 100%; height: 100%;"
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

	{#if quotaExceeded}
		<div class="quota-overlay" transition:fade>
			<div class="quota-content">
				<div class="quota-icon">⚠️</div>
				<h2>API Limit Reached</h2>
				<p>
					This game is for <strong>demonstration purposes only</strong> and uses a free API quota.
				</p>
				<p class="quota-detail">
					The AI chat service has temporarily reached its limit. Please try again later or check
					back tomorrow.
				</p>
				<p class="quota-sorry">Sorry for the inconvenience!</p>
				<button class="quota-dismiss" on:click={() => (quotaExceeded = false)}> Dismiss </button>
			</div>
		</div>
	{/if}

	{#if highDemand}
		<div class="quota-overlay" transition:fade>
			<div class="quota-content high-demand">
				<div class="quota-icon">🚀</div>
				<h2>High Traffic</h2>
				<p>
					The AI service is currently <strong>heavily overloaded</strong> or timed out.
				</p>
				<p class="quota-detail">
					Google Gemini is taking too long to respond, and the server had to stop waiting. Please
					try your action later again.
				</p>
				<p class="quota-sorry">Thank you for your patience!</p>
				<button class="quota-dismiss" on:click={() => (highDemand = false)}> Dismiss </button>
			</div>
		</div>
	{/if}

	{#if requestTimeout}
		<div class="quota-overlay" transition:fade>
			<div class="quota-content timeout">
				<div class="quota-icon">🤖</div>
				<h2>Request Cancelled</h2>
				<p>
					The Gemini API is <strong>currently full</strong> and couldn't respond in time.
				</p>
				<p class="quota-detail">
					To keep the game responsive, we've stopped the current request. Please try your action
					later again.
				</p>
				<p class="quota-sorry">Thank you for your patience!</p>
				<button
					class="quota-dismiss"
					on:click={() => {
						requestTimeout = false
						$misc.loading = false
					}}
				>
					Sadge, later then
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	/* ============================================
	DEBUG OVERLAY – mały przycisk, nie przeszkadza
	============================================ */
	.debug-overlay {
		position: fixed;
		top: 8px;
		right: 8px;
		z-index: 9999;
		pointer-events: auto;
	}

	/* ============================================
	GLOBAL
	============================================ */
	* {
		box-sizing: border-box;
	}

	/* ============================================
	GŁÓWNY KONTENER – bez tła, jednolity kolor
	============================================ */
	.game-container {
		min-height: 100vh;
		min-height: 100dvh;
		background: #0a0c12; /* ciemne, neutralne tło */
		display: flex;
		flex-direction: column;
		width: 100%;
		overflow-x: hidden;
		position: relative;
	}

	/* ============================================
	ZAWARTOŚĆ GRY
	============================================ */
	.game-content {
		display: flex;
		flex-direction: column;
		flex: 1;
		padding: 12px;
		padding-bottom: 200px; /* miejsce na boxy akcji */
		width: 100%;
		max-width: 800px;
		margin: 0 auto;
		gap: 12px;
	}

	/* ============================================
	SEKCJA OPOWIEŚCI – przewijana, bez licznika
	============================================ */
	.story-section {
		position: relative;
		overflow-y: auto;
		padding: 16px;
		border-radius: 16px;
		background: rgba(20, 22, 32, 0.85);
		backdrop-filter: blur(12px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		min-height: 160px;
		max-height: 35vh;
	}

	.story-text {
		line-height: 1.5;
		font-size: 14px;
		color: #eee;
		word-wrap: break-word;
		white-space: normal;
	}

	/* Ukrywamy kropki ładowania (licznik) – to ten "dotty" */
	.loading-message {
		display: none;
	}

	/* ============================================
	PRZYCISKI WYBORÓW – DUŻE I WYRAŹNE
	============================================ */
	.choices-section {
		display: flex;
		flex-direction: column;
		gap: 10px;
		width: 100%;
		margin: 4px 0;
	}

	.choices-section :global(.choice-btn),
	.choices-section :global(button) {
		width: 100%;
		padding: 14px 16px;
		background: rgba(30, 35, 50, 0.95);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 14px;
		color: #f0f0f0;
		font-size: 15px;
		font-weight: 500;
		text-align: left;
		cursor: pointer;
		transition: all 0.2s;
		backdrop-filter: blur(4px);
	}

	.choices-section :global(button:active) {
		background: rgba(70, 80, 110, 0.95);
		transform: scale(0.98);
	}

	/* ============================================
	PRZYCISKI UI (np. otwórz ekwipunek) – opcjonalnie
	============================================ */
	.ui-section {
		margin: 8px 0;
		width: 100%;
	}

	.ui-section :global(button) {
		padding: 10px 18px;
		background: rgba(40, 45, 60, 0.9);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 30px;
		color: white;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		margin-right: 8px;
		margin-bottom: 8px;
	}

	/* ============================================
	BOX Z MONETAMI – ŁADNY, PRZYJEMNY
	============================================ */
	/* Jeśli masz gdzieś wyświetlanie monet, np. w UiButtons, dodaj te style */
	.coins-display,
	[class*="gold"],
	[class*="coin"] {
		background: linear-gradient(135deg, #f5b042, #e08e1a);
		color: #2c1a0a;
		font-weight: bold;
		padding: 6px 12px;
		border-radius: 40px;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 14px;
		box-shadow: 0 2px 6px rgba(0,0,0,0.2);
	}

	/* ============================================
	ACTION BOXES (EKWIPUNEK, ZAKLĘCIA, LOOT) – WIDOCZNE NA TELEFONIE
	============================================ */
	.action-boxes {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: stretch;
		gap: 8px;
		padding: 10px 12px;
		background: rgba(0, 0, 0, 0.92);
		backdrop-filter: blur(16px);
		border-top: 1px solid rgba(255, 255, 255, 0.15);
		z-index: 200;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
	}

	/* Każdy box – Inventory, Spells, Loot */
	.action-boxes :global(.action-box) {
		flex: 1;
		min-width: 110px;
		background: rgba(25, 28, 38, 0.95);
		border-radius: 16px;
		padding: 10px 8px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		display: flex;
		flex-direction: column;
		max-height: 170px;
		overflow-y: auto;
	}

	.action-boxes :global(.action-box-title) {
		font-size: 13px;
		font-weight: bold;
		margin-bottom: 8px;
		color: #ddd;
		text-align: center;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.action-boxes :global(button) {
		width: 100%;
		padding: 8px 6px;
		margin: 3px 0;
		background: rgba(60, 65, 90, 0.9);
		border: none;
		border-radius: 10px;
		color: white;
		font-size: 11px;
		cursor: pointer;
		text-align: left;
		word-break: break-word;
		transition: 0.1s;
	}

	.action-boxes :global(button:active) {
		background: rgba(100, 110, 150, 0.9);
	}

	/* ============================================
	OVERLAY – BŁĘDY API (QUOTA)
	============================================ */
	.maintenance-overlay,
	.quota-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.95);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2000;
		padding: 20px;
	}

	.maintenance-content,
	.quota-content {
		background: rgba(20, 22, 35, 0.98);
		backdrop-filter: blur(16px);
		padding: 24px;
		border-radius: 28px;
		text-align: center;
		border: 1px solid rgba(255, 255, 255, 0.2);
		max-width: 90%;
		width: 320px;
	}

	.quota-icon {
		font-size: 2.5rem;
		margin-bottom: 16px;
	}

	.quota-content h2 {
		font-size: 1.3rem;
		margin-bottom: 12px;
		color: #ffaa44;
	}

	.quota-content p {
		font-size: 0.9rem;
		line-height: 1.5;
		color: #ddd;
	}

	.quota-dismiss {
		margin-top: 20px;
		padding: 10px 24px;
		background: linear-gradient(135deg, #5a67d8, #7f5af0);
		border: none;
		border-radius: 40px;
		color: white;
		font-weight: 600;
		cursor: pointer;
		width: 100%;
	}

	/* ============================================
	RESPONSYWNOSĆ – TABLET I WIĘKSZE
	============================================ */
	@media (min-width: 768px) {
		.game-content {
			padding: 20px;
			padding-bottom: 180px;
			gap: 20px;
		}

		.story-section {
			padding: 24px;
		}

		.story-text {
			font-size: 16px;
		}

		.choices-section :global(button) {
			padding: 16px 20px;
			font-size: 16px;
		}

		.action-boxes {
			padding: 12px 20px;
			gap: 12px;
		}

		.action-boxes :global(.action-box) {
			min-width: 150px;
			padding: 12px;
		}
	}

	@media (min-width: 1024px) {
		.action-boxes {
			max-width: 900px;
			left: 50%;
			right: auto;
			transform: translateX(-50%);
			border-radius: 20px 20px 0 0;
		}
	}

	/* ============================================
	TELEFONY (max-width: 480px)
	============================================ */
	@media (max-width: 480px) {
		.game-content {
			padding: 8px;
			padding-bottom: 180px;
		}

		.story-section {
			padding: 12px;
			min-height: 140px;
		}

		.story-text {
			font-size: 13px;
		}

		.choices-section :global(button) {
			padding: 12px 14px;
			font-size: 14px;
		}

		.action-boxes {
			padding: 8px 10px;
			gap: 6px;
		}

		.action-boxes :global(.action-box) {
			min-width: 100px;
			max-height: 150px;
		}

		.action-boxes :global(.action-box-title) {
			font-size: 11px;
		}

		.action-boxes :global(button) {
			font-size: 10px;
			padding: 6px 4px;
		}
	}

	/* ============================================
	POZIOME USTAWIENIE (LANDSCAPE)
	============================================ */
	@media (max-height: 600px) and (orientation: landscape) {
		.game-content {
			padding-bottom: 110px;
		}

		.story-section {
			max-height: 30vh;
			min-height: 100px;
		}

		.action-boxes {
			padding: 5px 8px;
		}

		.action-boxes :global(.action-box) {
			min-width: 90px;
			max-height: 100px;
		}
	}

	/* ============================================
	PRZEWIJANIE BOXÓW I SEKCJI
	============================================ */
	.story-section::-webkit-scrollbar,
	.action-boxes :global(.action-box)::-webkit-scrollbar {
		width: 3px;
		height: 3px;
	}

	.story-section::-webkit-scrollbar-track,
	.action-boxes :global(.action-box)::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.05);
	}

	.story-section::-webkit-scrollbar-thumb,
	.action-boxes :global(.action-box)::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.3);
		border-radius: 3px;
	}
/* ============================================
   MAPA ŚWIATA
   ============================================ */
.map-container {
	margin-top: 20px;
	padding: 12px;
	background: rgba(0, 0, 0, 0.6);
	border-radius: 12px;
	border: 1px solid rgba(255, 170, 68, 0.3);
}

.map-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 10px;
	padding-bottom: 5px;
	border-bottom: 1px solid rgba(255, 170, 68, 0.3);
}

.map-title {
	font-size: 12px;
	font-weight: bold;
	color: #ffaa44;
	letter-spacing: 1px;
	text-transform: uppercase;
}

.map-refresh-btn {
	background: transparent;
	border: 1px solid #ffaa44;
	color: #ffaa44;
	padding: 4px 8px;
	border-radius: 4px;
	cursor: pointer;
	font-size: 12px;
	transition: all 0.2s;
}

.map-refresh-btn:hover {
	background: #ffaa44;
	color: #000;
}

.map-tile-info {
	margin-top: 10px;
	padding: 8px;
	background: rgba(0, 0, 0, 0.7);
	border-radius: 8px;
	font-size: 11px;
	color: #ddd;
	border-left: 3px solid #ffaa44;
}
</style>