// src/lib/components/utils/MapGenerator.ts

export const MAP_SIZE = 20;

// ============================================
// SZKIELET REGIONÓW (wzorzec dla każdego typu)
// ============================================
const regionTemplates = {
	"001": {
		type: "city",
		name: "LLM Generate",
		description: "LLM Generate Max 3 sentences",
		buildings: {
			amount: 4,
			id1: "RND",
			id2: "RND",
			id3: "RND",
			id4: "RND"
		}
	},
	"002": {
		type: "plains",
		role: "main",
		name: "LLM",
		enemy: {
			isEnemy: true,
			id: "RND"
		},
		loot: { 
			isLoot: false,
			id: "RND"
		}
	},
	"003": {
		type: "water",
		role: "divider",
		name: "LLM Generate",
		enemy: {
			isEnemy: false,
			id: "RND"
		},
		loot: {
			isLoot: false,
			id: "RND"
		}
	},
	"004": {
		type: "desert",
		role: "secondMain",
		name: "LLM Generate",
		enemy: {
			isEnemy: false,
			id: "RND"
		},
		loot: {
			isLoot: false,
			id: "RND"
		}
	},
	"005": {
		type: "forest",
		role: "thirdMain",
		name: "LLM Generate",
		enemy: {
			isEnemy: false,
			id: "RND"
		},
		loot: {
			isLoot: false,
			id: "RND"
		}
	},
	"006": {
		type: "mountain",
		role: "Monolith",
		name: "LLM Generate",
		enemy: {
			isBoss: true,
			isEnemy: true,
			id: "RND"
		},
		loot: {
			isLoot: false,
			id: "RND"
		}
	}
}

// ============================================
// KOLORY DLA TYPÓW TERENU (Domyślne - zostaną nadpisane przez AI)
// ============================================
let regionColors: Record<string, string[]> = {
	"city": ["#cccccc", "#bbbbbb", "#aaaaaa", "#999999", "#888888"],
	"plains": ["#e0e0e0", "#d0d0d0", "#c0c0c0", "#b0b0b0", "#a0a0a0"],
	"water": ["#d1d1d1", "#c1c1c1", "#b1b1b1", "#a1a1a1", "#919191"],
	"desert": ["#dadada", "#cacaca", "#bababa", "#aaaaaa", "#9a9a9a"],
	"forest": ["#cdcdcd", "#bdbdbd", "#adadad", "#9d9d9d", "#8d8d8d"],
	"mountain": ["#d5d5d5", "#c5c5c5", "#b5b5b5", "#a5a5a5", "#959595"]
}

let regionNames: Record<string, string> = {
	"city": "City",
	"plains": "Plains",
	"water": "Water",
	"desert": "Desert",
	"forest": "Forest",
	"mountain": "Mountain"
}
export { regionNames };

// Funkcja generująca 5 odcieni z koloru bazowego
function generateShades(baseColor: string): string[] {
	// Prosta funkcja do zmiany jasności HEX
	const adjust = (color: string, percent: number) => {
		const num = parseInt(color.replace("#", ""), 16);
		const amt = Math.round(2.55 * percent);
		const R = (num >> 16) + amt;
		const G = (num >> 8 & 0x00FF) + amt;
		const B = (num & 0x0000FF) + amt;
		return "#" + (0x1000000 + (R < 255 ? R < 0 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 0 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 0 ? 0 : B : 255)).toString(16).slice(1);
	};

	return [
		adjust(baseColor, 10),  // 10% jaśniejszy
		adjust(baseColor, 5),   // 5% jaśniejszy
		baseColor,              // Bazowy (środek)
		adjust(baseColor, -5),  // 5% ciemniejszy
		adjust(baseColor, -10)  // 10% ciemniejszy
	];
}

// Funkcja do pobrania motywu świata od AI
export async function enhanceWorldTheme(worldDescription: string): Promise<boolean> {
	console.log('🎨 Enhancing world theme based on description:', worldDescription);
	
	const prompt = `
    Based on this world description: "${worldDescription}", create a visual theme and names for the regions.
    You must provide a base HEX color and a theme-appropriate name for each type:
    - CITY: (The main settlements)
    - MAIN_NEUTRAL: (The most common plains/open areas)
    - DIVIDER: (Water bodies like rivers or lakes)
    - SECOND_NEUTRAL: (Desert or dry areas)
    - THIRD_NEUTRAL: (Forests or overgrown areas)
    - FOURTH_NEUTRAL: (Mountains or high peaks)

    Respond with ONLY a JSON object in this format:
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

	try {
		const response = await fetch('/api/enhance-regions', { 
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ prompt, type: 'theme_enhancement' })
		});

		if (!response.ok) throw new Error('Theme enhancement failed');
		const data = await response.json();
		
		// Expected data.regionData (if using the generic endpoint) or data directly
		const theme = data.theme || data.regionData?.theme;
		if (!theme) {
			console.error('Invalid theme data received:', data);
			return false;
		}

		// Aktualizacja kolorów i nazw
		for (const [key, value] of Object.entries(theme) as [string, any][]) {
			if (regionColors[key]) {
				regionColors[key] = generateShades(value.color);
				regionNames[key] = value.name;
			}
		}

		console.log('✨ World theme updated successfully:', regionNames);
		
		// Aktualizuj mapGrid z nowymi kolorami i nazwami
		if (mapGrid.length > 0) {
			for (let y = 0; y < MAP_SIZE; y++) {
				for (let x = 0; x < MAP_SIZE; x++) {
					const tile = mapGrid[y][x];
					const type = tile.type; // city, plains, etc.
					const colors = regionColors[type];
					const seed = currentSeed || 1337;
					const colorIdx = Math.floor(Math.abs(Math.sin(x * 7 + y * 13 + seed) * 100) % colors.length);
					
					tile.color = colors[colorIdx];
					// We don't overwrite specific AI names, but we update the base type name if it's generic
					if (tile.name.includes('Reach') || tile.name.includes('Lake') || tile.name.includes('Woods')) {
						// Optional: keep specific names or refresh them. User said "ma zwrocic pare nazwe regiony i kolor"
					}
				}
			}
			updateGlobalWorldJSON();
		}
		
		return true;
	} catch (error) {
		console.error('❌ Theme enhancement failed:', error);
		return false;
	}
}

// ============================================
// GENERATOR PERLINA
// ============================================
const Perlin = {
	p: new Uint8Array(512),
	init(seed: number) {
		let s = seed;
		const random = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
		for (let i = 0; i < 256; i++) this.p[i] = i;
		for (let i = 255; i > 0; i--) {
			let j = Math.floor(random() * (i + 1));
			[this.p[i], this.p[j]] = [this.p[j], this.p[i]];
		}
		for (let i = 0; i < 256; i++) this.p[256 + i] = this.p[i];
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
		const A = this.p[X] + Y, AA = this.p[A], AB = this.p[A + 1];
		const B = this.p[X + 1] + Y, BA = this.p[B], BB = this.p[B + 1];
		return this.lerp(v, this.lerp(u, this.grad(this.p[AA], xf, yf), this.grad(this.p[BA], xf - 1, yf)),
			this.lerp(u, this.grad(this.p[AB], xf, yf - 1), this.grad(this.p[BB], xf - 1, yf - 1)));
	}
};

function prng(seed: number, index: number) {
	let val = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453;
	return val - Math.floor(val);
}

// ============================================
// ZMIENNE GLOBALNE
// ============================================
let mapGrid: any[] = [];
let currentSeed: number = 0;
let fullWorldData: any = null;
let generatedRegionsSet = new Set<string>();
let isGeneratingBatch = false;
let allRegionIds: string[] = [];
let currentBatchIndex = 0;
const BATCH_SIZE = 25;

// ============================================
// GENEROWANIE MAPY
// ============================================
export function generateMap(): any[] {
	if (currentSeed === 0) {
		currentSeed = Math.floor(Math.random() * 10000) + 1;
	}

	console.log('🗺️ GENERATING MAP with seed:', currentSeed);

	const seed = currentSeed;
	Perlin.init(seed);

	let raw = Array.from({ length: MAP_SIZE }, () => Array(MAP_SIZE).fill("002"));

	for (let y = 0; y < MAP_SIZE; y++) {
		for (let x = 0; x < MAP_SIZE; x++) {
			let nx = x / 7.0;
			let ny = y / 7.0;
			let elevation = (Perlin.noise(nx, ny) + 1) / 2;
			let dx = Math.abs(x - MAP_SIZE / 2) / (MAP_SIZE / 2);
			let dy = Math.abs(y - MAP_SIZE / 2) / (MAP_SIZE / 2);
			let dist = Math.sqrt(dx * dx + dy * dy);
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

	for (let pass = 0; pass < 3; pass++) {
		let temp = JSON.parse(JSON.stringify(raw));
		for (let y = 0; y < MAP_SIZE; y++) {
			for (let x = 0; x < MAP_SIZE; x++) {
				let neighbors = [];
				if (y > 0) neighbors.push(raw[y - 1][x]);
				if (y < MAP_SIZE - 1) neighbors.push(raw[y + 1][x]);
				if (x > 0) neighbors.push(raw[y][x - 1]);
				if (x < MAP_SIZE - 1) neighbors.push(raw[y][x + 1]);
				let counts: any = {};
				neighbors.forEach(n => counts[n] = (counts[n] || 0) + 1);
				let maxCount = 0;
				let dominant = raw[y][x];
				for (let type in counts) {
					if (counts[type] > maxCount) {
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
	for (let y = 0; y < MAP_SIZE; y++) {
		for (let x = 0; x < MAP_SIZE; x++) {
			if (raw[y][x] !== "003") landTiles.push({ x, y });
		}
	}
	landTiles.sort((a, b) => prng(seed, a.x * MAP_SIZE + a.y) - prng(seed, b.x * MAP_SIZE + b.y));

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

	const locationNames = [
		"Emerald Grove", "Shadowfen", "Ironpeak", "Silverstream", "Golden Plains",
		"Whispering Woods", "Crimson Valley", "Frostfall", "Sunstone Desert", "Thunder Ridge",
		"Moonlit Hollow", "Starfall Basin", "Dragon's Rest", "Frozen Tundra", "Scorched Lands",
		"Misty Marsh", "Crystal Caverns", "Thunderhorn Plateau", "Serpent's Pass", "Ashen Fields"
	];

	const fullWorldRegions: Record<string, any> = {};
	
	mapGrid = raw.map((row, y) => row.map((id, x) => {
		const regionIdKey = `${x.toString().padStart(2, '0')}${y.toString().padStart(2, '0')}`;
		const template = JSON.parse(JSON.stringify(regionTemplates[id as keyof typeof regionTemplates]));
		
		// Użyj dynamicznej nazwy typu
		const typeBaseName = regionNames[template.type] || template.type;
		const nameIdx = (x * 7 + y * 13 + seed) % locationNames.length;
		const regionName = `${locationNames[nameIdx]} ${typeBaseName}`;
		
		let description = "";
		if (template.type === "city") {
			description = `A bustling ${regionName}, known for its trade and culture.`;
		} else if (template.type === "water") {
			description = `The calm waters of ${regionName} reflect the sky above.`;
		} else if (template.type === "mountain") {
			description = `The towering peaks of ${regionName} scrape the clouds.`;
		} else if (template.type === "forest") {
			description = `Dense ancient trees cover the ${regionName}.`;
		} else if (template.type === "desert") {
			description = `Endless sands stretch across the ${regionName}.`;
		} else {
			description = `The rolling plains of ${regionName} stretch to the horizon.`;
		}
		
		// Użyj dynamicznych kolorów (odcieni)
		const colors = regionColors[template.type] || ["#888888"];
		const colorIdx = Math.floor(Math.abs(Math.sin(x * 7 + y * 13 + seed) * 100) % colors.length);
		
		const regionData = {
			...template,
			id: regionIdKey,
			x, y,
			name: template.name === "LLM Generate" ? regionName : template.name,
			description: template.description === "LLM Generate Max 3 sentences" ? description : template.description,
			color: colors[colorIdx]
		};
		
		fullWorldRegions[regionIdKey] = regionData;
		
		return {
			x, y,
			regionId: id,
			regionKey: regionIdKey,
			type: template.type,
			name: regionData.name,
			description: regionData.description,
			color: colors[colorIdx]
		};
	}));

	setFullWorldData({
		regions: fullWorldRegions,
		seed: currentSeed,
		worldName: `World_${currentSeed}`,
		generatedAt: new Date().toISOString(),
		mapSize: MAP_SIZE,
		mapGrid: mapGrid
	});

	console.log('🌍 FULL WORLD JSON:', JSON.stringify(fullWorldData, null, 2));
	console.log('📊 STATS:', {
		totalRegions: Object.keys(fullWorldRegions).length,
		cities: Object.values(fullWorldRegions).filter((r: any) => r.type === "city").length,
		mountains: Object.values(fullWorldRegions).filter((r: any) => r.type === "mountain").length,
		plains: Object.values(fullWorldRegions).filter((r: any) => r.type === "plains").length,
		water: Object.values(fullWorldRegions).filter((r: any) => r.type === "water").length,
		desert: Object.values(fullWorldRegions).filter((r: any) => r.type === "desert").length,
		forest: Object.values(fullWorldRegions).filter((r: any) => r.type === "forest").length
	});

	return mapGrid;
}

// ============================================
// PODSTAWOWE EKSPORTY
// ============================================
export function getMapGrid(): any[] {
	return mapGrid;
}

export function getFullWorldData(): any {
	return fullWorldData;
}

export function getCurrentSeed(): number {
	return currentSeed;
}

export function regenerateMap(): any[] {
	currentSeed = Math.floor(Math.random() * 10000) + 1;
	console.log('🗺️ REGENERATING MAP with new seed:', currentSeed);
	return generateMap();
}

export function setSeed(seed: number): void {
	currentSeed = seed;
}

// ============================================
// FUNKCJE DO ZARZĄDZANIA REGIONAMI
// ============================================

export function findStartingLocation(): { x: number, y: number, regionId: string } {
	const cities: { x: number, y: number, regionId: string, dist: number }[] = [];
	
	for (let y = 0; y < MAP_SIZE; y++) {
		for (let x = 0; x < MAP_SIZE; x++) {
			const tile = mapGrid[y]?.[x];
			if (tile && tile.regionId === "001") {
				const dist = Math.sqrt((x - MAP_SIZE/2) ** 2 + (y - MAP_SIZE/2) ** 2);
				const regionId = `${x.toString().padStart(2, '0')}${y.toString().padStart(2, '0')}`;
				cities.push({ x, y, regionId, dist });
			}
		}
	}
	
	cities.sort((a, b) => a.dist - b.dist);
	
	if (cities.length === 0) {
		const center = Math.floor(MAP_SIZE/2);
		return { x: center, y: center, regionId: `${center.toString().padStart(2, '0')}${center.toString().padStart(2, '0')}` };
	}
	
	const start = cities[0];
	console.log('📍 Starting location:', start);
	return start;
}

export function getRegionsInRadius(centerX: number, centerY: number, radius: number): string[] {
	const regionIds: string[] = [];
	const minX = Math.max(0, centerX - radius);
	const maxX = Math.min(MAP_SIZE - 1, centerX + radius);
	const minY = Math.max(0, centerY - radius);
	const maxY = Math.min(MAP_SIZE - 1, centerY + radius);
	
	for (let y = minY; y <= maxY; y++) {
		for (let x = minX; x <= maxX; x++) {
			const regionId = `${x.toString().padStart(2, '0')}${y.toString().padStart(2, '0')}`;
			regionIds.push(regionId);
		}
	}
	
	return regionIds;
}

// In MapGenerator.ts, replace the enhanceRegionsWithAI function:
	export async function enhanceRegionsWithAI(regionIds: string[]): Promise<Record<string, any>> {
		const startTime = performance.now();
		console.log('🤖 Enhancing regions with AI:', regionIds.length);
		
		if (!fullWorldData) {
			console.error('No world data generated yet');
			return {};
		}
		
		const regionsToEnhance: Record<string, any> = {};
		for (const id of regionIds) {
			if (fullWorldData.regions[id]) {
				regionsToEnhance[id] = {
					type: fullWorldData.regions[id].type,
					x: fullWorldData.regions[id].x,
					y: fullWorldData.regions[id].y
				};
			}
		}
		
		const promptForAI = JSON.stringify(regionsToEnhance, null, 2);
		
		try {
			const response = await fetch('/api/enhance-regions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					prompt: promptForAI, 
					type: 'region_enhancement'  // This is required by your endpoint
				})
			});
			
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(`AI enhancement failed: ${response.status} - ${errorData.error || 'Unknown error'}`);
			}
			
			const data = await response.json();
			const enhanced = data.regionData || {};
			
			const endTime = performance.now();
			console.log(`✅ Enhanced ${Object.keys(enhanced).length} regions in ${((endTime - startTime) / 1000).toFixed(2)}s`);
			
			return enhanced;
			
		} catch (error) {
			console.error('❌ Region enhancement failed:', error);
			return {};
		}
	}
// ============================================
// GENEROWANIE PEŁNEGO ŚWIATA Z DANYMI STATYCZNYMI
// ============================================

// Placeholdery dla danych statycznych (do wypełnienia później)
const staticDataTemplates = {
  buildings: {
    "001": { type: "forge", name: "LLM Anvil", upgradeSystem: { targetType: "physical", maxLevel: 10, costMultiplier: 1.5, successRate: [1.0, 0.9, 0.8, 0.5] } },
    "002": { type: "magicForge", name: "LLM", upgradeSystem: { targetType: "magical", maxLevel: 10, costMultiplier: 1.5, successRate: [1.0, 0.9, 0.8, 0.5] } },
    "003": { type: "alchemistLab", name: "LLM", effects: { amount: 4, id: "RND" } },
    "004": { type: "jewelryWorkshop", name: "LLM Gems", category: "jewelry", inventory: [{ amount: 4, items: { id1: "RND", id2: "RND", id3: "RND", id4: "RND" } }] },
    "005": { type: "tavern", name: "LLM Rest", sleepSystem: { cost: 10, recoveryRate: 1.0, buff: "wellRested", duration: 480 } },
    "006": { type: "library", name: "LLM Archives", training: { statTarget: "intelligence", gainAmount: 1, requiredTime: 3600, cost: 50 } },
    "007": { type: "townHall", name: "LLM Quest Building", questBoard: { amount: 4, id1: "RND", id2: "RND", id3: "RND", id4: "RND" } }
  },
  enemies: {
    "001": {
      name: "LLM NAME",
      description: "LLM DESCRIPTION",
      statistics: {
        magicArmor: "RND%", armorArmor: "RND%", magicPenetration: "RND%",
        armorPenetration: "RND%", magicDamage: "RND", physicalDamage: "RND",
        imagePath: "./images/enemies/exampleEnemy.png"
      },
      abilities: { "001": { name: "LLM NAME", description: "LLM DESCRIPTION", id: "001", type: "magic_damage", value: "RND" } }
    }
  },
  items: {},
  abilities: {},
  NPCs: {},
  quests: {}
};

// Funkcja do generowania pełnego świata z danymi statycznymi
export function buildFullWorldWithStaticData(): any {
  if (!fullWorldData) {
    console.warn('No world data generated yet');
    return null;
  }

  // Kopiujemy istniejące regiony
  const worldWithStatic = {
    regions: { ...fullWorldData.regions },
    addedStaticData: {
      buildings: {},
      enemies: {},
      items: {},
      abilities: {},
      NPCs: {},
      quests: {}
    },
    seed: fullWorldData.seed,
    worldName: fullWorldData.worldName,
    generatedAt: fullWorldData.generatedAt,
    mapSize: fullWorldData.mapSize,
    mapGrid: fullWorldData.mapGrid
  };

  // Dla miast generujemy budynki
  for (const [regionId, region] of Object.entries(worldWithStatic.regions) as [string, any][]) {
    if (region.type === 'city') {
      // Losujemy 4 unikalne budynki dla miasta
      const buildingKeys = Object.keys(staticDataTemplates.buildings);
      const shuffled = [...buildingKeys];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      const selectedBuildings = shuffled.slice(0, 4);
      
      // Tworzymy mapę budynków dla tego miasta
      region.buildings = {
        amount: 4,
        ids: selectedBuildings
      };
      
      // Dodajemy budynki do globalnej kolekcji
      for (const buildingId of selectedBuildings) {
        if (!worldWithStatic.addedStaticData.buildings[buildingId]) {
          worldWithStatic.addedStaticData.buildings[buildingId] = {
            ...staticDataTemplates.buildings[buildingId as keyof typeof staticDataTemplates.buildings],
            id: buildingId
          };
        }
      }
    }
    
    // Dla regionów z wrogami
    if (region.enemy?.isEnemy === true) {
      // Generujemy unikalnego wroga
      const enemyId = `${regionId}_enemy`;
      worldWithStatic.addedStaticData.enemies[enemyId] = {
        ...staticDataTemplates.enemies["001"],
        id: enemyId,
        name: `Guardian of ${region.name}`,
        description: `A fearsome creature that protects the ${region.name}.`
      };
      region.enemy.id = enemyId;
    }
  }

  console.log('🌍 FULL WORLD WITH STATIC DATA GENERATED');
  console.log(`📊 Buildings: ${Object.keys(worldWithStatic.addedStaticData.buildings).length}`);
  console.log(`📊 Enemies: ${Object.keys(worldWithStatic.addedStaticData.enemies).length}`);

  return worldWithStatic;
}

// Funkcja do zapisu świata do pliku JSON (tylko do debugowania)
export function saveWorldToJSON(): void {
  const fullWorld = buildFullWorldWithStaticData();
  if (!fullWorld) return;
  
  const jsonString = JSON.stringify(fullWorld, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `world_${fullWorld.seed}.json`;
  a.click();
  URL.revokeObjectURL(url);
  console.log('💾 World saved to file');
}

// Eksportuj dodatkowe funkcje
export function getFullWorldWithStaticData(): any {
  return buildFullWorldWithStaticData();
}
export function updateWorldWithEnhancedRegions(enhancedRegions: Record<string, any>) {
	let updatedCount = 0;
	
	for (const [id, data] of Object.entries(enhancedRegions)) {
		if (fullWorldData.regions[id]) {
			if (data.name) {
				fullWorldData.regions[id].name = data.name;
				updatedCount++;
			}
			if (data.description) fullWorldData.regions[id].description = data.description;
			
			const x = fullWorldData.regions[id].x;
			const y = fullWorldData.regions[id].y;
			if (mapGrid[y]?.[x]) {
				if (data.name) mapGrid[y][x].name = data.name;
				if (data.description) mapGrid[y][x].description = data.description;
			}
		}
	}
	
	console.log(`📦 Updated ${updatedCount} regions with AI names`);
	
	// Aktualizuj globalny JSON po każdej zmianie
	if (fullWorldData) {
		updateGlobalWorldJSON();
	}
}

export function markRegionAsGenerated(regionId: string) {
	generatedRegionsSet.add(regionId);
}

export function isRegionGenerated(regionId: string): boolean {
	return generatedRegionsSet.has(regionId);
}

export function getWorldProgress(): { total: number, generated: number, percentage: number } {
	if (!fullWorldData) return { total: 0, generated: 0, percentage: 0 };
	const total = Object.keys(fullWorldData.regions).length;
	return { total, generated: generatedRegionsSet.size, percentage: (generatedRegionsSet.size / total) * 100 };
}

export function initRegionBatch() {
	if (!fullWorldData) return;
	allRegionIds = Object.keys(fullWorldData.regions);
	currentBatchIndex = 0;
	console.log(`📦 Total regions to process: ${allRegionIds.length}, batches: ${Math.ceil(allRegionIds.length / BATCH_SIZE)}`);
}

export function getNextBatch(): string[] {
	if (currentBatchIndex >= allRegionIds.length) return [];
	const batch = allRegionIds.slice(currentBatchIndex, currentBatchIndex + BATCH_SIZE);
	currentBatchIndex += BATCH_SIZE;
	return batch;
}

export async function generateAllRegionsWithAI(): Promise<void> {
	if (isGeneratingBatch) {
		console.log('⏳ Batch generation already in progress');
		return;
	}
	
	isGeneratingBatch = true;
	const startTime = performance.now();
	
	console.log('🚀 Starting batch region generation...');
	
	const startLoc = findStartingLocation();
	const priorityRegions = getRegionsInRadius(startLoc.x, startLoc.y, 2);
	console.log('📍 Priority regions (player start):', priorityRegions.length);
	
	const priorityEnhanced = await enhanceRegionsWithAI(priorityRegions);
	updateWorldWithEnhancedRegions(priorityEnhanced);
	
	for (const id of priorityRegions) {
		markRegionAsGenerated(id);
	}
	
	initRegionBatch();
	allRegionIds = allRegionIds.filter(id => !priorityRegions.includes(id));
	currentBatchIndex = 0;
	
	let batchNumber = 1;
	let totalEnhanced = priorityRegions.length;
	
	while (true) {
		const batch = getNextBatch();
		if (batch.length === 0) break;
		
		console.log(`📦 Generating batch ${batchNumber} (${batch.length} regions)...`);
		
		const enhanced = await enhanceRegionsWithAI(batch);
		updateWorldWithEnhancedRegions(enhanced);
		
		for (const id of batch) {
			markRegionAsGenerated(id);
		}
		
		totalEnhanced += batch.length;
		batchNumber++;
		
		if (batch.length === BATCH_SIZE) {
			console.log('⏱️ Waiting 2 seconds before next batch...');
			await new Promise(resolve => setTimeout(resolve, 2000));
		}
	}
	
	const endTime = performance.now();
	const duration = ((endTime - startTime) / 1000).toFixed(2);
	
	console.log('🎉 ALL REGIONS GENERATED!');
	console.log(`📊 Total enhanced: ${totalEnhanced}/${allRegionIds.length + priorityRegions.length}`);
	console.log(`⏱️ Total time: ${duration} seconds`);
	
	isGeneratingBatch = false;
}
// ============================================
// GLOBALNA ZMIENNA DO LOGOWANIA CAŁEGO ŚWIATA
// ============================================

// To jest TWOJA GŁÓWNA ZMIENNA - pokazuje cały świat w formacie exampleWorld
let globalWorldJSON: any = null;

// Funkcja do aktualizacji globalnego JSONa
function updateGlobalWorldJSON() {
	if (!fullWorldData) return;
	
	// Budujemy pełny świat w formacie exampleWorld
	globalWorldJSON = {
		regions: fullWorldData.regions,
		addedStaticData: {
			buildings: {},
			enemies: {},
			items: {},
			abilities: {},
			NPCs: {},
			quests: {}
		},
		seed: fullWorldData.seed,
		worldName: fullWorldData.worldName,
		generatedAt: fullWorldData.generatedAt,
		mapSize: fullWorldData.mapSize
	};
	
	// Dodajemy statyczne dane jeśli istnieją
	if ((fullWorldData as any).addedStaticData) {
		globalWorldJSON.addedStaticData = (fullWorldData as any).addedStaticData;
	}
	
	// LOGUJEMY CAŁY JSON CO KAŻDĄ AKTUALIZACJĘ
	console.log('\n' + '='.repeat(80));
	console.log('🌍 COMPLETE WORLD JSON (GLOBAL VARIABLE) 🌍');
	console.log('='.repeat(80));
	console.log(JSON.stringify(globalWorldJSON, null, 2));
	console.log('='.repeat(80));
	console.log(`📊 Total regions: ${Object.keys(globalWorldJSON.regions).length}`);
	console.log(`🎲 Seed: ${globalWorldJSON.seed}`);
	console.log(`📅 Updated: ${new Date().toISOString()}`);
	console.log('='.repeat(80) + '\n');
}

// Eksportujemy funkcję do ręcznego sprawdzenia globalnego JSONa
export function getGlobalWorldJSON(): any {
	if (!globalWorldJSON) {
		console.log('⚠️ World not generated yet. Call updateGlobalWorldJSON() first.');
		return null;
	}
	console.log('🌍 Current world JSON:', globalWorldJSON);
	return globalWorldJSON;
}

// Automatycznie aktualizuj globalny JSON przy każdej zmianie świata
export function setFullWorldData(data: any) {
	fullWorldData = data;
	updateGlobalWorldJSON();
	
	// Dodaj globalną zmienną do window dla łatwego dostępu w konsoli
	if (typeof window !== 'undefined') {
		(window as any).WORLD_JSON = globalWorldJSON;
		(window as any).getWorldJSON = () => {
			console.log('🌍 WORLD_JSON:', (window as any).WORLD_JSON);
			return (window as any).WORLD_JSON;
		};
		console.log('💡 Tip: Type "WORLD_JSON" in console to see full world data');
		console.log('💡 Tip: Type "getWorldJSON()" to get world data');
	}
}

// Nadpisz funkcję updateWorldWithEnhancedRegions aby aktualizowała globalny JSON
if (typeof window !== 'undefined') {
	const originalUpdateWorldWithEnhancedRegions = updateWorldWithEnhancedRegions;
	(window as any).updateWorldWithEnhancedRegions = function(enhancedRegions: Record<string, any>) {
		originalUpdateWorldWithEnhancedRegions(enhancedRegions);
		updateGlobalWorldJSON();
	};
}
// ============================================
// AUTO-LOGOWANIE CO 5 SEKUND (OPCJONALNE)
// ============================================

let autoLogInterval: NodeJS.Timeout | null = null;

export function startAutoLogging(intervalMs: number = 5000) {
	if (autoLogInterval) clearInterval(autoLogInterval);
	
	autoLogInterval = setInterval(() => {
		if (globalWorldJSON) {
			console.log('\n' + '🔄'.repeat(40));
			console.log('📡 AUTO-LOG: COMPLETE WORLD STATE');
			console.log('🔄'.repeat(40));
			console.log(JSON.stringify(globalWorldJSON, null, 2));
			console.log('🔄'.repeat(40) + '\n');
		}
	}, intervalMs);
	
	console.log(`✅ Auto-logging started (every ${intervalMs/1000}s)`);
}

export function stopAutoLogging() {
	if (autoLogInterval) {
		clearInterval(autoLogInterval);
		autoLogInterval = null;
		console.log('🛑 Auto-logging stopped');
	}
}

// Automatycznie uruchom logowanie gdy świat jest gotowy
if (typeof window !== 'undefined') {
	(window as any).startWorldLogging = startAutoLogging;
	(window as any).stopWorldLogging = stopAutoLogging;
	(window as any).showWorld = () => {
		if (globalWorldJSON) {
			console.log(JSON.stringify(globalWorldJSON, null, 2));
		} else {
			console.log('World not ready yet');
		}
	};
}