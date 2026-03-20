<script lang="ts">
	import Game from '$lib/components/Game.svelte'
	import UiButtons from '$lib/components/UiButtons.svelte'
	import { game, character, misc } from '../stores'
	import { onMount } from 'svelte'
	
	let gameComponent: any;
	let miniMapGrid: any[] = [];
	
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
	
	<!-- DOLNY PANEL - pokazuje się tylko gdy gra wystartowała -->
	{#if $misc.started}
		<div class="bottom-panel">
			<!-- LEWA SEKCJA -->
			<div class="left-section">
				<div class="buttons-container">
					<button class="action-btn equipment" on:click={() => console.log('Equipment clicked')}>
						⚔️ EQUIPMENT
					</button>
					<button class="action-btn buildings" on:click={() => console.log('Buildings clicked')}>
						🏛️ BUILDINGS
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
	{/if}
</main>

<style>
	.game-layout {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: #0a0c12;
	}
	
	.game-content {
		flex: 1;
		padding: 20px;
		padding-bottom: 80px;
		max-width: 800px;
		width: 100%;
		margin: 0 auto;
		overflow-y: auto;
	}
	
	/* DOLNY PANEL - widoczny tylko po starcie gry */
	.bottom-panel {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: 16px 24px;
		background: rgba(0, 0, 0, 0.92);
		backdrop-filter: blur(20px);
		border-top: 2px solid rgba(255, 170, 68, 0.6);
		z-index: 150;
		animation: slideUp 0.3s ease-out;
	}
	
	@keyframes slideUp {
		from {
			transform: translateY(100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
	
	/* LEWA SEKCJA */
	.left-section {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	
	.buttons-container {
		display: flex;
		gap: 12px;
	}
	
	.action-btn {
		background: linear-gradient(135deg, #2a2a2a, #1a1a1a);
		border: 1px solid #ffaa44;
		color: #ffaa44;
		padding: 10px 20px;
		border-radius: 10px;
		font-size: 13px;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.2s;
		text-transform: uppercase;
		letter-spacing: 1px;
		white-space: nowrap;
	}
	
	.action-btn:hover {
		background: #ffaa44;
		color: #000;
		box-shadow: 0 0 15px #ffaa44;
		transform: translateY(-2px);
	}
	
	.quick-items {
		display: flex;
		gap: 8px;
	}
	
	.quick-slot {
		width: 44px;
		height: 44px;
		background: rgba(0, 0, 0, 0.7);
		border: 2px solid rgba(255, 170, 68, 0.6);
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 14px;
		font-weight: bold;
		color: #ffaa44;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.quick-slot:hover {
		border-color: #ffaa44;
		background: rgba(255, 170, 68, 0.2);
		transform: scale(1.05);
	}
	
	/* PRAWA SEKCJA - Mapa */
	.right-section {
		display: flex;
		align-items: flex-start;
	}
	
	.map-wrapper {
		display: flex;
		flex-direction: column;
	}
	
	.map-preview {
		position: relative;
		cursor: pointer;
		transition: transform 0.2s;
	}
	
	.map-preview:hover {
		transform: scale(1.02);
	}
	
	.map-preview canvas {
		border: 2px solid #ffaa44;
		border-radius: 8px;
		background: #000;
		box-shadow: 0 0 20px rgba(255, 170, 68, 0.3);
		display: block;
	}
	
	.map-label {
		position: absolute;
		bottom: 6px;
		right: 8px;
		font-size: 10px;
		color: #ffaa44;
		background: rgba(0, 0, 0, 0.7);
		padding: 2px 6px;
		border-radius: 4px;
		letter-spacing: 1px;
		font-weight: bold;
	}
	
	/* Responsywność */
	@media (max-width: 768px) {
		.game-content {
			padding: 12px;
			padding-bottom: 80px;
		}
		
		.bottom-panel {
			padding: 12px 16px;
		}
		
		.buttons-container {
			gap: 8px;
		}
		
		.action-btn {
			padding: 8px 14px;
			font-size: 11px;
		}
		
		.quick-slot {
			width: 36px;
			height: 36px;
			font-size: 12px;
		}
		
		.map-preview canvas {
			width: 120px;
			height: 120px;
		}
	}
	
	@media (max-width: 480px) {
		.game-content {
			padding-bottom: 80px;
		}
		
		.bottom-panel {
			padding: 10px 12px;
		}
		
		.buttons-container {
			gap: 6px;
		}
		
		.action-btn {
			padding: 6px 10px;
			font-size: 9px;
		}
		
		.quick-slot {
			width: 28px;
			height: 28px;
			font-size: 10px;
		}
		
		.map-preview canvas {
			width: 90px;
			height: 90px;
		}
		
		.map-label {
			font-size: 8px;
			bottom: 3px;
			right: 4px;
		}
	}
</style>