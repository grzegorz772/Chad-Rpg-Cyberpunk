<script lang="ts">
	import Game from '$lib/components/Game.svelte'
	import UiButtons from '$lib/components/UiButtons.svelte'
	import { game, character, misc } from '../stores'
	import { onMount } from 'svelte'
	
	let gameComponent: any;
	let miniMapGrid: any[] = [];
	let isPanelOpen = false;
	
	function updateMiniMap() {
		if (gameComponent && gameComponent.getMapGridFromGame) {
			const newGrid = gameComponent.getMapGridFromGame();
			if (newGrid && newGrid.length > 0) {
				miniMapGrid = newGrid;
				drawMiniMap();
			}
		}
	}
	
	function drawMiniMap() {
		const canvas = document.getElementById('miniMapCanvas') as HTMLCanvasElement | null;
		if (!canvas || !miniMapGrid.length) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		
		const size = miniMapGrid.length;
		const cellSize = canvas.width / size;
		
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		for (let y = 0; y < size; y++) {
			for (let x = 0; x < size; x++) {
				const tile = miniMapGrid[y]?.[x];
				if (tile) {
					ctx.fillStyle = tile.color;
					ctx.fillRect(x * cellSize, y * cellSize, cellSize - 0.5, cellSize - 0.5);
				}
			}
		}
	}
	
	function handleMiniMapClick(e: MouseEvent) {
		const canvas = document.getElementById('miniMapCanvas') as HTMLCanvasElement | null;
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
			const tile = miniMapGrid[y]?.[x];
			if (tile) {
				console.log('📍 Selected tile:', tile);
				// Możesz dodać tu wyświetlenie informacji o tile
			}
		}
	}
	
	function togglePanel() {
		isPanelOpen = !isPanelOpen;
	}
	
	onMount(() => {
		const interval = setInterval(() => {
			if (gameComponent && gameComponent.getMapGridFromGame && $misc.started) {
				const grid = gameComponent.getMapGridFromGame();
				if (grid && grid.length > 0 && miniMapGrid.length === 0) {
					miniMapGrid = grid;
					drawMiniMap();
				}
			}
		}, 500);
		
		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	<title>Chad RPG</title>
</svelte:head>

<main class="game-layout">
	<div class="game-content">
		<Game bind:this={gameComponent} />
		<UiButtons />
	</div>
	
	<!-- PRZYCISK OTWIERAJĄCY PANEL - zawsze widoczny po starcie gry -->
	{#if $misc.started}
		<button class="toggle-panel-btn" on:click={togglePanel} class:active={isPanelOpen}>
			<span class="btn-icon">{isPanelOpen ? '✕' : '⚙️'}</span>
			<span class="btn-text">{isPanelOpen ? 'CLOSE' : 'MENU'}</span>
		</button>
		
		<!-- WYSUWANY PANEL Z LIQUID GLASS BLUR -->
		<div class="slide-panel" class:open={isPanelOpen}>
			<div class="panel-content">
				<!-- LEWA SEKCJA -->
				<div class="left-section">
					<div class="buttons-container">
						<button class="action-btn equipment" on:click={() => console.log('Equipment clicked')}>
							<span class="btn-emoji">⚔️</span>
							<span class="btn-label">EQUIPMENT</span>
						</button>
						<button class="action-btn buildings" on:click={() => console.log('Buildings clicked')}>
							<span class="btn-emoji">🏛️</span>
							<span class="btn-label">BUILDINGS</span>
						</button>
					</div>
					
					<div class="quick-items">
						<div class="quick-slot">1</div>
						<div class="quick-slot">2</div>
						<div class="quick-slot">3</div>
						<div class="quick-slot">4</div>
						<div class="quick-slot">5</div>
					</div>
				</div>
				
				<!-- PRAWA SEKCJA - Mapa -->
				<div class="right-section">
					<div class="map-wrapper">
						<div class="map-preview" on:click={handleMiniMapClick}>
							<canvas id="miniMapCanvas" width="160" height="160" style="width: 160px; height: 160px; image-rendering: crisp-edges;"></canvas>
							<span class="map-label">MAP</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</main>

<style>
	.game-layout {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: #0a0c12;
		position: relative;
	}
	
	.game-content {
		padding: 0 !important;
		flex: 1;
		padding: 20px;
		padding-bottom: 20px;
		max-width: 800px;
		width: 100%;
		margin: 0 auto;
		overflow-y: auto;
	}
	
	/* ============================================
	PRZYCISK OTWIERAJĄCY PANEL
	============================================ */
	.toggle-panel-btn {
		position: fixed;
		bottom: 20px;
		right: 20px;
		width: 60px;
		height: 60px;
		border-radius: 30px;
		background: linear-gradient(135deg, rgba(255, 170, 68, 0.95), rgba(255, 140, 0, 0.95));
		border: none;
		color: white;
		cursor: pointer;
		z-index: 200;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
		transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
		box-shadow: 0 4px 20px rgba(255, 170, 68, 0.4);
		backdrop-filter: blur(10px);
	}
	
	.toggle-panel-btn:hover {
		transform: scale(1.1);
		box-shadow: 0 6px 25px rgba(255, 170, 68, 0.6);
	}
	
	.toggle-panel-btn.active {
		background: linear-gradient(135deg, rgba(255, 80, 80, 0.95), rgba(200, 50, 50, 0.95));
		box-shadow: 0 4px 20px rgba(255, 80, 80, 0.4);
	}
	
	.btn-icon {
		font-size: 24px;
		font-weight: bold;
	}
	
	.btn-text {
		font-size: 10px;
		font-weight: bold;
		letter-spacing: 1px;
	}
	
	/* ============================================
	WYSUWANY PANEL - LIQUID GLASS BLUR
	============================================ */
	.slide-panel {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		transform: translateY(100%);
		transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		z-index: 150;
		pointer-events: none;
	}
	
	.slide-panel.open {
		transform: translateY(0);
		pointer-events: auto;
	}
	
	.panel-content {
		background: rgba(20, 25, 40, 0.85);
		backdrop-filter: blur(20px) saturate(180%);
		-webkit-backdrop-filter: blur(20px) saturate(180%);
		border-top: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 24px 24px 0 0;
		padding: 20px 24px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 20px;
		box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.3);
		animation: glassPulse 2s ease-in-out infinite;
	}
	
	@keyframes glassPulse {
		0%, 100% {
			background: rgba(20, 25, 40, 0.85);
			border-top-color: rgba(255, 255, 255, 0.2);
		}
		50% {
			background: rgba(30, 35, 55, 0.9);
			border-top-color: rgba(255, 170, 68, 0.4);
		}
	}
	
	/* LEWA SEKCJA */
	.left-section {
		display: flex;
		flex-direction: column;
		gap: 12px;
		flex: 1;
	}
	
	.buttons-container {
		display: flex;
		gap: 12px;
	}
	
	.action-btn {
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 170, 68, 0.6);
		color: #ffaa44;
		padding: 12px 20px;
		border-radius: 12px;
		font-size: 13px;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.3s ease;
		text-transform: uppercase;
		letter-spacing: 1px;
		white-space: nowrap;
		display: flex;
		align-items: center;
		gap: 8px;
		flex: 1;
		justify-content: center;
	}
	
	.action-btn:hover {
		background: rgba(255, 170, 68, 0.2);
		border-color: #ffaa44;
		transform: translateY(-2px);
		box-shadow: 0 5px 15px rgba(255, 170, 68, 0.3);
	}
	
	.btn-emoji {
		font-size: 18px;
	}
	
	.btn-label {
		font-size: 12px;
	}
	
	.quick-items {
		display: flex;
		gap: 10px;
	}
	
	.quick-slot {
		width: 50px;
		height: 50px;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(10px);
		border: 2px solid rgba(255, 170, 68, 0.6);
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 16px;
		font-weight: bold;
		color: #ffaa44;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.quick-slot:hover {
		border-color: #ffaa44;
		background: rgba(255, 170, 68, 0.2);
		transform: scale(1.05);
		box-shadow: 0 0 15px rgba(255, 170, 68, 0.3);
	}
	
	/* PRAWA SEKCJA - Mapa */
	.right-section {
		display: flex;
		align-items: center;
	}
	
	.map-wrapper {
		display: flex;
		flex-direction: column;
	}
	
	.map-preview {
		position: relative;
		cursor: pointer;
		transition: transform 0.3s ease;
	}
	
	.map-preview:hover {
		transform: scale(1.05);
	}
	
	.map-preview canvas {
		border: 2px solid rgba(255, 170, 68, 0.8);
		border-radius: 12px;
		background: rgba(0, 0, 0, 0.5);
		box-shadow: 0 0 30px rgba(255, 170, 68, 0.2);
		display: block;
		transition: all 0.3s;
	}
	
	.map-preview:hover canvas {
		border-color: #ffaa44;
		box-shadow: 0 0 40px rgba(255, 170, 68, 0.4);
	}
	
	.map-label {
		position: absolute;
		bottom: 8px;
		right: 10px;
		font-size: 11px;
		color: #ffaa44;
		background: rgba(0, 0, 0, 0.8);
		backdrop-filter: blur(5px);
		padding: 3px 8px;
		border-radius: 6px;
		letter-spacing: 1px;
		font-weight: bold;
		border: 1px solid rgba(255, 170, 68, 0.3);
	}
	
	/* ============================================
	RESPONSYWNOŚĆ
	============================================ */
	@media (max-width: 768px) {
		.panel-content {
			padding: 16px 20px;
			flex-direction: column;
			gap: 16px;
		}
		
		.left-section {
			width: 100%;
		}
		
		.buttons-container {
			gap: 10px;
		}
		
		.action-btn {
			padding: 10px 16px;
			font-size: 11px;
		}
		
		.btn-emoji {
			font-size: 16px;
		}
		
		.btn-label {
			font-size: 10px;
		}
		
		.quick-slot {
			width: 45px;
			height: 45px;
			font-size: 14px;
		}
		
		.map-preview canvas {
			width: 130px;
			height: 130px;
		}
		
		.toggle-panel-btn {
			bottom: 15px;
			right: 15px;
			width: 55px;
			height: 55px;
		}
		
		.btn-icon {
			font-size: 22px;
		}
	}
	
	@media (max-width: 480px) {
		.panel-content {
			padding: 14px 16px;
			gap: 12px;
		}
		
		.buttons-container {
			gap: 8px;
			flex-direction: column;
		}
		
		.action-btn {
			padding: 8px 12px;
			justify-content: center;
		}
		
		.quick-items {
			gap: 8px;
			justify-content: center;
		}
		
		.quick-slot {
			width: 40px;
			height: 40px;
			font-size: 12px;
		}
		
		.map-preview canvas {
			width: 110px;
			height: 110px;
		}
		
		.map-label {
			font-size: 9px;
			bottom: 5px;
			right: 6px;
			padding: 2px 6px;
		}
		
		.toggle-panel-btn {
			bottom: 12px;
			right: 12px;
			width: 50px;
			height: 50px;
		}
		
		.btn-icon {
			font-size: 20px;
		}
		
		.btn-text {
			font-size: 9px;
		}
	}
	
	/* Animacja płynnego pojawiania się */
	@keyframes slideInUp {
		from {
			transform: translateY(100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
	
	.slide-panel.open .panel-content {
		animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}
	
	/* Efekt szkła na całym panelu */
	.slide-panel.open::before {
		content: '';
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.3);
		backdrop-filter: blur(5px);
		z-index: -1;
		animation: fadeIn 0.3s ease;
	}
	
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>