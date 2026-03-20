<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { fade, fly } from 'svelte/transition'
	import { game } from '../../stores'

	const dispatch = createEventDispatcher()

	export let worldPrompt: string | null = null

	let characterName = ''
	let selectedAvatar = 'warrior'
	
	const baseStats = [
		{ key: 'strength', name: 'STRENGTH', value: 0, icon: '' },
		{ key: 'dexterity', name: 'DEXTERITY', value: 0, icon: '' },
		{ key: 'intelligence', name: 'INTELLIGENCE', value: 0, icon: '' },
		{ key: 'vitality', name: 'VITALITY', value: 0, icon: '' }
	]
	
	let stats = [...baseStats]
	let availablePoints = 10
	
	const avatars = [
		{ id: 'warrior', name: '', src: 'images/characters/avatar1.jpg' },
		{ id: 'mage', name: '', src: 'images/characters/avatar2.jpg' }
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

	// FUNKCJA DEBUGOWA - automatycznie wypełnia formularz
	function fillWithTestData() {
		characterName = 'TestPlayer_' + Math.floor(Math.random() * 1000)
		selectedAvatar = Math.random() > 0.5 ? 'warrior' : 'mage'
		
		// Resetuj statystyki
		resetStats()
		
		// Rozdaj wszystkie punkty (po 2-3 na każdą statystykę)
		const pointsPerStat = [3, 2, 2, 3] // Razem 10 punktów
		stats = stats.map((stat, index) => {
			availablePoints -= pointsPerStat[index]
			return { ...stat, value: pointsPerStat[index] }
		})
		
		console.log('🎮 TEST MODE - Formularz wypełniony:', {
			name: characterName,
			avatar: selectedAvatar,
			stats: stats.reduce((acc, stat) => {
				acc[stat.key] = stat.value
				return acc
			}, {}),
			worldPrompt
		})
	}

	function emitCharacter() {
		if (!characterName.trim() || availablePoints > 0) return
		
		// Loguj dane przed wysłaniem
		console.log('📤 Emitting character data:', {
			name: characterName,
			avatar: selectedAvatar,
			stats: stats.reduce((acc, stat) => {
				acc[stat.key] = stat.value
				return acc
			}, {}),
			worldPrompt
		})
		
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

<div class="character-creation">
	<!-- Przycisk debugowy - zawsze widoczny w prawym górnym rogu -->
	<button class="debug-btn" on:click={fillWithTestData} title="Auto-fill test data">
		⚡ TEST MODE
	</button>

	<!-- Cyberpunk Effects -->
	<div class="grid-overlay"></div>
	<div class="glitch-overlay"></div>

	<!-- Neon Header -->
	<div class="neon-header">
		<div class="corner top-left"></div>
		<div class="corner top-right"></div>
		<div class="corner bottom-left"></div>
		<div class="corner bottom-right"></div>
		<div class="cyber-title">
			<div class="title-glitch" data-text="START JOURNEY">START JOURNEY</div>
			<div class="title-sub">// CREATE CHARACTER //</div>
		</div>
	</div>

	<!-- Główna zawartość: dwie kolumny -->
	<div class="creation-grid">
		<!-- Lewa kolumna: awatary -->
		<div class="left-panel">
			<div class="panel-header">
				<div class="title-sub" style="display: contents;">// LOADING IDENTITY<div class="title-sub loading-dots"></div> //</div>
			</div>

			<!-- Pole imienia -->
			<div class="name-field">
				<label for="hero-name">[DESIGNATION]</label>
				<input
					type="text"
					id="hero-name"
					bind:value={characterName}
					placeholder="Player_2v77k"
					class="name-input"
				/>
			</div>

			<!-- Wybór awatara -->
			<div class="avatars-grid">
				{#each avatars as avatar}
					<button
						class="avatar-card"
						class:selected={selectedAvatar === avatar.id}
						on:click={() => selectedAvatar = avatar.id}
					>
						<div class="avatar-wrapper">
							<img src={avatar.src} alt={avatar.id} />
						</div>
						<span class="avatar-name">{avatar.name}</span>
					</button>
				{/each}
			</div>
			<button class="confirm-btn" on:click={emitCharacter} disabled={!characterName.trim() || availablePoints > 0}>
				<span class="btn-text">ACTIVATE PROTOCOL</span>
				<span class="btn-icon">▶</span>
			</button>
		</div>

		<!-- Prawa kolumna: statystyki -->
		<div class="right-panel">
			<div class="panel-header">
				<div class="title-sub" style="display: contents;">// MAKING ATTRIBUTES<div class="title-sub loading-dots"></div> //</div>
			</div>

			<div style="display: flex; justify-content: space-between; align-items: center;" class="points-pool">
				<span class="pool-label">TECH ATTRIBUTES:</span>
				<span class="pool-value" class:low={availablePoints <= 3}>{availablePoints}</span>
			</div>

			<div class="stats-list">
				{#each stats as stat}
					<div class="stat-row">
						<div style="display: flex; justify-content: space-between;">
							<div class="stat-info">
								<span class="stat-icon">{stat.icon}</span>
								<span class="stat-name">{stat.name}</span>
							</div>
							
							<div class="stat-control">
								<button
									class="stat-btn minus"
									on:click={() => adjustStat(stat.key, -1)}
									disabled={stat.value <= 0}
								>−</button>
								
								<span class="stat-value">{stat.value}</span>
								
								<button
									class="stat-btn plus"
									on:click={() => adjustStat(stat.key, 1)}
									disabled={stat.value >= 10 || availablePoints <= 0}
								>+</button>
							</div>
						</div>
						<div class="stat-bar">
							<div class="stat-bar-fill" style="width: {stat.value * 10}%"></div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	/* Dodaj styl dla przycisku debugowego */
	.debug-btn {
		position: fixed;
		top: 20px;
		right: 20px;
		z-index: 1000;
		background: linear-gradient(135deg, #ff00ff, #00ffff);
		color: black;
		border: none;
		padding: 8px 16px;
		border-radius: 4px;
		font-family: 'Share Tech Mono', monospace;
		font-weight: bold;
		cursor: pointer;
		box-shadow: 0 0 20px rgba(255, 0, 255, 0.5);
		transition: all 0.3s ease;
	}

	.debug-btn:hover {
		transform: scale(1.05);
		box-shadow: 0 0 30px rgba(255, 0, 255, 0.8);
	}
	.loading-dots::after {
		content: "";
		display: content;
		animation: dots 2.5s steps(4, end) infinite;
	}

	@keyframes dots {
		0% { content: ""; }
		25% { content: "."; }
		50% { content: ".."; }
		75% { content: "..."; }
		100% { content: ""; }
	}
	/* Pełny ekran, tło */
	.character-creation {
		position: relative;
		width: 100%;
		min-height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20px;
		overflow-y: auto;
		color: #00ffff;
		font-family: 'Share Tech Mono', 'Courier New', monospace;
		background: #0a0a0f;
		box-sizing: border-box;
	}

	/* Overlay (kopiowane z głównego menu) */
	.grid-overlay {
		position: absolute;
		inset: 0;
		background-image: 
			linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 0, 255, 0.05) 1px, transparent 1px);
		background-size: 50px 50px;
		pointer-events: none;
		z-index: 1;
		animation: gridMove 10s linear infinite;
	}

	.glitch-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(90deg, transparent, rgba(255, 0, 255, 0.1), transparent);
		animation: glitch 3s infinite;
		pointer-events: none;
		z-index: 2;
	}

	@keyframes gridMove {
		0% { background-position: 0 0; }
		100% { background-position: 50px 50px; }
	}

	@keyframes glitch {
		0%, 100% { transform: translateX(0); opacity: 0; }
		10% { transform: translateX(-2px); opacity: 0.3; }
		20% { transform: translateX(2px); opacity: 0.3; }
		30% { transform: translateX(0); opacity: 0; }
	}

	/* Neon Header (identyczny jak w głównym) */
	.neon-header {
		position: relative;
		width: 100%;
		max-width: 1000px;
		margin-bottom: 30px;
		padding: 20px;
		border: 1px solid #00ffff;
		background: rgba(0, 0, 0, 0.8);
		box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
		z-index: 10;
		box-sizing: border-box;
	}

	.corner {
		position: absolute;
		width: 15px;
		height: 15px;
		border-style: solid;
		border-color: #ff00ff;
	}

	.corner.top-left {
		top: -2px;
		left: -2px;
		border-width: 2px 0 0 2px;
	}

	.corner.top-right {
		top: -2px;
		right: -2px;
		border-width: 2px 2px 0 0;
	}

	.corner.bottom-left {
		bottom: -2px;
		left: -2px;
		border-width: 0 0 2px 2px;
	}

	.corner.bottom-right {
		bottom: -2px;
		right: -2px;
		border-width: 0 2px 2px 0;
	}

	.cyber-title {
		text-align: center;
	}

	.title-glitch {
		font-size: 2.5rem;
		font-weight: bold;
		color: #00ffff;
		text-shadow: 
			-2px -2px 0 #ff00ff,
			2px 2px 0 #00ffff;
		animation: glitchText 4s infinite;
		position: relative;
		display: inline-block;
	}

	.title-glitch::before,
	.title-glitch::after {
		content: attr(data-text);
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	.title-glitch::before {
		animation: glitchBefore 0.4s infinite;
		color: #ff00ff;
		z-index: -1;
	}

	.title-glitch::after {
		animation: glitchAfter 0.4s infinite;
		color: #00ffff;
		z-index: -2;
	}

	@keyframes glitchText {
		0%, 100% { transform: skew(0deg); }
		95% { transform: skew(0deg); }
		96% { transform: skew(5deg); }
		97% { transform: skew(-5deg); }
		98% { transform: skew(0deg); }
	}

	@keyframes glitchBefore {
		0%, 100% { transform: translate(0); }
		10% { transform: translate(-2px, -2px); }
		20% { transform: translate(2px, 2px); }
		30% { transform: translate(0); }
	}

	@keyframes glitchAfter {
		0%, 100% { transform: translate(0); }
		10% { transform: translate(2px, 2px); }
		20% { transform: translate(-2px, -2px); }
		30% { transform: translate(0); }
	}

	.title-sub {
		font-size: 0.9rem;
		color: #ff00ff;
		margin-top: 5px;
		letter-spacing: 2px;
	}

	/* Siatka dwóch kolumn */
	.creation-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 25px;
		width: 100%;
		max-width: 1000px;
		margin-bottom: 20px;
		z-index: 10;
		position: relative;
	}

	/* Wspólne style paneli */
	.left-panel,
	.right-panel {
		border: 1px solid #00ffff;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(5px);
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.panel-header {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 15px;
		color: #ff00ff;
		margin-bottom: 5px;
		font-size: 1.2rem;
	}

	/* Lewy panel */
	.name-field {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.name-field label {
		font-size: 0.8rem;
		color: #ff00ff;
		letter-spacing: 1px;
	}

	.name-input {
		background: rgba(0, 0, 0, 0.5);
		border: 1px solid #00ffff;
		padding: 12px 15px;
		font-size: 1rem;
		color: #00ffff;
		font-family: inherit;
		outline: none;
		transition: all 0.2s ease;
	}

	.name-input:focus {
		border-color: #ff00ff;
		box-shadow: 0 0 15px #ff00ff;
	}

	.name-input::placeholder {
		color: rgba(0, 255, 255, 0.3);
	}

	.avatars-grid {
		display: flex;
		gap: 20px;
		justify-content: center;
	}

	.avatar-card {
		background: transparent;
		border: 2px solid #00ffff;
		padding: 10px;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
	}

	.avatar-card.selected {
		border-color: #ff00ff;
		box-shadow: 0 0 20px #ff00ff;
	}

	.avatar-wrapper {
		width: 100px;
		height: 100px;
		overflow: hidden;
	}

	.avatar-wrapper img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: grayscale(50%) contrast(120%);
	}

	.avatar-name {
		color: #00ffff;
		font-size: 0.8rem;
	}

	/* Prawy panel */
	.points-pool {
		display: flex;
		justify-content: space-between;
		padding: 8px 12px;
		border: 1px solid #00ffff;
		background: rgba(0, 255, 255, 0.05);
		margin-bottom: 10px;
	}

	.pool-label {
		color: #00ffff;
	}

	.pool-value {
		color: #ff00ff;
		font-weight: bold;
		font-size: 1.2rem;
	}

	.pool-value.low {
		color: #ff00ff;
		text-shadow: 0 0 10px #ff00ff;
	}

	.stats-list {
		display: flex;
		flex-direction: column;
		gap: 15px;
		margin-bottom: 20px;
	}

	.stat-row {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.stat-info {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.stat-icon {
		font-size: 1.2rem;
	}

	.stat-name {
		font-size: 0.9rem;
		color: #00ffff;
		letter-spacing: 1px;
	}

	.stat-control {
		display: flex;
		align-items: center;
		gap: 15px;
		justify-content: flex-end;
	}

	.stat-btn {
		width: 35px;
		height: 35px;
		background: transparent;
		border: 1px solid #00ffff;
		color: #00ffff;
		font-size: 1.5rem;
		font-weight: bold;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
	}

	.stat-btn:hover:not(:disabled) {
		background: #00ffff;
		color: #000;
		box-shadow: 0 0 15px #00ffff;
	}

	.stat-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
		border-color: rgba(0, 255, 255, 0.3);
	}

	.stat-value {
		min-width: 30px;
		text-align: center;
		font-size: 1.3rem;
		font-weight: bold;
		color: #ff00ff;
	}

	.stat-bar {
		width: 100%;
		height: 6px;
		background: rgba(0, 255, 255, 0.2);
		border: 1px solid #00ffff;
	}

	.stat-bar-fill {
		height: 100%;
		background: linear-gradient(90deg, #00ffff, #ff00ff);
		width: 0%;
		transition: width 0.2s ease;
	}

	.confirm-btn {
		background: transparent;
		border: 1px solid #00ffff;
		padding: 15px 25px;
		font-size: 1.1rem;
		font-weight: bold;
		color: #00ffff;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 15px;
		transition: all 0.3s ease;
		text-transform: uppercase;
		letter-spacing: 2px;
		width: 100%;
		margin-top: auto; /* przykleja przycisk na dole */
	}

	.confirm-btn:hover:not(:disabled) {
		background: #00ffff;
		color: #000;
		box-shadow: 0 0 30px #00ffff;
	}

	.confirm-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
		border-color: rgba(0, 255, 255, 0.3);
	}

	.btn-icon {
		font-size: 1.2rem;
	}

	/* Responsywność: na małych ekranach kolumny pod sobą */
	@media (max-width: 700px) {
		.creation-grid {
			grid-template-columns: 1fr;
			gap: 20px;
		}

		.title-glitch {
			font-size: 2rem;
		}
	}
	/* Wersja tablet */
	@media (max-width: 1024px) {
		.creation-grid {
			grid-template-columns: 1fr;
			gap: 20px;
		}
		
		.neon-header {
			max-width: 90%;
		}
	}

	/* Wersja mobilna */
	@media (max-width: 768px) {
		.character-creation {
			padding: 10px;
		}
		
		.creation-grid {
			gap: 15px;
		}
		
		.left-panel, .right-panel {
			padding: 15px;
		}
		
		.avatars-grid {
			flex-direction: column;
			align-items: center;
			gap: 15px;
		}
		
		.avatar-card {
			width: 100%;
			max-width: 120px;
		}
		
		.avatar-wrapper {
			width: 80px;
			height: 80px;
		}
		
		.stat-name {
			font-size: 0.8rem;
		}
		
		.stat-btn {
			width: 30px;
			height: 30px;
			font-size: 1.2rem;
		}
		
		.stat-value {
			font-size: 1.1rem;
		}
		
		.confirm-btn {
			padding: 12px 20px;
			font-size: 0.9rem;
		}
		
		.title-glitch {
			font-size: 1.8rem;
		}
		
		.title-sub {
			font-size: 0.7rem;
		}
	}

	/* Bardzo małe telefony */
	@media (max-width: 480px) {
		.title-glitch {
			font-size: 1.4rem;
		}
		
		.name-input {
			padding: 8px 12px;
			font-size: 0.9rem;
		}
		
		.pool-label, .pool-value {
			font-size: 0.8rem;
		}
		
		.stat-name {
			font-size: 0.7rem;
		}
		
		.stat-control {
			gap: 8px;
		}
	}
</style>