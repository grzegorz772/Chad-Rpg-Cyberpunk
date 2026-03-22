<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { fade, fly } from 'svelte/transition'
	import { cubicOut } from 'svelte/easing'
	import { game } from '../../stores'

	const dispatch = createEventDispatcher()

	export let worldPrompt: string | null = null

	let characterName = ''
	let selectedAvatar = 'warrior'
	
	const baseStats = [
		{ key: 'strength', name: 'STRENGTH', value: 0, icon: '⚔️' },
		{ key: 'dexterity', name: 'DEXTERITY', value: 0, icon: '🏹' },
		{ key: 'intelligence', name: 'INTELLIGENCE', value: 0, icon: '🔮' },
		{ key: 'vitality', name: 'VITALITY', value: 0, icon: '❤️' }
	]
	
	let stats = [...baseStats]
	let availablePoints = 10
	
	const avatars = [
		{ id: 'warrior', name: 'WARRIOR', src: 'images/characters/avatar1.jpg' },
		{ id: 'mage', name: 'MAGE', src: 'images/characters/avatar2.jpg' }
	]

	function adjustStat(statKey: string, change: number) {
		stats = stats.map(stat => {
			if (stat.key === statKey) {
				const newValue = stat.value + change
				if (newValue >= 0 && newValue <= 10) {
					if (change > 0 && availablePoints > 0) {
						availablePoints--
						return { ...stat, value: newValue }
					} else if (change < 0 && stat.value > 0) {
						availablePoints++
						return { ...stat, value: newValue }
					}
				}
			}
			return stat
		})
	}

	function resetStats() {
		stats = baseStats.map(stat => ({ ...stat, value: 0 }))
		availablePoints = 10
	}

	function fillWithTestData() {
		characterName = 'TestPlayer_' + Math.floor(Math.random() * 1000)
		selectedAvatar = Math.random() > 0.5 ? 'warrior' : 'mage'
		resetStats()
		const pointsPerStat = [3, 2, 2, 3]
		stats = stats.map((stat, index) => {
			availablePoints -= pointsPerStat[index]
			return { ...stat, value: pointsPerStat[index] }
		})
	}

	function emitCharacter() {
		if (!characterName.trim() || availablePoints > 0) return
		
		$game.gameData = {
			...$game.gameData,
			name: characterName,
			avatar: selectedAvatar,
			stats: stats.reduce((acc, stat) => {
				acc[stat.key] = stat.value
				return acc
			}, {} as Record<string, number>),
			customWorldPrompt: worldPrompt
		}
		
		dispatch('emittedAnswer', { 
			worldPrompt: worldPrompt 
		})
	}
</script>

<div class="character-creation" transition:fade={{ duration: 600 }}>
	<!-- Breathing Liquid Gradient Background -->
	<div class="liquid-bg">
		<div class="blob blob-1"></div>
		<div class="blob blob-2"></div>
		<div class="blob blob-3"></div>
	</div>

	<!-- Debug Trigger -->
	<button class="debug-trigger" on:click={fillWithTestData}>
		<span class="icon">⚡</span>
		<span class="text">TEST DATA</span>
	</button>

	<div class="glass-content" in:fly={{ y: 30, duration: 800, easing: cubicOut }}>
		<header class="creation-header">
			<div class="header-main">
				<h2 class="title">IDENTITY FORGE</h2>
				<div class="badge">AWAITING INPUT</div>
			</div>
			<p class="subtitle">Calibrate your neural signature and attributes.</p>
		</header>

		<div class="creation-layout">
			<!-- Identity Section -->
			<section class="identity-section">
				<div class="field-group">
					<label for="hero-name">CODED DESIGNATION</label>
					<input
						type="text"
						id="hero-name"
						bind:value={characterName}
						placeholder="Enter your name..."
						class="glass-input"
					/>
				</div>

				<div class="avatar-selection">
					<span class="section-label">VISUAL MANIFESTATION</span>
					<div class="avatars-grid">
						{#each avatars as avatar}
							<button
								class="avatar-card"
								class:active={selectedAvatar === avatar.id}
								on:click={() => selectedAvatar = avatar.id}
							>
								<div class="avatar-image">
									<img src={avatar.src} alt={avatar.id} />
									<div class="selection-overlay"></div>
								</div>
								<span class="avatar-label">{avatar.name}</span>
							</button>
						{/each}
					</div>
				</div>
			</section>

			<!-- Attributes Section -->
			<section class="attributes-section">
				<div class="points-header">
					<span class="label">NEURAL ENERGY</span>
					<div class="points-display">
						<span class="points-value" class:urgent={availablePoints <= 2}>{availablePoints}</span>
						<span class="points-unit">U</span>
					</div>
				</div>

				<div class="stats-container">
					{#each stats as stat}
						<div class="stat-module">
							<div class="stat-header">
								<div class="stat-name">
									<span class="icon">{stat.icon}</span>
									<span class="text">{stat.name}</span>
								</div>
								<div class="stat-controls">
									<button
										class="control-btn minus"
										on:click={() => adjustStat(stat.key, -1)}
										disabled={stat.value <= 0}
									>−</button>
									<span class="current-value">{stat.value}</span>
									<button
										class="control-btn plus"
										on:click={() => adjustStat(stat.key, 1)}
										disabled={stat.value >= 10 || availablePoints <= 0}
									>+</button>
								</div>
							</div>
							<div class="stat-progress">
								<div class="progress-track">
									<div class="progress-fill" style="width: {stat.value * 10}%"></div>
								</div>
							</div>
						</div>
					{/each}
				</div>

				<button 
					class="launch-btn" 
					on:click={emitCharacter} 
					disabled={!characterName.trim() || availablePoints > 0}
				>
					<div class="btn-content">
						<span>INITIALIZE SEQUENCE</span>
						<span class="arrow">→</span>
					</div>
				</button>
			</section>
		</div>
	</div>
</div>

<style>
	:root {
		--glass-bg: rgba(255, 255, 255, 0.03);
		--glass-border: rgba(255, 255, 255, 0.08);
		--accent-primary: #00f2ff;
		--accent-secondary: #7000ff;
		--text-main: #e0e0e0;
		--text-dim: rgba(224, 224, 224, 0.5);
	}

	.character-creation {
		position: relative;
		width: 100%;
		min-height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		color: var(--text-main);
		font-family: 'Inter', system-ui, sans-serif;
		overflow-x: hidden;
		overflow-y: auto;
		box-sizing: border-box;
	}

	/* Swirling Liquid Gradient Background */
	.liquid-bg {
		position: absolute;
		inset: 0;
		z-index: 0;
		filter: blur(80px);
		opacity: 0.6;
		pointer-events: none;
	}

	.blob {
		position: absolute;
		border-radius: 50%;
		animation: swirl 10s infinite linear;
		mix-blend-mode: screen;
	}

	.blob-1 { 
		width: min(500px, 80vw); 
		height: min(500px, 80vw); 
		background: var(--accent-secondary); 
		top: -15%; 
		left: -10%; 
		animation-duration: 8s;
	}
	
	.blob-2 { 
		width: min(450px, 70vw); 
		height: min(450px, 70vw); 
		background: var(--accent-primary); 
		bottom: -15%; 
		right: -10%; 
		animation-duration: 12s;
		animation-delay: -2s; 
		animation-direction: reverse;
	}
	
	.blob-3 { 
		width: min(400px, 60vw); 
		height: min(400px, 60vw); 
		background: #ff00c8; 
		top: 30%; 
		left: 40%; 
		animation-duration: 10s;
		animation-delay: -5s; 
	}

	@keyframes swirl {
		0% { transform: translate(0, 0) rotate(0deg) scale(1); }
		33% { transform: translate(15%, 10%) rotate(120deg) scale(1.2); }
		66% { transform: translate(-10%, 20%) rotate(240deg) scale(0.9); }
		100% { transform: translate(0, 0) rotate(360deg) scale(1); }
	}

	/* Debug Tool */
	.debug-trigger {
		position: absolute;
		top: 1rem;
		right: 1rem;
		z-index: 100;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid var(--glass-border);
		padding: 0.5rem 0.8rem;
		border-radius: 10px;
		color: var(--text-dim);
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.65rem;
		font-weight: 700;
		transition: all 0.3s;
	}

	.debug-trigger:hover {
		background: rgba(255, 255, 255, 0.1);
		color: white;
	}

	/* Glass Content */
	.glass-content {
		position: relative;
		z-index: 10;
		width: 100%;
		max-width: 1000px;
		background: rgba(10, 10, 15, 0.45);
		backdrop-filter: blur(40px);
		-webkit-backdrop-filter: blur(40px);
		border: 1px solid var(--glass-border);
		border-radius: 32px;
		padding: 2.5rem;
		box-sizing: border-box;
		margin: 1rem 0;
	}

	.creation-header {
		margin-bottom: 2rem;
	}

	.header-main {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
		margin-bottom: 0.5rem;
	}

	.title {
		font-size: clamp(1.5rem, 5vw, 2.2rem);
		font-weight: 800;
		letter-spacing: -0.04em;
		margin: 0;
		background: linear-gradient(to right, #fff, #888);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.badge {
		font-size: 0.65rem;
		font-weight: 800;
		padding: 0.2rem 0.8rem;
		background: rgba(0, 242, 255, 0.1);
		color: var(--accent-primary);
		border-radius: 20px;
		font-family: monospace;
		letter-spacing: 0.05em;
	}

	.subtitle {
		font-size: clamp(0.85rem, 2vw, 1rem);
		color: var(--text-dim);
		margin: 0;
	}

	/* Layout */
	.creation-layout {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2.5rem;
	}

	/* Identity Section */
	.identity-section {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.field-group label, .section-label {
		display: block;
		font-size: 0.7rem;
		font-weight: 800;
		color: var(--text-dim);
		margin-bottom: 0.8rem;
		letter-spacing: 0.1em;
	}

	.glass-input {
		width: 100%;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid var(--glass-border);
		border-radius: 16px;
		padding: 1rem;
		color: white;
		font-family: inherit;
		font-size: 1rem;
		transition: all 0.3s;
		box-sizing: border-box;
	}

	.glass-input:focus {
		outline: none;
		border-color: rgba(0, 242, 255, 0.3);
		background: rgba(255, 255, 255, 0.06);
	}

	.avatars-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.avatar-card {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid var(--glass-border);
		border-radius: 20px;
		padding: 0.6rem;
		cursor: pointer;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
		align-items: center;
	}

	.avatar-card:hover {
		background: rgba(255, 255, 255, 0.08);
		transform: translateY(-4px);
	}

	.avatar-card.active {
		background: linear-gradient(135deg, rgba(0, 242, 255, 0.1), rgba(112, 0, 255, 0.1));
		border-color: var(--accent-primary);
		box-shadow: 0 0 20px rgba(0, 242, 255, 0.1);
	}

	.avatar-image {
		width: 100%;
		aspect-ratio: 1;
		border-radius: 12px;
		overflow: hidden;
		position: relative;
	}

	.avatar-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.6s;
	}

	.avatar-label {
		font-size: 0.7rem;
		font-weight: 800;
		letter-spacing: 0.1em;
		color: var(--text-dim);
	}

	.avatar-card.active .avatar-label {
		color: var(--accent-primary);
	}

	/* Attributes Section */
	.attributes-section {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.points-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		padding-bottom: 0.8rem;
		border-bottom: 1px solid var(--glass-border);
	}

	.points-header .label {
		font-size: 0.7rem;
		font-weight: 800;
		color: var(--text-dim);
		letter-spacing: 0.1em;
	}

	.points-display {
		display: flex;
		align-items: baseline;
		gap: 0.3rem;
	}

	.points-value {
		font-size: 2rem;
		font-weight: 800;
		line-height: 1;
		color: var(--accent-primary);
	}

	.points-value.urgent {
		color: #ff3e3e;
		text-shadow: 0 0 15px rgba(255, 62, 62, 0.4);
	}

	.points-unit {
		font-size: 0.7rem;
		font-weight: 800;
		color: var(--text-dim);
	}

	.stats-container {
		display: flex;
		flex-direction: column;
		gap: 1.2rem;
	}

	.stat-module {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.stat-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
	}

	.stat-name {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.05em;
	}

	.stat-controls {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		background: rgba(255, 255, 255, 0.03);
		padding: 0.3rem;
		border-radius: 10px;
		border: 1px solid var(--glass-border);
	}

	.control-btn {
		width: 28px;
		height: 28px;
		border-radius: 6px;
		border: 1px solid var(--glass-border);
		background: transparent;
		color: white;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.1rem;
		transition: all 0.2s;
	}

	.control-btn:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.4);
	}

	.control-btn:disabled {
		opacity: 0.15;
		cursor: not-allowed;
	}

	.current-value {
		font-size: 1.1rem;
		font-weight: 800;
		color: var(--accent-primary);
		min-width: 1.2rem;
		text-align: center;
		font-family: monospace;
	}

	.stat-progress {
		height: 3px;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 2px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(to right, var(--accent-primary), var(--accent-secondary));
		transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 0 10px rgba(0, 242, 255, 0.5);
	}

	/* Launch Button */
	.launch-btn {
		margin-top: 1rem;
		background: linear-gradient(135deg, rgba(0, 242, 255, 0.15), rgba(112, 0, 255, 0.15));
		border: 1px solid rgba(0, 242, 255, 0.3);
		padding: 1rem;
		border-radius: 16px;
		color: var(--accent-primary);
		font-weight: 800;
		font-size: 0.95rem;
		letter-spacing: 0.1em;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.launch-btn:hover:not(:disabled) {
		background: linear-gradient(135deg, rgba(0, 242, 255, 0.25), rgba(112, 0, 255, 0.25));
		transform: translateY(-2px);
		box-shadow: 0 10px 30px -10px rgba(0, 242, 255, 0.3);
		border-color: var(--accent-primary);
	}

	.launch-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
		filter: grayscale(1);
	}

	.btn-content {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.8rem;
	}

	.arrow {
		font-size: 1.1rem;
		transition: transform 0.3s;
	}

	.launch-btn:hover .arrow {
		transform: translateX(5px);
	}

	/* Responsive Refinement */
	@media (max-width: 850px) {
		.creation-layout { 
			grid-template-columns: 1fr; 
			gap: 2rem; 
		}
		
		.glass-content { 
			padding: 1.5rem; 
			border-radius: 24px;
		}

		.identity-section {
			border-bottom: 1px solid var(--glass-border);
			padding-bottom: 2rem;
		}

		.launch-btn {
			padding: 1.2rem;
		}
	}

	@media (max-width: 480px) {
		.glass-content {
			padding: 1.2rem;
			border-radius: 20px;
		}

		.avatars-grid {
			gap: 0.8rem;
		}

		.avatar-card {
			padding: 0.5rem;
		}

		.stat-controls {
			gap: 0.5rem;
		}

		.control-btn {
			width: 26px;
			height: 26px;
		}

		.points-value {
			font-size: 1.8rem;
		}
	}
</style>
