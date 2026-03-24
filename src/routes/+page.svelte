<script lang="ts">
	import Game from '$lib/components/Game.svelte'
	import { game, character, misc, ui, gameState } from '../stores'
	import { onMount } from 'svelte'
	import { fade, fly, scale } from 'svelte/transition'
	import { cubicOut, backOut } from 'svelte/easing'
	import { supabase } from '$lib/supabaseClient'
	import { regionNames, worldStore } from '$lib/components/utils/MapGenerator';
	
	let gameComponent: any;
	let miniMapGrid: any[] = [];
	let isPanelOpen = false;
	let mapOn = false;
	let inventoryOn = false;
	let selectedTile: any = null;
	let selectedBuilding: any = null;
	let expandedBuildingId: string | null = null;

	function toggleBuildingAccordion(id: string) {
		expandedBuildingId = expandedBuildingId === id ? null : id;
	}

	// Dynamic buildings based on player position
	$: playerX = $gameState.player?.x || 0;
	$: playerY = $gameState.player?.y || 0;
	$: currentRegionId = `${playerX.toString().padStart(2, '0')}${playerY.toString().padStart(2, '0')}`;
	$: currentRegion = $worldStore?.regions?.[currentRegionId];
	$: currentBuildings = (currentRegion?.type === 'city' && currentRegion.buildings?.ids)
		? currentRegion.buildings.ids.map((id: string) => $worldStore.addedStaticData.buildings[id])
		: [];

	function openBuildingPopup(building: any) {
		selectedBuilding = building;
	}

	function confirmUpgrade() {
		if (!$gameState.player || !selectedBuilding) return;
		const cost = 50; // Base cost for now
		if ($gameState.player.gold >= cost) {
			$gameState.player.gold -= cost;
			const { stat, value } = selectedBuilding.upgradeSystem;
			($gameState.player.stats as any)[stat] += value;
			$ui.toastMsg = `Upgraded ${stat} at ${selectedBuilding.name}!`;
			selectedBuilding = null;
			setTimeout(() => $ui.toastMsg = '', 3000);
		} else {
			$ui.errorWarnMsg = "Not enough gold!";
			setTimeout(() => $ui.errorWarnMsg = '', 3000);
		}
	}

	function movePlayer(dx: number, dy: number) {
		if (!$gameState.player) return;
		const newX = Math.max(0, Math.min(19, $gameState.player.x + dx));
		const newY = Math.max(0, Math.min(19, $gameState.player.y + dy));
		
		if (newX !== $gameState.player.x || newY !== $gameState.player.y) {
			$gameState.player.x = newX;
			$gameState.player.y = newY;
			
			const dir = dx > 0 ? "east" : dx < 0 ? "west" : dy > 0 ? "south" : "north";
			handleAnswer(`I'll move ${dir}.`);
		}
	}

	function toggleInventory() {
		inventoryOn = !inventoryOn;
		if (inventoryOn) mapOn = false;
	}

	function toggleBuildings() {
		mapOn = !mapOn;
		if (mapOn) inventoryOn = false;
	}

	// Audio logic
	let audioElement: any
	let audioClicked: boolean = false
	async function startSong() {
		if (!audioElement && !audioClicked) {
			audioClicked = true
			const { data: song, error } = await supabase.storage
				.from('audios/chad-rpg')
				.download('tavernLoopOne.mp3')

			if (song) {
				audioElement = new Audio(URL.createObjectURL(song))
				audioElement.loop = true
				audioElement.play()
			}
		} else if (audioElement) {
			audioElement.paused ? audioElement.play() : audioElement.pause()
		}
	}

	function handleAnswer(answer: string) {
		if (gameComponent && gameComponent.giveAnswer) {
			// CHECK FOR ENEMY ENCOUNTER
			const playerX = $gameState.player?.x || 0;
			const playerY = $gameState.player?.y || 0;
			const regionId = `${playerX.toString().padStart(2, '0')}${playerY.toString().padStart(2, '0')}`;
			const region = $worldStore?.regions?.[regionId];

			if (region?.enemy?.isEnemy) {
				const enemy = $worldStore.addedStaticData.enemies[region.enemy.id];
				console.log('⚔️ ENEMY ENCOUNTER:', enemy);
				$game.gameData.event.inCombat = true;
				$game.gameData.enemy = enemy;
				// You could call gameComponent.triggerCombat(enemy) here if it exists
			}

			gameComponent.giveAnswer(answer);
			mapOn = false;
		}
	}
	
	function drawMap(canvasId: string, grid: any[], showSelection = false) {
		const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
		if (!canvas || !grid.length) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		
		const size = grid.length;
		const cellSize = canvas.width / size;
		
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		for (let y = 0; y < size; y++) {
			for (let x = 0; x < size; x++) {
				const tile = grid[y]?.[x];
				if (tile) {
					ctx.fillStyle = tile.color;
					ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
					
					// TEST: Show Enemy Marker (Small Dark Red Dot)
					const regionId = `${x.toString().padStart(2, '0')}${y.toString().padStart(2, '0')}`;
					const region = $worldStore?.regions?.[regionId];
					if (region?.enemy?.isEnemy) {
						ctx.fillStyle = "rgba(139, 0, 0, 0.6)";
						ctx.beginPath();
						ctx.arc(x * cellSize + cellSize/2, y * cellSize + cellSize/2, cellSize/5, 0, Math.PI * 2);
						ctx.fill();
					}

					// Draw border between regions
					ctx.strokeStyle = "rgba(0,0,0,0.1)";
					ctx.lineWidth = 0.5;
					ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
				}
			}
		}

		// Show Player Position
		if ($gameState.player) {
			const px = $gameState.player.x;
			const py = $gameState.player.y;
			ctx.fillStyle = "#ff0000";
			ctx.beginPath();
			ctx.arc(px * cellSize + cellSize/2, py * cellSize + cellSize/2, cellSize/3, 0, Math.PI * 2);
			ctx.fill();
			
			// Pulse effect for player
			ctx.strokeStyle = "white";
			ctx.lineWidth = 1;
			ctx.stroke();
		}

		if (showSelection && selectedTile) {
			ctx.strokeStyle = "#00f2ff";
			ctx.lineWidth = 3;
			ctx.strokeRect(selectedTile.x * cellSize + 2, selectedTile.y * cellSize + 2, cellSize - 4, cellSize - 4);
			
			// Outer glow
			ctx.shadowBlur = 10;
			ctx.shadowColor = "#00f2ff";
			ctx.strokeRect(selectedTile.x * cellSize + 2, selectedTile.y * cellSize + 2, cellSize - 4, cellSize - 4);
			ctx.shadowBlur = 0;
		}
	}

	function openMapModal() {
		$misc.showMapModal = true;
		selectedTile = null;
		// Wait for DOM
		setTimeout(() => {
			drawMap('fullscreenMapCanvas', miniMapGrid, true);
		}, 100);
	}
	
	function handleFullscreenMapClick(e: MouseEvent) {
		const canvas = document.getElementById('fullscreenMapCanvas') as HTMLCanvasElement | null;
		if (!canvas || !miniMapGrid.length) return;
		const rect = canvas.getBoundingClientRect();
		const scaleX = canvas.width / rect.width;
		const scaleY = canvas.height / rect.height;
		const mouseX = (e.clientX - rect.left) * scaleX;
		const mouseY = (e.clientY - rect.top) * scaleY;
		const size = miniMapGrid.length;
		const x = Math.floor(mouseX / (canvas.width / size));
		const y = Math.floor(mouseY / (canvas.height / size));
		
		if (x >= 0 && x < size && y >= 0 && y < size) {
			selectedTile = { x, y };
			drawMap('fullscreenMapCanvas', miniMapGrid, true);
		}
	}
	
	function togglePanel() {
		isPanelOpen = !isPanelOpen;
		if (!isPanelOpen) mapOn = false;
	}
	
	onMount(() => {
		const interval = setInterval(() => {
			if (gameComponent && gameComponent.getMapGridFromGame && $misc.started) {
				const grid = gameComponent.getMapGridFromGame();
				if (grid && grid.length > 0) {
					miniMapGrid = grid;
					drawMap('miniMapCanvas', miniMapGrid);
					if ($misc.showMapModal) {
						drawMap('fullscreenMapCanvas', miniMapGrid, true);
					}
				}
			}
		}, 1000);
		
		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	<title>Alyssium</title>
</svelte:head>

<main class="game-layout">
	<div class="game-content">
		<Game bind:this={gameComponent} />
	</div>
	
	{#if $misc.started}
		<!-- CENTERED TOGGLE BUTTON -->
		<div class="bottom-controls-wrapper">
			<button class="center-toggle-btn" on:click={togglePanel} class:active={isPanelOpen}>
				<div class="btn-inner">
					<span class="icon">{isPanelOpen ? '✕' : 'MENU'}</span>
				</div>
			</button>
		</div>
		
		<!-- LIQUID GLASS SLIDE PANEL -->
		<div class="slide-panel" class:open={isPanelOpen}>
			<div class="panel-content glass-container">
				<!-- Buildings Menu -->
				{#if mapOn}
					<div class="places-to-go-wrapper" transition:fly={{ y: 20, duration: 300 }}>
						<div class="places-to-go glass-container">
							{#if currentBuildings.length > 0}
								{#each currentBuildings as building}
									<button disabled={$misc.loading || $game.gameData.event.inCombat} on:click={() => openBuildingPopup(building)}>
										<img src={`images/landscape-svgs/${building.type}.svg`} alt={building.type} 
											 on:error={(e) => e.currentTarget.src = 'images/landscape-svgs/custom.svg'} />
										<div class="bld-info">
											<span class="bld-name">{building.name}</span>
											<span class="bld-stat">{building.upgradeSystem.stat} +{building.upgradeSystem.value}</span>
										</div>
									</button>
								{/each}
							{:else}
								<div class="no-buildings">
									<p>WILDERNESS</p>
									<span>No structures in this territory</span>
								</div>
							{/if}
						</div>
					</div>
				{/if}

				<!-- Inventory Menu -->
				{#if inventoryOn}
					<div class="inventory-wrapper" transition:fly={{ y: 20, duration: 300 }}>
						<div class="inventory-grid glass-container inventory-opaque">
							{#each $gameState.player?.inventory || Array(6).fill(null) as item, i}
								<div class="inventory-slot" transition:scale={{delay: i * 50, duration: 300, easing: backOut}}>
									{#if item}
										<img src={item.image || 'images/item.svg'} alt={item.name} />
									{:else}
										<div class="empty-slot"></div>
									{/if}
									<div class="slot-bg"></div>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<div class="panel-layout">
					<!-- LEFT: BUILDINGS & MUSIC -->
					<div class="panel-section utils-section-left">
						<button class="action-btn glass-btn" on:click={toggleBuildings} class:active={mapOn}>
							<img src="images/map.svg" alt="bld" />
							<span>BUILDINGS</span>
						</button>
						<button class="action-btn glass-btn" on:click={startSong}>
							<img src="images/music.svg" alt="mus" />
							<span>MUSIC</span>
						</button>
					</div>

					<!-- LEFT-CENTER: STATS -->
					<div class="panel-section stats-section">
						<div class="stat-item gold">
							<img src="images/gold.svg" alt="gold" class="stat-icon" />
							<span class="stat-value">{$gameState.player?.gold || 0}</span>
						</div>
						<div class="stat-item time">
							<img src="images/time.svg" alt="time" class="stat-icon" />
							<span class="stat-value">{$game.gameData.placeAndTime?.time || '00:00'}</span>
						</div>
					</div>
					
					<!-- MIDDLE: EQUIPMENT -->
					<div class="panel-section actions-section">
						<div class="action-buttons">
							<button class="action-btn glass-btn main-action" on:click={toggleInventory} class:active={inventoryOn}>
								<img src="images/item.svg" alt="inv" />
								<span>EQUIPMENT</span>
							</button>
						</div>
					</div>
					
					<!-- RIGHT-CENTER: MINIMAP -->
					<div class="panel-section map-section">
						<div class="circular-minimap" on:click={openMapModal}>
							<canvas id="miniMapCanvas" width="120" height="120"></canvas>
							<div class="map-overlay-hint">MAP</div>
						</div>
					</div>

					<!-- RIGHT: BUG & INFO -->
					<div class="panel-section utils-section-right">
						<button class="action-btn glass-btn" on:click={() => $misc.bugWindow = !$misc.bugWindow}>
							<img src="images/bug.svg" alt="bug" />
							<span>BUG</span>
						</button>
						<button class="action-btn glass-btn" on:click={() => $misc.showInfoWindow = !$misc.showInfoWindow}>
							<img src="images/info.svg" alt="info" />
							<span>INFO</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- BUILDING POPUP -->
	{#if selectedBuilding}
		<div class="bld-popup-overlay" transition:fade on:click|self={() => selectedBuilding = null}>
			<div class="bld-popup" transition:scale={{ duration: 300, easing: backOut }}>
				<img src={`images/landscape-svgs/${selectedBuilding.type}.svg`} alt={selectedBuilding.type} style="width: 80px; height: 80px; margin-bottom: 20px;" 
					 on:error={(e) => e.currentTarget.src = 'images/landscape-svgs/custom.svg'} />
				<h2>{selectedBuilding.name}</h2>
				<span class="cost">COST: 50 GOLD</span>
				<p class="desc">
					This structure allows you to permanently enhance your <strong>{selectedBuilding.upgradeSystem.stat}</strong> 
					by <strong>+{selectedBuilding.upgradeSystem.value}</strong> points.
				</p>
				<button class="upgrade-btn" on:click={confirmUpgrade}>UPGRADE STAT</button>
			</div>
		</div>
	{/if}

	<!-- FULLSCREEN MAP MODAL -->
	{#if $misc.showMapModal}
		<div class="modal-overlay map-modal-overlay" transition:fade={{ duration: 300 }} on:click|self={() => $misc.showMapModal = false}>
			<div class="glass-modal map-fullscreen-modal" in:scale={{ duration: 400, start: 0.9, easing: cubicOut }}>
				<button class="close-btn" on:click={() => ($misc.showMapModal = false)}>
					<span class="icon">✕</span>
				</button>

				<header class="modal-header">
					<h2 class="title">WORLD ATLAS</h2>
					<p class="subtitle">Procedural Territory Mapping</p>
				</header>

				<div class="map-modal-content">
					<div class="canvas-wrapper glass-container">
						<canvas 
							id="fullscreenMapCanvas" 
							width="600" 
							height="600" 
							on:click={handleFullscreenMapClick}
						></canvas>
					</div>

					<div class="map-details-panel glass-container">
						{#if selectedTile}
							{@const regionId = `${selectedTile.x.toString().padStart(2, '0')}${selectedTile.y.toString().padStart(2, '0')}`}
							{@const region = $worldStore?.regions?.[regionId]}
							<div class="tile-info" in:fade>
								<div class="tile-header">
									<div class="type-badge" style="background: {region?.color || '#888'}">{regionNames[region?.type] || region?.type}</div>
									<h3 class="tile-name">{region?.name}</h3>
								</div>
								<p class="tile-desc">{region?.description}</p>
								
								{#if region?.type === 'city' && region.buildings?.ids}
									<div class="atlas-buildings">
										<h4 class="atlas-section-title">CITY STRUCTURES</h4>
										<div class="accordion">
											{#each region.buildings.ids as bldId}
												{@const bld = $worldStore.addedStaticData.buildings[bldId]}
												<div class="accordion-item" class:expanded={expandedBuildingId === bldId}>
													<button class="accordion-header" on:click={() => toggleBuildingAccordion(bldId)}>
														<img src={`images/landscape-svgs/${bld.type}.svg`} alt={bld.type} 
															 on:error={(e) => e.currentTarget.src = 'images/landscape-svgs/custom.svg'} />
														<span class="bld-name">{bld.name}</span>
														<span class="chevron">{expandedBuildingId === bldId ? '▼' : '▶'}</span>
													</button>
													{#if expandedBuildingId === bldId}
														<div class="accordion-content" transition:fly={{ y: -10, duration: 200 }}>
															<p>Provides permanent <strong>{bld.upgradeSystem.stat}</strong> enhancement.</p>
															<div class="bld-stat-row">
																<span>Bonus: +{bld.upgradeSystem.value}</span>
																<span>Base Cost: 50 Gold</span>
															</div>
														</div>
													{/if}
												</div>
											{/each}
										</div>
									</div>
								{/if}

								<div class="tile-coords">
									<span>LAT: {selectedTile.y}</span>
									<span>LNG: {selectedTile.x}</span>
								</div>
							</div>
						{:else}
							<div class="no-selection">
								<div class="scanner-icon">📡</div>
								<p>SELECT COORDINATES ON THE ATLAS</p>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/if}
</main>

<!-- Modals moved from UiButtons -->
{#if $misc.showInfoWindow}
	<div class="modal-overlay" transition:fade={{ duration: 300 }}>
		<div class="glass-modal info-window">
			<button class="close-btn" on:click={() => ($misc.showInfoWindow = false)}>
				<span class="icon">✕</span>
			</button>

			<header class="modal-header">
				<h2 class="title">SYSTEM ARCHIVE</h2>
				<p class="subtitle">ALYSSIUM Interface Documentation</p>
			</header>

			<div class="modal-grid">
				<section class="info-section">
					<h3 class="section-title"><span class="emoji">⚔️</span> CORE LOGIC</h3>
					<ul class="info-list">
						<li>Interactive RPG driven by advanced Neural Networks.</li>
						<li>AI shapes the reality based on your tactical decisions.</li>
						<li>Custom actions use Neural Energy to influence the narrative.</li>
						<li>Survival depends on Health (HP) and Mana (MP) management.</li>
						<li>Combat efficiency scales with weapon and spell complexity.</li>
					</ul>
				</section>

				<section class="info-section">
					<h3 class="section-title"><span class="emoji">🔮</span> SYSTEM STATUS</h3>
					<ul class="info-list">
						<li>Alpha v0.2.1: Procedural World Generation enabled.</li>
						<li>AI-enhanced regional descriptions and unique biomes.</li>
						<li>Refined Liquid Glass UI with immersive blur effects.</li>
						<li>Real-time inventory and spell cooldown systems.</li>
						<li>Experimental: Dynamic AI-generated NPC interactions.</li>
					</ul>
				</section>
			</div>

			<footer class="modal-footer">
				<div class="footer-line"></div>
				<p class="copyright">© 2026 ALYSSIUM PROTOCOL | SECURE CONNECTION ESTABLISHED</p>
			</footer>
		</div>
	</div>
{/if}

{#if $misc.bugWindow}
	<div class="modal-overlay" transition:fade={{ duration: 300 }}>
		<div class="glass-modal bug-window">
			<button class="close-btn" on:click={() => ($misc.bugWindow = false)}>
				<span class="icon">✕</span>
			</button>
			
			<header class="modal-header">
				<h2 class="title">BUG REPORT</h2>
				<p class="subtitle">Interface Anomaly Detection</p>
			</header>

			<div class="bug-content">
				<div class="warning-icon">⚠️</div>
				<p class="bug-desc">
					The ALYSSIUM interface is in active development. If you encounter any logic loops, 
					visual glitches, or neural desyncs, please report them via our central repository.
				</p>
				<div class="protocol-status">
					<span class="status-label">DIAGNOSTIC MODE:</span>
					<span class="status-value">ACTIVE</span>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	:root {
		--glass-bg: rgba(15, 18, 25, 0.7);
		--glass-border: rgba(255, 255, 255, 0.1);
		--accent-primary: #00f2ff;
		--accent-secondary: #7000ff;
		--text-main: #f0f0f0;
		--text-dim: rgba(240, 240, 240, 0.5);
	}

	.game-layout {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: #050508;
		position: relative;
		overflow: hidden;
	}
	
	.game-content {
		padding: 0 !important;
		flex: 1;
		width: 100%;
		max-width: 1000px;
		margin: 0 auto;
		z-index: 10;
	}
	
	/* ============================================
	BOTTOM CONTROLS & TOGGLE
	============================================ */
	.bottom-controls-wrapper {
		position: fixed;
		bottom: 20px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 300;
		pointer-events: none;
	}
	
	.center-toggle-btn {
		pointer-events: auto;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}
	
	.center-toggle-btn:hover {
		transform: scale(1.1);
	}
	
	.btn-inner {
		background: var(--glass-bg);
		backdrop-filter: blur(20px);
		border: 1px solid var(--glass-border);
		width: 80px;
		height: 40px;
		border-radius: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1);
	}
	
	.btn-inner .icon {
		font-size: 0.7rem;
		font-weight: 800;
		letter-spacing: 0.1em;
		color: var(--accent-primary);
		text-shadow: 0 0 10px rgba(0, 242, 255, 0.4);
	}
	
	.center-toggle-btn.active .btn-inner {
		border-color: var(--accent-secondary);
	}
	
	.center-toggle-btn.active .icon {
		color: #ff3e3e;
		text-shadow: 0 0 10px rgba(255, 62, 62, 0.4);
	}
	
	/* ============================================
	LIQUID GLASS SLIDE PANEL
	============================================ */
	.slide-panel {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		transform: translateY(100%);
		transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
		z-index: 200;
	}
	
	.slide-panel.open {
		transform: translateY(0);
	}
	
	.panel-content {
		background: var(--glass-bg);
		backdrop-filter: blur(40px) saturate(150%);
		-webkit-backdrop-filter: blur(40px) saturate(150%);
		border-top: 1px solid var(--glass-border);
		border-radius: 32px 32px 0 0;
		padding: 30px 40px 60px 40px;
		box-shadow: 0 -15px 50px rgba(0, 0, 0, 0.6);
		position: relative;
	}
	
	.panel-layout {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
		gap: 20px;
		align-items: center;
		max-width: 1200px;
		margin: 0 auto;
	}
	
	.panel-section {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 15px;
	}

	/* Utils Sections */
	.utils-section-left, .utils-section-right {
		display: flex;
		gap: 12px;
	}
	
	/* Stats Section */
	.stats-section {
		flex-direction: column;
		gap: 10px;
	}
	
	.stat-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 14px;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid var(--glass-border);
		border-radius: 12px;
		transition: all 0.3s;
		width: 100%;
		max-width: 120px;
	}
	
	.stat-icon {
		width: 16px;
		height: 16px;
	}
	
	.stat-value {
		font-size: 0.9rem;
		font-weight: 700;
		font-family: monospace;
		color: var(--text-main);
	}
	
	.stat-item.gold .stat-value { color: #fcc419; }
	.stat-item.time .stat-value { color: var(--accent-primary); }
	
	/* Actions Section */
	.action-buttons {
		display: flex;
		justify-content: center;
	}
	
	.glass-btn {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid var(--glass-border);
		border-radius: 16px;
		padding: 12px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		min-width: 80px;
	}
	
	.glass-btn:hover {
		background: rgba(255, 255, 255, 0.08);
		border-color: var(--accent-primary);
		transform: translateY(-3px);
		box-shadow: 0 5px 15px rgba(0, 242, 255, 0.1);
	}

	.glass-btn.active {
		border-color: var(--accent-primary);
		background: rgba(0, 242, 255, 0.1);
	}
	
	.glass-btn img {
		width: 24px;
		height: 24px;
		opacity: 0.8;
	}
	
	.glass-btn span {
		font-size: 0.65rem;
		font-weight: 800;
		letter-spacing: 0.05em;
		color: var(--text-main);
	}

	.main-action {
		min-width: 110px;
		padding: 18px;
		border-radius: 20px;
		background: rgba(255, 255, 255, 0.05);
	}

	.main-action img {
		width: 32px;
		height: 32px;
	}

	.main-action span {
		font-size: 0.75rem;
	}
	
	/* Map Section */
	.circular-minimap {
		width: 100px;
		height: 100px;
		border-radius: 50%;
		overflow: hidden;
		border: 3px solid var(--glass-border);
		background: rgba(0, 0, 0, 0.4);
		cursor: pointer;
		transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
		position: relative;
		box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
	}
	
	.circular-minimap:hover {
		border-color: var(--accent-primary);
		transform: scale(1.1) rotate(5deg);
		box-shadow: 0 0 30px rgba(0, 242, 255, 0.2);
	}

	.circular-minimap canvas {
		width: 100%;
		height: 100%;
		display: block;
		image-rendering: pixelated;
	}

	.map-overlay-hint {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.6rem;
		font-weight: 900;
		color: var(--accent-primary);
		opacity: 0;
		transition: opacity 0.3s;
		letter-spacing: 0.2em;
	}

	.circular-minimap:hover .map-overlay-hint {
		opacity: 1;
	}

	/* Map Modal Styles */
	.map-fullscreen-modal {
		max-width: 1000px;
		padding: 2.5rem;
		overflow: hidden;
	}

	.map-modal-content {
		display: grid;
		grid-template-columns: 1fr 320px;
		gap: 2.5rem;
		margin-top: 1rem;
	}
	@media (max-width: 768px) {
		.map-modal-content {
			display: flex;
			flex-direction: column;
			width: 100%; /* Zapewnia, że na telefonie wykorzystasz całą szerokość */
		}
	}

	.canvas-wrapper {
		background: rgba(0, 0, 0, 0.3);
		border-radius: 20px;
		padding: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--glass-border);
	}

	#fullscreenMapCanvas {
		max-width: 100%;
		height: auto;
		cursor: crosshair;
		image-rendering: pixelated;
		border-radius: 12px;
	}

	.map-details-panel {
		background: rgba(255, 255, 255, 0.02);
		border-radius: 24px;
		padding: 1.5rem;
		border: 1px solid var(--glass-border);
		display: flex;
		flex-direction: column;
		min-height: 400px;
	}

	.tile-info {
		display: flex;
		flex-direction: column;
		gap: 1.2rem;
	}

	.tile-header {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.type-badge {
		align-self: flex-start;
		padding: 4px 12px;
		border-radius: 20px;
		font-size: 0.65rem;
		font-weight: 900;
		text-transform: uppercase;
		color: rgba(0, 0, 0, 0.7);
		letter-spacing: 0.05em;
	}

	.tile-name {
		font-size: 1.5rem;
		font-weight: 800;
		color: #fff;
		margin: 0;
	}

	.tile-desc {
		font-size: 0.95rem;
		color: var(--text-dim);
		line-height: 1.6;
		margin: 0;
	}

	.tile-coords {
		display: flex;
		gap: 1rem;
		font-family: monospace;
		font-size: 0.8rem;
		color: var(--accent-primary);
		background: rgba(0, 0, 0, 0.2);
		padding: 8px 12px;
		border-radius: 8px;
	}

	.tile-actions {
		margin-top: auto;
	}

	.travel-btn {
		width: 100%;
		padding: 1rem;
		background: var(--accent-primary);
		color: #000;
		border: none;
		border-radius: 14px;
		font-weight: 800;
		cursor: pointer;
		transition: all 0.3s;
		letter-spacing: 0.05em;
	}

	.travel-btn:hover {
		transform: scale(1.02);
		filter: brightness(1.1);
		box-shadow: 0 0 20px rgba(0, 242, 255, 0.3);
	}

	.no-selection {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		gap: 1.5rem;
		color: var(--text-dim);
	}

	.scanner-icon {
		font-size: 3rem;
		animation: pulse-scanner 2s infinite;
	}

	@keyframes pulse-scanner {
		0%, 100% { transform: scale(1); opacity: 0.5; }
		50% { transform: scale(1.1); opacity: 1; }
	}

	.no-selection p {
		font-size: 0.75rem;
		font-weight: 800;
		letter-spacing: 0.15em;
		max-width: 200px;
	}

	/* Atlas Buildings Accordion */
	.atlas-buildings {
		margin-top: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}

	.atlas-section-title {
		font-size: 0.7rem;
		font-weight: 900;
		letter-spacing: 0.15em;
		color: var(--accent-primary);
		opacity: 0.8;
		margin: 0;
	}

	.accordion {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.accordion-item {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid var(--glass-border);
		border-radius: 12px;
		overflow: hidden;
		transition: all 0.3s;
	}

	.accordion-item.expanded {
		background: rgba(255, 255, 255, 0.06);
		border-color: var(--accent-primary);
	}

	.accordion-header {
		width: 100%;
		padding: 12px 15px;
		display: flex;
		align-items: center;
		gap: 12px;
		background: none;
		border: none;
		cursor: pointer;
		color: #fff;
		transition: all 0.2s;
	}

	.accordion-header:hover {
		background: rgba(255, 255, 255, 0.04);
	}

	.accordion-header img {
		width: 24px;
		height: 24px;
	}

	.accordion-header .bld-name {
		flex: 1;
		text-align: left;
		font-size: 0.85rem;
		font-weight: 700;
	}

	.accordion-header .chevron {
		font-size: 0.6rem;
		color: var(--text-dim);
	}

	.accordion-content {
		padding: 0 15px 15px 51px;
		font-size: 0.8rem;
		color: var(--text-dim);
		line-height: 1.5;
	}

	.accordion-content strong {
		color: var(--accent-primary);
	}

	.bld-stat-row {
		margin-top: 8px;
		display: flex;
		justify-content: space-between;
		font-family: monospace;
		font-weight: 600;
		color: #fcc419;
	}

	/* Responsive */
	@media (max-width: 1000px) {
		.panel-layout {
			grid-template-columns: 1fr 1.2fr 1fr;
			grid-template-rows: auto auto;
		}
		.stats-section { grid-column: 1; grid-row: 1; }
		.actions-section { grid-column: 2; grid-row: 1 / span 2; }
		.map-section { grid-column: 3; grid-row: 1; }
		.utils-section-left { grid-column: 1; grid-row: 2; }
		.utils-section-right { grid-column: 3; grid-row: 2; }
		.places-to-go-wrapper { left: 20px; }
	}

	/* Navigation Controls */
	.navigation-controls {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 5px;
		margin-bottom: 20px;
	}

	.nav-row {
		display: flex;
		gap: 5px;
	}

	.nav-btn {
		width: 45px;
		height: 45px;
		background: var(--glass-bg);
		border: 1px solid var(--glass-border);
		border-radius: 12px;
		color: var(--accent-primary);
		font-size: 1.2rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
		backdrop-filter: blur(10px);
	}

	.nav-btn:hover {
		background: rgba(0, 242, 255, 0.2);
		border-color: var(--accent-primary);
		transform: scale(1.05);
	}

	.nav-btn:active {
		transform: scale(0.95);
	}

	.inventory-opaque {
		background: rgba(10, 12, 18, 0.95) !important;
		backdrop-filter: blur(40px) !important;
	}

	/* Building Popup */
	.bld-popup-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.8);
		backdrop-filter: blur(8px);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
	}

	.bld-popup {
		background: var(--glass-bg);
		backdrop-filter: blur(30px);
		border: 1px solid var(--glass-border);
		border-radius: 32px;
		padding: 40px;
		max-width: 400px;
		width: 100%;
		text-align: center;
		box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
	}

	.bld-popup h2 {
		color: #fff;
		font-size: 1.8rem;
		margin-bottom: 10px;
	}

	.bld-popup .cost {
		color: #fcc419;
		font-weight: 800;
		font-size: 1.2rem;
		margin-bottom: 20px;
		display: block;
	}

	.bld-popup .desc {
		color: var(--text-dim);
		line-height: 1.6;
		margin-bottom: 30px;
	}

	.upgrade-btn {
		width: 100%;
		padding: 15px;
		background: var(--accent-primary);
		color: #000;
		border: none;
		border-radius: 16px;
		font-weight: 800;
		cursor: pointer;
		transition: all 0.3s;
	}

	.upgrade-btn:hover {
		transform: scale(1.02);
		filter: brightness(1.1);
	}

	/* ============================================
	DYNAMIC MENUS (BUILDINGS & INVENTORY)
	============================================ */
	.places-to-go-wrapper, .inventory-wrapper {
		position: absolute;
		bottom: 100%;
		left: 40px;
		right: 40px;
		margin-bottom: 20px;
		z-index: 210;
	}

	.places-to-go, .inventory-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 15px;
		padding: 20px;
		background: rgba(10, 12, 18, 0.9);
		backdrop-filter: blur(30px);
		border: 1px solid var(--glass-border);
		border-radius: 24px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
	}

	.places-to-go button {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid var(--glass-border);
		border-radius: 16px;
		padding: 15px;
		display: flex;
		align-items: center;
		gap: 12px;
		cursor: pointer;
		transition: all 0.3s;
		text-align: left;
	}

	.places-to-go button:hover {
		background: rgba(0, 242, 255, 0.1);
		border-color: var(--accent-primary);
		transform: translateY(-2px);
	}

	.places-to-go button img {
		width: 32px;
		height: 32px;
	}

	.bld-info {
		display: flex;
		flex-direction: column;
	}

	.bld-name {
		font-size: 0.85rem;
		font-weight: 800;
		color: #fff;
	}

	.bld-stat {
		font-size: 0.7rem;
		color: var(--accent-primary);
		font-weight: 600;
	}

	.no-buildings {
		grid-column: 1 / -1;
		text-align: center;
		padding: 40px;
		color: var(--text-dim);
	}

	.no-buildings p {
		font-weight: 900;
		letter-spacing: 0.3em;
		margin-bottom: 5px;
	}

	/* Inventory Grid */
	.inventory-grid {
		grid-template-columns: repeat(6, 1fr);
	}

	.inventory-slot {
		aspect-ratio: 1;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid var(--glass-border);
		border-radius: 12px;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s;
		cursor: pointer;
	}

	.inventory-slot:hover {
		background: rgba(255, 255, 255, 0.08);
		border-color: var(--accent-secondary);
		transform: scale(1.05);
	}

	.inventory-slot img {
		width: 70%;
		height: 70%;
		z-index: 2;
	}

	.slot-bg {
		position: absolute;
		inset: 0;
		background: radial-gradient(circle at center, rgba(112, 0, 255, 0.1) 0%, transparent 70%);
		opacity: 0;
		transition: opacity 0.3s;
	}

	.inventory-slot:hover .slot-bg {
		opacity: 1;
	}

	.empty-slot {
		width: 20%;
		height: 20%;
		background: var(--glass-border);
		border-radius: 50%;
	}

	/* Responsive Mobile Fixes */
	@media (max-width: 768px) {
		.panel-content {
			padding: 20px 15px 80px 15px;
			border-radius: 24px 24px 0 0;
		}

		.panel-layout {
			grid-template-columns: repeat(3, 1fr);
			grid-template-rows: auto auto;
			gap: 10px;
		}

		.actions-section {
			grid-column: 2;
			grid-row: 1;
		}

		.stats-section {
			grid-column: 1;
			grid-row: 1;
			align-items: flex-start;
		}

		.map-section {
			grid-column: 3;
			grid-row: 1;
			justify-content: flex-end;
		}

		.utils-section-left {
			grid-column: 1 / span 2;
			grid-row: 2;
			justify-content: flex-start;
		}

		.utils-section-right {
			grid-column: 3;
			grid-row: 2;
			justify-content: flex-end;
		}

		.glass-btn {
			padding: 8px;
			min-width: 60px;
		}

		.main-action {
			min-width: 90px;
			padding: 12px;
		}

		.circular-minimap {
			width: 70px;
			height: 70px;
		}

		.places-to-go, .inventory-grid {
			grid-template-columns: repeat(2, 1fr);
			left: 10px;
			right: 10px;
		}

		.inventory-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>