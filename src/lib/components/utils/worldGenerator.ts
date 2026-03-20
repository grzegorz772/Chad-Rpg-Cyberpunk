// src/lib/utils/mapGenerator.ts

export const MAP_SIZE = 20;

// ============================================
// SZKIELET ŚWIATA (dane do wypełnienia)
// ============================================
export const worldSkeleton = {
	"regions": {
		"001": {
			"type": "city",
			"name": "LLM",
			"description": "LLM"
		},
		"002": {
			"type": "plains",
			"role": "main",
			"name": "LLM",
			"enemy": { "isEnemy": true, "id": "RND" },
			"loot": { "isLoot": false, "id": "RND" }
		},
		"003": {
			"type": "water",
			"role": "divider",
			"name": "LLM",
			"enemy": { "isEnemy": false },
			"loot": { "isLoot": false }
		},
		"004": {
			"type": "desert",
			"role": "secondMain",
			"name": "LLM",
			"enemy": { "isEnemy": false, "id": "RND" },
			"loot": { "isLoot": false, "id": "RND" }
		},
		"005": {
			"type": "forest",
			"role": "thirdMain",
			"name": "LLM",
			"enemy": { "isEnemy": false, "id": "RND" },
			"loot": { "isLoot": false, "id": "RND" }
		},
		"006": {
			"type": "mountain",
			"role": "Monolith",
			"name": "LLM",
			"enemy": { "isBoss": true, "isEnemy": true, "id": "RND" },
			"loot": { "isLoot": false, "id": "RND" }
		}
	},
	"buildings": {
		"forge": {
			"type": "forge",
			"name": "LLM Anvil",
			"upgradeSystem": {
				"targetType": "physical",
				"maxLevel": 10,
				"costMultiplier": 1.5,
				"successRate": [1.0, 0.9, 0.8, 0.5]
			}
		},
		"magicForge": {
			"type": "magicForge",
			"name": "LLM",
			"upgradeSystem": {
				"targetType": "magical",
				"maxLevel": 10,
				"costMultiplier": 1.5,
				"successRate": [1.0, 0.9, 0.8, 0.5]
			}
		},
		"alchemistLab": {
			"type": "alchemistLab",
			"name": "LLM",
			"effects": { "amount": 4, "id": "RND" }
		},
		"jewelryWorkshop": {
			"type": "jewelryWorkshop",
			"name": "LLM Gems",
			"category": "jewelry",
			"inventory": [{ "amount": 4, "items": { "id1": "RND", "id2": "RND", "id3": "RND", "id4": "RND" } }]
		},
		"tavern": {
			"type": "tavern",
			"name": "LLM Rest",
			"sleepSystem": { "cost": 10, "recoveryRate": 1.0, "buff": "wellRested", "duration": 480 }
		},
		"library": {
			"type": "library",
			"name": "LLM Archives",
			"training": { "statTarget": "intelligence", "gainAmount": 1, "requiredTime": 3600, "cost": 50 }
		},
		"townHall": {
			"type": "townHall",
			"name": "LLM Quest Building",
			"questBoard": { "amount": 4, "id1": "RND", "id2": "RND", "id3": "RND", "id4": "RND" }
		}
	},
	"items": {
		"001": {
			"name": "LLM",
			"role": { "isPhysical": false, "isMagical": false },
			"slot": { "weapon": false, "secondhand": true, "chest": false, "finger": false, "legs": false, "head": false },
			"baseStats": {
				"strength": "none", "agility": "num", "intelligence": "none", "defense": "none",
				"physical_damage": "none", "magic_damage": "none", "magic_penetration": "none",
				"phisical_penetration": "none", "armor_armor": "none", "magic_armor": "none"
			},
			"description": "LLM"
		}
	},
	"abilities": {
		"001": {
			"name": "LLM",
			"description": "LLM",
			"type": "magic_damage RND",
			"value": "23"
		}
	},
	"entities": {
		"001": {
			"name": "LLM",
			"description": "LLM",
			"statistics": {
				"magicArmor": "RND", "armorArmor": "RND", "magicPenetration": "RND%",
				"armorPenetration": "RND%", "magic damage": "RND", "phisical damage": "RND",
				"imagePath": "./images/enemies/enemy.png"
			},
			"abilities": { "id": "RND" },
			"loot": { "id": "RND" }
		}
	},
	"NPCs": {
		"001": {
			"name": "LLM",
			"description": "LLM",
			"history": "LLM"
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
// GENERATOR PERLINA (istniejący kod)
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
// GENEROWANIE MAPY PIXELOWEJ I PEŁNEGO ŚWIATA
// ============================================
let mapGrid: any[] = [];
let currentSeed: number = 0;
let fullWorldData: any = null;

export function generateMap(): any[] {
	if (currentSeed === 0) {
		currentSeed = Math.floor(Math.random() * 10000) + 1;
	}

	console.log('🗺️ GENERATING MAP with seed:', currentSeed);

	const seed = currentSeed;
	Perlin.init(seed);

	let raw = Array.from({ length: MAP_SIZE }, () => Array(MAP_SIZE).fill("002"));

	// Generowanie wysokości i wilgotności
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

	// Wygładzanie
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

	// Znajdź ląd
	let landTiles = [];
	for (let y = 0; y < MAP_SIZE; y++) {
		for (let x = 0; x < MAP_SIZE; x++) {
			if (raw[y][x] !== "003") landTiles.push({ x, y });
		}
	}
	landTiles.sort((a, b) => prng(seed, a.x * MAP_SIZE + a.y) - prng(seed, b.x * MAP_SIZE + b.y));

	// Umieść miasta (region 001)
	const cities = [];
	let cityCandidates = landTiles.filter(t => raw[t.y][t.x] === "002" || raw[t.y][t.x] === "004");
	for (let pos of cityCandidates) {
		if (cities.length >= 4) break;
		if (cities.every(p => Math.hypot(p.x - pos.x, p.y - pos.y) > 6)) {
			cities.push(pos);
			raw[pos.y][pos.x] = "001";
		}
	}

	// Umieść monolity/góry (region 006)
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

	// ============================================
	// TWORZENIE PEŁNEGO JSON ŚWIATA
	// ============================================
	fullWorldData = {
		...JSON.parse(JSON.stringify(worldSkeleton)),
		seed: currentSeed,
		worldName: `World_${currentSeed}`,
		generatedAt: new Date().toISOString(),
		locations: []
	};

	// Tworzenie lokalizacji dla każdego pixelu
	const locationNames = [
		"Emerald Grove", "Shadowfen", "Ironpeak", "Silverstream", "Golden Plains",
		"Whispering Woods", "Crimson Valley", "Frostfall", "Sunstone Desert", "Thunder Ridge"
	];

	// Generuj dane dla każdego regionu
	mapGrid = raw.map((row, y) => row.map((id, x) => {
		const regionKey = id as keyof typeof worldSkeleton.regions;
		const regionTemplate = worldSkeleton.regions[regionKey];
		const regionType = regionTemplate.type;
		const colors = regionColors[regionType] || ["#888888"];
		const colorIdx = Math.floor(Math.abs(Math.sin(x * 7 + y * 13 + seed) * 100) % colors.length);
		
		// Generuj nazwę dla lokalizacji
		const nameIdx = (x * 7 + y * 13 + seed) % locationNames.length;
		const locationName = `${locationNames[nameIdx]} ${regionType === "city" ? "Settlement" : regionType === "mountain" ? "Peak" : regionType === "water" ? "Lake" : "Reach"}`;
		
		// Generuj budynki dla miast
		let buildings = [];
		if (id === "001") {
			const buildingTypes = ["forge", "tavern", "townHall", "library"];
			const numBuildings = Math.floor(Math.random() * 3) + 2; // 2-4 budynki
			for (let i = 0; i < numBuildings && i < buildingTypes.length; i++) {
				const buildingType = buildingTypes[Math.floor(Math.random() * buildingTypes.length)];
				const buildingTemplate = worldSkeleton.buildings[buildingType as keyof typeof worldSkeleton.buildings];
				if (buildingTemplate) {
					buildings.push({
						...JSON.parse(JSON.stringify(buildingTemplate)),
						id: `${x}_${y}_${buildingType}`,
						location: [x, y]
					});
				}
			}
		}
		
		// Generuj NPC dla miast i wiosek
		let npcs = [];
		if (id === "001" || (id === "002" && Math.random() > 0.7)) {
			const npcCount = Math.floor(Math.random() * 3) + 1;
			for (let i = 0; i < npcCount; i++) {
				npcs.push({
					...JSON.parse(JSON.stringify(worldSkeleton.NPCs["001"])),
					id: `npc_${x}_${y}_${i}`,
					name: `${locationNames[(x + y + i) % locationNames.length]} ${["the Wise", "the Brave", "the Cunning", "the Silent"][i % 4]}`,
					location: [x, y]
				});
			}
		}
		
		// Generuj wrogów dla niebezpiecznych obszarów
		let enemies = [];
		if (id === "006" || (id === "005" && Math.random() > 0.6)) {
			enemies.push({
				...JSON.parse(JSON.stringify(worldSkeleton.entities["001"])),
				id: `enemy_${x}_${y}`,
				name: `${regionType === "mountain" ? "Stone" : regionType === "forest" ? "Woodland" : "Shadow"} ${["Guardian", "Stalker", "Beast", "Spirit"][Math.floor(Math.random() * 4)]}`,
				location: [x, y]
			});
		}
		
		return {
			x, y,
			regionId: id,
			type: regionTemplate.type,
			name: locationName,
			description: `A ${regionTemplate.description === "LLM" ? `${regionTemplate.type} area` : regionTemplate.description} located at coordinates ${x}, ${y}.`,
			color: colors[colorIdx],
			buildings: buildings,
			npcs: npcs,
			enemies: enemies,
			explored: false,
			discovered: false
		};
	}));

	// Zbierz wszystkie NPC do głównego obiektu
	const allNPCs: Record<string, any> = {};
	mapGrid.forEach(row => {
		row.forEach(tile => {
			tile.npcs.forEach((npc: any, idx: number) => {
				allNPCs[`npc_${tile.x}_${tile.y}_${idx}`] = npc;
			});
		});
	});
	fullWorldData.NPCs = allNPCs;

	// Zbierz wszystkie budynki do głównego obiektu
	const allBuildings: Record<string, any> = {};
	mapGrid.forEach(row => {
		row.forEach(tile => {
			tile.buildings.forEach((building: any) => {
				allBuildings[building.id] = building;
			});
		});
	});
	fullWorldData.buildings = allBuildings;

	// Zbierz wszystkich wrogów do głównego obiektu
	const allEntities: Record<string, any> = {};
	mapGrid.forEach(row => {
		row.forEach(tile => {
			tile.enemies.forEach((enemy: any, idx: number) => {
				allEntities[enemy.id] = enemy;
			});
		});
	});
	fullWorldData.entities = allEntities;

	console.log('🌍 FULL WORLD JSON:', JSON.stringify(fullWorldData, null, 2));
	console.log('🗺️ PIXEL MAP GENERATED:', mapGrid.length, 'x', mapGrid[0]?.length);
	console.log('📊 STATS:', {
		locations: mapGrid.length * mapGrid[0]?.length,
		cities: mapGrid.flat().filter(t => t.regionId === "001").length,
		mountains: mapGrid.flat().filter(t => t.regionId === "006").length,
		buildings: Object.keys(allBuildings).length,
		npcs: Object.keys(allNPCs).length,
		enemies: Object.keys(allEntities).length
	});

	return mapGrid;
}

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