<script lang="ts">
	import { createEventDispatcher, tick } from 'svelte'
	import { fade, fly } from 'svelte/transition'
	import { cubicOut, elasticOut } from 'svelte/easing'

	import CharacterClasses from '$lib/components/CharacterClasses.svelte'

	import { misc } from '../../stores'
	import { character } from '../../stores'

	import medievalTavernStarter from '$lib/gamedata/gamestarters/medievalTavernStarter.json'
	import WorldCreator from './WorldCreator.svelte'
	
	function getRandomValueFromArray(array: any) {
		const randomIndex = Math.floor(Math.random() * array?.length)
		return array[randomIndex]
	}

	const dispatch = createEventDispatcher()

	function emitAnswer(answer: any) {
		$character.stats[0].hp = 1
		dispatch('emittedAnswer', { answer })
	}

	let gameStarterPrompt: string = ''
	let gameModeSelected: boolean = false
	let worldCreationMode: boolean = false
	let customWorldPrompt: string = ''

	function handleWorldCreated(event: CustomEvent) {
		customWorldPrompt = event.detail.worldPrompt
		worldCreationMode = false
		gameModeSelected = true
	}

	function skipWorldCreation() {
		worldCreationMode = false
		gameModeSelected = true
	}

	async function handleGameMode(answer: any) {
		const el = document.getElementById('game-start-window')
		let oldHeight = 'auto'

		if (el) {
			oldHeight = `${el.clientHeight}px`
			el.style.height = oldHeight
		}

		worldCreationMode = true
		gameStarterPrompt = answer

		await tick()

		if (el) {
			const oldContent = el.querySelector('.start-content') as HTMLElement | null
			let oldDisplay = ''
			if (oldContent) {
				oldDisplay = oldContent.style.display
				oldContent.style.display = 'none'
			}

			el.style.height = 'auto'
			const newHeight = `${el.clientHeight}px`

			if (oldContent) {
				oldContent.style.display = oldDisplay
			}

			el.style.height = oldHeight
			const animation = el.animate([{ height: oldHeight }, { height: newHeight }], {
				duration: 500,
				easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
			})

			animation.onfinish = () => {
				el.style.height = 'auto'
			}
		}
	}
</script>

<div class="start-overlay" transition:fade={{ duration: 800, easing: cubicOut }}>
	<!-- Animated Background Blobs for Liquid Effect -->
	<div class="bg-blobs">
		<div class="blob blob-1"></div>
		<div class="blob blob-2"></div>
		<div class="blob blob-3"></div>
	</div>

	<div class="start-window glass-container" id="game-start-window" in:fly={{ y: 40, duration: 800, delay: 200, easing: elasticOut }}>
			{#if worldCreationMode}
				<div class="world-creator-wrapper" transition:fade={{ duration: 500, easing: cubicOut }}>
					<WorldCreator on:worldCreated={handleWorldCreated} />
					<button class="skip-btn" on:click={skipWorldCreation}>
						<span class="btn-text">SKIP TO STANDARD WORLD</span>
					</button>
				</div>
			{:else if gameModeSelected}
				<div class="character-select" transition:fade={{ duration: 500, easing: cubicOut }}>
					<CharacterClasses
						on:emittedAnswer={() => {
							emitAnswer(customWorldPrompt || gameStarterPrompt)
						}}
					/>
				</div>
			{:else}
			<div class="start-content" transition:fade={{ duration: 600, easing: cubicOut }}>
				<!-- Header Section -->
				<header class="minimal-header">
					<div class="logo-area">
						<h1 class="title">ALYSSIUM</h1>
						<div class="version-badge">v0.2.0-α</div>
					</div>
					<p class="subtitle">A Neo-Noir Narrative Experience</p>
				</header>

				<!-- Main Menu Layout -->
				<div class="main-layout">
					<nav class="liquid-menu">
						<button class="menu-card primary" on:click={() => handleGameMode(getRandomValueFromArray([...medievalTavernStarter]))}>
							<div class="card-content">
								<span class="action-tag">INITIALIZE</span>
								<h2 class="card-title">POINT ZERO</h2>
								<p class="card-desc">Begin your journey in the post-apocalyptic simulation.</p>
								
								<div class="card-stats">
									<div class="stat-item"><span class="icon">⚔️</span> 80%</div>
									<div class="stat-item"><span class="icon">🔮</span> 60%</div>
									<div class="stat-item"><span class="icon">💠</span> 90%</div>
								</div>
							</div>
							<div class="card-footer">
								<span class="status-pill">ACTIVE</span>
								<span class="arrow">→</span>
							</div>
						</button>

						<div class="secondary-actions">
							<button class="menu-card secondary disabled">
								<div class="card-content">
									<h3 class="card-title">CONFIGURATION</h3>
									<p class="card-desc">System parameters & hardware sync.</p>
								</div>
								<span class="tag">SOON</span>
							</button>

							<button class="menu-card secondary disabled">
								<div class="card-content">
									<h3 class="card-title">TERMINATE</h3>
									<p class="card-desc">Safe shutdown of the interface.</p>
								</div>
							</button>
						</div>
					</nav>

					<aside class="system-monitor">
						<div class="monitor-card">
							<h4 class="monitor-title">SYSTEM STATUS</h4>
							<div class="status-grid">
								<div class="status-row">
									<span class="label">IDENTITY</span>
									<span class="value">Player_2v77k</span>
								</div>
								<div class="status-row">
									<span class="label">CONNECT</span>
									<span class="value online">ENCRYPTED</span>
								</div>
								<div class="status-row">
									<span class="label">LATENCY</span>
									<span class="value">42ms</span>
								</div>
							</div>
							
							<div class="integrity-meter">
								<div class="meter-header">
									<span>INTEGRITY</span>
									<span>97.3%</span>
								</div>
								<div class="meter-bar">
									<div class="meter-fill" style="width: 97.3%"></div>
								</div>
							</div>
						</div>

						<div class="terminal-footer">
							<span class="prompt">></span>
							<span class="text">Illusion is everywhere</span>
							<span class="cursor">_</span>
						</div>
					</aside>
				</div>

				<!-- Simple Footer -->
				<footer class="minimal-footer">
					<div class="footer-left">
						<span>Project: ALYSSIUM</span>
					</div>
					<div class="footer-right">
						<span>Created by Solemensis & Mateusz</span>
					</div>
				</footer>
			</div>
		{/if}
	</div>
</div>

<style>
	:root {
		--glass-bg: rgba(255, 255, 255, 0.03);
		--glass-border: rgba(255, 255, 255, 0.12);
		--accent-primary: #00f2ff;
		--accent-secondary: #7000ff;
		--text-main: #e0e0e0;
		--text-dim: rgba(224, 224, 224, 0.5);
	}

	.start-overlay {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		background: #050508;
		overflow: hidden;
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
	}

	/* Swirling Liquid Gradient Background */
	.bg-blobs {
		position: absolute;
		inset: 0;
		filter: blur(80px);
		z-index: 0;
		opacity: 0.6;
	}

	.blob {
		position: absolute;
		border-radius: 50%;
		animation: swirl 10s infinite linear;
		mix-blend-mode: screen;
	}

	.blob-1 {
		width: min(600px, 90vw);
		height: min(600px, 90vw);
		top: -10%;
		left: -10%;
		background: var(--accent-secondary);
		animation-duration: 8s;
	}

	.blob-2 {
		width: min(500px, 80vw);
		height: min(500px, 80vw);
		bottom: -10%;
		right: -10%;
		background: var(--accent-primary);
		animation-duration: 12s;
		animation-delay: -2s;
		animation-direction: reverse;
	}

	.blob-3 {
		width: min(400px, 70vw);
		height: min(400px, 70vw);
		top: 40%;
		left: 50%;
		background: #ff00c8;
		animation-duration: 10s;
		animation-delay: -5s;
	}

	@keyframes swirl {
		0% { transform: translate(0, 0) rotate(0deg) scale(1); }
		33% { transform: translate(10%, 15%) rotate(120deg) scale(1.1); }
		66% { transform: translate(-15%, 5%) rotate(240deg) scale(0.9); }
		100% { transform: translate(0, 0) rotate(360deg) scale(1); }
	}

	/* Glass Container */
	.glass-container {
		position: relative;
		z-index: 10;
		width: min(95%, 1100px);
		max-height: 85vh;
		background: rgba(10, 10, 15, 0.4);
		backdrop-filter: blur(40px) saturate(150%);
		-webkit-backdrop-filter: blur(40px) saturate(150%);
		border: 1px solid var(--glass-border);
		border-radius: 32px;
		box-shadow: 
			0 25px 50px -12px rgba(0, 0, 0, 0.5),
			inset 0 1px 1px rgba(255, 255, 255, 0.1);
		overflow: hidden;
	}

	.start-content {
		padding: 3rem;
		color: var(--text-main);
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
		height: 100%;
		overflow-y: auto;
	}

	/* Minimalist Header */
	.minimal-header {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.logo-area {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.title {
		font-size: 2.5rem;
		font-weight: 800;
		letter-spacing: -0.05em;
		background: linear-gradient(to right, #fff, #888);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		margin: 0;
	}

	.version-badge {
		font-size: 0.7rem;
		padding: 0.2rem 0.6rem;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 20px;
		color: var(--text-dim);
		font-family: monospace;
	}

	.subtitle {
		font-size: 1rem;
		color: var(--text-dim);
		margin: 0;
	}

	/* Main Layout */
	.main-layout {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: 2rem;
	}

	/* Liquid Menu */
	.liquid-menu {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.menu-card {
		background: var(--glass-bg);
		border: 1px solid var(--glass-border);
		border-radius: 20px;
		padding: 1.5rem;
		text-align: left;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		position: relative;
		overflow: hidden;
	}

	.menu-card:hover:not(.disabled) {
		background: rgba(255, 255, 255, 0.08);
		border-color: rgba(255, 255, 255, 0.2);
		transform: translateY(-4px);
		box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.3);
	}

	.menu-card.primary {
		min-height: 200px;
		background: linear-gradient(135deg, rgba(0, 242, 255, 0.05), rgba(112, 0, 255, 0.05));
	}

	.menu-card.primary:hover {
		background: linear-gradient(135deg, rgba(0, 242, 255, 0.1), rgba(112, 0, 255, 0.1));
	}

	.secondary-actions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.action-tag {
		font-size: 0.65rem;
		font-weight: 700;
		color: var(--accent-primary);
		letter-spacing: 0.1em;
		margin-bottom: 0.5rem;
		display: block;
	}

	.card-title {
		font-size: 1.5rem;
		margin: 0 0 0.5rem 0;
		font-weight: 700;
	}

	.card-desc {
		font-size: 0.9rem;
		color: var(--text-dim);
		margin: 0;
		line-height: 1.5;
	}

	.card-stats {
		display: flex;
		gap: 1rem;
		margin-top: 1.5rem;
	}

	.stat-item {
		font-size: 0.8rem;
		background: rgba(255, 255, 255, 0.05);
		padding: 0.3rem 0.6rem;
		border-radius: 8px;
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	.card-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 1.5rem;
	}

	.status-pill {
		font-size: 0.7rem;
		color: #00ffaa;
		background: rgba(0, 255, 170, 0.1);
		padding: 0.2rem 0.6rem;
		border-radius: 20px;
		font-weight: 600;
	}

	.arrow {
		font-size: 1.2rem;
		transition: transform 0.3s;
	}

	.menu-card:hover .arrow {
		transform: translateX(5px);
	}

	.menu-card.disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.tag {
		position: absolute;
		top: 1rem;
		right: 1rem;
		font-size: 0.6rem;
		background: rgba(255, 255, 255, 0.1);
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
	}

	/* System Monitor */
	.system-monitor {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.monitor-card {
		background: var(--glass-bg);
		border: 1px solid var(--glass-border);
		border-radius: 20px;
		padding: 1.5rem;
	}

	.monitor-title {
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--text-dim);
		margin: 0 0 1rem 0;
		letter-spacing: 0.05em;
	}

	.status-grid {
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
		margin-bottom: 1.5rem;
	}

	.status-row {
		display: flex;
		justify-content: space-between;
		font-size: 0.85rem;
	}

	.label { color: var(--text-dim); }
	.value { font-family: monospace; }
	.value.online { color: var(--accent-primary); }

	.integrity-meter {
		margin-top: 1.5rem;
	}

	.meter-header {
		display: flex;
		justify-content: space-between;
		font-size: 0.7rem;
		margin-bottom: 0.5rem;
	}

	.meter-bar {
		height: 4px;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 2px;
		overflow: hidden;
	}

	.meter-fill {
		height: 100%;
		background: var(--accent-primary);
		box-shadow: 0 0 10px var(--accent-primary);
	}

	.terminal-footer {
		margin-top: auto;
		background: rgba(0, 0, 0, 0.2);
		padding: 1rem;
		border-radius: 12px;
		font-size: 0.8rem;
		font-family: monospace;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--accent-secondary);
	}

	.cursor { animation: blink 1s infinite; }
	@keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }

	/* Minimal Footer */
	.minimal-footer {
		display: flex;
		justify-content: space-between;
		font-size: 0.75rem;
		color: var(--text-dim);
		padding-top: 1rem;
		border-top: 1px solid var(--glass-border);
	}

	/* Scrollbar */
	.start-content::-webkit-scrollbar { width: 4px; }
	.start-content::-webkit-scrollbar-track { background: transparent; }
	.start-content::-webkit-scrollbar-thumb { background: var(--glass-border); border-radius: 2px; }

	/* World Creator Wrapper */
	.world-creator-wrapper {
		padding: 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
	}

	.skip-btn {
		background: transparent;
		border: 1px solid var(--glass-border);
		color: var(--text-dim);
		padding: 0.8rem 1.5rem;
		border-radius: 30px;
		cursor: pointer;
		font-size: 0.8rem;
		font-weight: 600;
		transition: all 0.3s;
	}

	.skip-btn:hover {
		background: rgba(255, 255, 255, 0.05);
		color: white;
		border-color: white;
	}

	/* Responsive */
	@media (max-width: 900px) {
		.main-layout { grid-template-columns: 1fr; }
		.system-monitor { display: none; }
		.start-content { padding: 1.5rem; }
		.title { font-size: 2rem; }
	}

	@media (max-width: 600px) {
		.secondary-actions { grid-template-columns: 1fr; }
		.menu-card { padding: 1.2rem; }
	}
</style>
