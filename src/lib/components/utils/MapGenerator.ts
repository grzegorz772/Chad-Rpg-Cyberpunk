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
// KOLORY DLA TYPÓW TERENU (STONOWANE)
// ============================================
const regionColors: Record<string, string[]> = {
	"city": ["#9e7b5c", "#ad8b68", "#bc9b74", "#cbab80", "#dabb8c", "#e9cb98"],
	"plains": ["#8aad6e", "#9bbd7e", "#accd8e", "#bdde9e", "#ceeeae", "#dfffbe"],
	"water": ["#6d8faa", "#80a0b8", "#93b1c6", "#a6c2d4", "#b9d3e2", "#cce4f0"],
	"desert": ["#c6b28b", "#d2c09c", "#deceae", "#eadcc0", "#f6ead2", "#fff8e4"],
	"forest": ["#5f7a4b", "#708b5c", "#819c6d", "#92ad7e", "#a3be8f", "#b4cfa0"],
	"mountain": ["#8f8b87", "#a19d99", "#b3afab", "#c5c1bd", "#d7d3cf", "#e9e5e1"]
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
		const nameIdx = (x * 7 + y * 13 + seed) % locationNames.length;
		const typeName = template.type === "city" ? "City" : template.type === "mountain" ? "Peak" : template.type === "water" ? "Lake" : template.type === "forest" ? "Woods" : "Reach";
		const regionName = `${locationNames[nameIdx]} ${typeName}`;
		
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
		
		const colors = regionColors[template.type] || ["#888888"];
		const colorIdx = Math.floor(Math.abs(Math.sin(x * 7 + y * 13 + seed) * 100) % colors.length);
		
		const regionData = {
			...template,
			id: regionIdKey,
			x, y,
			name: template.name === "LLM" ? regionName : template.name,
			description: template.description === "LLM" ? description : template.description,
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

	fullWorldData = {
		regions: fullWorldRegions,
		seed: currentSeed,
		worldName: `World_${currentSeed}`,
		generatedAt: new Date().toISOString(),
		mapSize: MAP_SIZE,
		mapGrid: mapGrid
	};

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
	
	const promptForAI = `
You are a world generator for an RPG game. I have several regions that need creative names and descriptions.

For each region, generate:
- A creative name (2-3 words, fantasy style)
- A short atmospheric description (1-2 sentences that fit the region type)

Return JSON with regionId as key:
{
  "0101": {
    "name": "Silverwind City",
    "description": "A bustling metropolis built around a massive waterfall."
  }
}

Regions to enhance:
${JSON.stringify(regionsToEnhance, null, 2)}

Return ONLY the JSON.
`;
	
	try {
		const response = await fetch('/api/enhance-regions', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ prompt: promptForAI, type: 'region_enhancement' })
		});
		
		if (!response.ok) throw new Error(`AI enhancement failed: ${response.status}`);
		
		const data = await response.json();
		const enhanced = data.regionData || data;
		
		const endTime = performance.now();
		console.log(`✅ Regions enhanced in ${((endTime - startTime) / 1000).toFixed(2)}s`);
		
		return enhanced;
		
	} catch (error) {
		console.error('❌ Region enhancement failed:', error);
		return {};
	}
}

export function updateWorldWithEnhancedRegions(enhancedRegions: Record<string, any>) {
	for (const [id, data] of Object.entries(enhancedRegions)) {
		if (fullWorldData.regions[id]) {
			if (data.name) fullWorldData.regions[id].name = data.name;
			if (data.description) fullWorldData.regions[id].description = data.description;
			
			const x = fullWorldData.regions[id].x;
			const y = fullWorldData.regions[id].y;
			if (mapGrid[y]?.[x]) {
				if (data.name) mapGrid[y][x].name = data.name;
				if (data.description) mapGrid[y][x].description = data.description;
			}
		}
	}
	console.log('📦 World updated with enhanced regions');
		// ============================================
	// LOGUJ CAŁY ŚWIAT PO KAŻDEJ AKTUALIZACJI
	// ============================================
	console.log('\n🌍 ========== WORLD JSON (UPDATED) ==========');
	console.log(JSON.stringify(fullWorldData, null, 2));
	console.log('🌍 =========================================\n');
	
	// Dodatkowe statystyki
	const totalRegions = Object.keys(fullWorldData.regions).length;
	const enhancedCount = Object.values(fullWorldData.regions).filter((r: any) => 
		!r.name?.includes("LLM") && r.name !== "LLM" && r.name !== "LLM Generate"
	).length;
	
	console.log(`📊 Progress: ${enhancedCount}/${totalRegions} regions enhanced (${((enhancedCount/totalRegions)*100).toFixed(1)}%)`);
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