<script lang="ts">
	import { fade, fly } from 'svelte/transition'
	import { createEventDispatcher } from 'svelte'
	import { game } from '../../stores'

	const dispatch = createEventDispatcher()

	// Stan postaci
	let characterName = ''
	let selectedAvatar = 'warrior' // domyślnie wojownik
	
	// Statystyki i pula punktów
	const baseStats = [
		{ key: 'strength', name: 'Strength', value: 0, icon: '⚔️' },
		{ key: 'dexterity', name: 'Dexternity', value: 0, icon: '🏹' },
		{ key: 'intelligence', name: 'Intelligance', value: 0, icon: '🔮' },
		{ key: 'vitality', name: 'Vitality', value: 0, icon: '❤️' }
	]
	
	let stats = [...baseStats]
	let availablePoints = 10
	
	// Awatary do wyboru
	const avatars = [
		{ id: 'warrior', name: 'Wojownik', src: 'images/characters/avatar1.jpg' },
		{ id: 'mage', name: 'Mag', src: 'images/characters/avatar2.jpg' }
	]

	// Funkcja do zarządzania punktami
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

	// Reset statystyk
	function resetStats() {
		stats = baseStats.map(stat => ({ ...stat, value: 0 }))
		availablePoints = 10
	}

	// Zatwierdzenie postaci
	function emitCharacter() {
		if (!characterName.trim() || availablePoints > 0) return
		
		$game.gameData = {
			...$game.gameData,
			name: characterName,
			avatar: selectedAvatar,
			stats: stats.reduce((acc, stat) => {
				acc[stat.key] = stat.value
				return acc
			}, {} as Record<string, number>)
		}
		
		dispatch('emittedAnswer')
	}
</script>

<div class="character-creation">
	<h2>Choose Your Hero</h2>

	<div class="creation-container" in:fly={{ y: 20, duration: 600 }}>
		<!-- Pole imienia -->
		<div class="name-field">
			<label for="hero-name">Name</label>
			<input
				type="text"
				id="hero-name"
				bind:value={characterName}
				placeholder="Enter hero name"
				class="name-input"
			/>
		</div>

		<!-- Wybór awatara -->
		<div class="avatar-selection">
			<label>Avatar</label>
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
					</button>
				{/each}
			</div>
		</div>

		<!-- Statystyki -->
		<div class="stats-section">
			<label>Statistics: <span class="points-left">{availablePoints}</span> points left</label>
			<div class="stats-list">
				{#each stats as stat}
					<div class="stat-row">
						<span class="stat-name">{stat.name}</span>
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
				{/each}
			</div>
		</div>

		<!-- Przycisk potwierdzenia -->
		<button class="confirm-btn" on:click={emitCharacter} disabled={!characterName.trim() || availablePoints > 0}>
			Start Adventure
		</button>
	</div>
</div>

<style>
	.character-creation {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		height: 100%;
		gap: var(--space-xl);
		padding: var(--space-lg);
		overflow-y: auto;
	}

	.creation-container {
		width: 100%;
		max-width: 500px;
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
		background: rgba(20, 15, 30, 0.4);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(200, 180, 255, 0.1);
		border-radius: 24px;
		padding: var(--space-xl);
		box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
	}

	/* Pole imienia */
	.name-field {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.name-field label {
		font-size: 0.9rem;
		color: var(--color-text-secondary);
		letter-spacing: 0.5px;
		text-transform: uppercase;
	}

	.name-input {
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(200, 180, 255, 0.2);
		border-radius: 12px;
		padding: 12px 16px;
		font-size: 1rem;
		color: white;
		outline: none;
		transition: all 0.2s ease;
	}

	.name-input:focus {
		border-color: var(--color-accent-primary);
		box-shadow: 0 0 0 2px rgba(124, 92, 224, 0.3);
	}

	.name-input::placeholder {
		color: rgba(255, 255, 255, 0.3);
	}

	/* Wybór awatara */
	.avatar-selection {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.avatar-selection label {
		font-size: 0.9rem;
		color: var(--color-text-secondary);
		letter-spacing: 0.5px;
		text-transform: uppercase;
	}

	.avatars-grid {
		display: flex;
		gap: var(--space-md);
		justify-content: center;
	}

	.avatar-card {
		width: 100px;
		height: 100px;
		border-radius: 16px;
		overflow: hidden;
		border: 2px solid transparent;
		background: transparent;
		padding: 0;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
	}

	.avatar-card.selected {
		border-color: var(--color-accent-gold);
		transform: scale(1.05);
		box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
	}

	.avatar-wrapper {
		width: 100%;
		height: 100%;
		position: relative;
	}

	.avatar-wrapper img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* Statystyki */
	.stats-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.stats-section label {
		font-size: 0.9rem;
		color: var(--color-text-secondary);
		letter-spacing: 0.5px;
		text-transform: uppercase;
	}

	.points-left {
		color: var(--color-accent-gold);
		font-weight: bold;
		font-size: 1.2rem;
		margin-left: 5px;
	}

	.stats-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.stat-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 12px;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.05);
	}

	.stat-name {
		font-size: 1rem;
		color: white;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.stat-control {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.stat-btn {
		width: 30px;
		height: 30px;
		border-radius: 8px;
		border: none;
		background: rgba(255, 255, 255, 0.1);
		color: white;
		font-size: 1.2rem;
		font-weight: bold;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.stat-btn:hover:not(:disabled) {
		background: var(--color-accent-primary);
		transform: scale(1.1);
	}

	.stat-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.stat-value {
		min-width: 30px;
		text-align: center;
		font-size: 1.2rem;
		font-weight: bold;
		color: var(--color-accent-gold);
	}

	/* Przycisk potwierdzenia */
	.confirm-btn {
		background: linear-gradient(135deg, #7c5ce0, #9d7aff);
		border: none;
		border-radius: 40px;
		padding: 14px 28px;
		font-size: 1.1rem;
		font-weight: 600;
		color: white;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 5px 15px rgba(124, 92, 224, 0.4);
		text-transform: uppercase;
		letter-spacing: 1px;
		margin-top: var(--space-md);
		width: 100%;
	}

	.confirm-btn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 10px 25px rgba(124, 92, 224, 0.6);
	}

	.confirm-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Responsive */
	@media (max-width: 600px) {
		.creation-container {
			padding: var(--space-lg);
		}

		.avatar-card {
			width: 80px;
			height: 80px;
		}
	}
</style>