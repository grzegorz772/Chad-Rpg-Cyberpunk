<script lang="ts">
	import Game from '$lib/components/Game.svelte'
	import { game, character, misc, ui } from '../stores'
	import { onMount } from 'svelte'
	import { fade, fly, scale } from 'svelte/transition'
	import { cubicOut } from 'svelte/easing'
	import { supabase } from '$lib/supabaseClient'
	
	let gameComponent: any;
	let miniMapGrid: any[] = [];
	let isPanelOpen = false;
	let mapOn = false;
	let selectedTile: any = null;

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
					
					// Draw border between regions
					ctx.strokeStyle = "rgba(0,0,0,0.1)";
					ctx.lineWidth = 0.5;
					ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
				}
			}
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
				<!-- Buildings Menu (Floating above button) -->
				{#if mapOn}
					<div class="places-to-go-wrapper" transition:fly={{ y: 20, duration: 300 }}>
						<div class="places-to-go glass-container">
							<button disabled={$misc.loading || $game.gameData.event.inCombat} on:click={() => handleAnswer("I'll go to nearest Tavern to rest.")}>
								<img src="images/landscape-svgs/tavern.svg" alt="tavern" />
								<span>Tavern</span>
							</button>
							<button disabled={$misc.loading || $game.gameData.event.inCombat} on:click={() => handleAnswer("I'll go to nearest Town.")}>
								<img src="images/landscape-svgs/town.svg" alt="town" />
								<span>Town</span>
							</button>
							<button disabled={$misc.loading || $game.gameData.event.inCombat} on:click={() => handleAnswer("I'll go to nearest Woods.")}>
								<img src="images/landscape-svgs/forest.svg" alt="woods" />
								<span>Woods</span>
							</button>
							<button disabled={$misc.loading || $game.gameData.event.inCombat} on:click={() => handleAnswer("I'll go to nearest Harbor.")}>
								<img src="images/landscape-svgs/dock.svg" alt="harbor" />
								<span>Harbor</span>
							</button>
							<button disabled={$misc.loading || $game.gameData.event.inCombat} on:click={() => handleAnswer("I'll go to weaponsmith.")}>
								<img src="images/landscape-svgs/shop1.svg" alt="weaponsmith" />
								<span>Weaponsmith</span>
							</button>
							<button disabled={$misc.loading || $game.gameData.event.inCombat} on:click={() => handleAnswer("I'll go to spell shop.")}>
								<img src="images/landscape-svgs/shop2.svg" alt="spell shop" />
								<span>Spell Shop</span>
							</button>
							<button disabled={$misc.loading || $game.gameData.event.inCombat} on:click={() => handleAnswer("I'll go to potion shop.")}>
								<img src="images/landscape-svgs/shop3.svg" alt="potion shop" />
								<span>Potion Shop</span>
							</button>
						</div>
					</div>
				{/if}

				<div class="panel-layout">
					<!-- LEFT: BUILDINGS & MUSIC -->
					<div class="panel-section utils-section-left">
						<button class="action-btn glass-btn" on:click={() => mapOn = !mapOn} class:active={mapOn}>
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
							<span class="stat-value">{$character.gold}</span>
						</div>
						<div class="stat-item time">
							<img src="images/time.svg" alt="time" class="stat-icon" />
							<span class="stat-value">{$game.gameData.placeAndTime?.time || '00:00'}</span>
						</div>
					</div>
					
					<!-- MIDDLE: EQUIPMENT -->
					<div class="panel-section actions-section">
						<div class="action-buttons">
							<button class="action-btn glass-btn main-action" on:click={() => console.log('Inventory')}>
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
							{@const tile = miniMapGrid[selectedTile.y]?.[selectedTile.x]}
							<div class="tile-info" in:fade>
								<div class="tile-header">
									<div class="type-badge" style="background: {tile.color}">{tile.type}</div>
									<h3 class="tile-name">{tile.name}</h3>
								</div>
								<p class="tile-desc">{tile.description}</p>
								<div class="tile-coords">
									<span>LAT: {selectedTile.y}</span>
									<span>LNG: {selectedTile.x}</span>
								</div>
								<div class="tile-actions">
									<button class="travel-btn" on:click={() => handleAnswer(`I'll travel to ${tile.name}`)}>
										TRAVEL HERE
									</button>
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

	@media (max-width: 600px) {
		.panel-layout {
			grid-template-columns: 1fr 1fr;
			gap: 15px;
		}
		.actions-section { grid-column: 1 / span 2; grid-row: 1; }
		.stats-section { grid-column: 1; grid-row: 2; }
		.map-section { grid-column: 2; grid-row: 2; }
		.utils-section-left { grid-column: 1; grid-row: 3; }
		.utils-section-right { grid-column: 2; grid-row: 3; }
		.panel-content { padding: 20px 20px 70px 20px; }
	}
	</style>