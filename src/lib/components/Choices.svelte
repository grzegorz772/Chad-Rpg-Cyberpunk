<script lang="ts">
	import { game } from '../../stores'
	import { misc } from '../../stores'

	import PickChoice from '$lib/components/MainControls/1ChoiceSection.svelte'
	import Shop from '$lib/components/MainControls/ShopUI.svelte'
	import Loot from '$lib/components/MainControls/LootUI.svelte'
	import Death from '$lib/components/MainControls/DeathUI.svelte'
	import { fade, scale } from 'svelte/transition'
	import { backOut } from 'svelte/easing'

	import GoldTime from '$lib/components/MainControls/2StatesBar.svelte'

	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	function emitAnswer(answer: any) {
		dispatch('emittedAnswer', {
			answer: answer
		})
	}

	function handleEmittedAnswer(event: any) {
		emitAnswer(event.detail.answer)
	}
</script>

{#if $misc.started}
	<div class="ui-mid">
		<!-- Death Screen -->
		{#if $misc.death}
			<Death />
			<!-- Combat Screen Placeholder -->
		{:else if $game.gameData.event?.inCombat && $game.gameData.enemy}
			<div class="combat-encounter-placeholder glass-container" transition:scale={{duration: 400, easing: backOut}}>
				<div class="encounter-header">
					<span class="encounter-label">COMBAT ENCOUNTER</span>
					<h2>{$game.gameData.enemy.name}</h2>
				</div>
				
				<div class="enemy-visual-box">
					<div class="pixel-art-frame">
						{#if $game.gameData.enemy.statistics?.imagePath}
							<img src={$game.gameData.enemy.statistics.imagePath} alt={$game.gameData.enemy.name} 
								 on:error={(e) => e.currentTarget.src = 'images/enemies/unknown.svg'} />
						{:else}
							<div class="placeholder-icon">⚔️</div>
						{/if}
					</div>
					<div class="enemy-stats-mini">
						<div class="mini-stat"><span>ATK</span> <strong>{$game.gameData.enemy.statistics?.physicalDamage || $game.gameData.enemy.statistics?.magicDamage || 0}</strong></div>
						<div class="mini-stat"><span>DEF</span> <strong>{$game.gameData.enemy.statistics?.armorArmor || '0%'}</strong></div>
					</div>
				</div>

				<p class="enemy-desc">{$game.gameData.enemy.description || 'A dangerous foe blocks your path.'}</p>
				
				<div class="combat-actions">
					<button class="combat-start-btn" on:click={() => emitAnswer("I'll engage in combat!")}>
						INITIALIZE COMBAT PROTOCOL
					</button>
					<button class="combat-flee-btn" on:click={() => emitAnswer("I'll try to retreat.")}>
						ATTEMPT RETREAT
					</button>
				</div>
			</div>
			<!-- Loot Screen -->
		{:else if $game.gameData.event?.lootMode}
			<Loot on:emittedAnswer={handleEmittedAnswer} />
			<!-- Shop Mode - Show BOTH choices and shop -->
		{:else if $game.gameData.event?.shopMode}
			<div class="shop-layout">
				<!-- Choices on top -->
				<PickChoice on:emittedAnswer={handleEmittedAnswer} />
				<!-- Shop items below -->
				<Shop />
			</div>
			<!-- Normal Mode - Just choices -->
		{:else if $game.gameData.event}
			<PickChoice on:emittedAnswer={handleEmittedAnswer} />
		{/if}
	</div>
{/if}

<style>
	.ui-mid {
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--space-md);
	}

	.combat-encounter-placeholder {
		width: 100%;
		background: rgba(20, 10, 10, 0.6);
		border: 1px solid rgba(255, 62, 62, 0.3);
		border-radius: 24px;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 62, 62, 0.1);
	}

	.encounter-header {
		text-align: center;
	}

	.encounter-label {
		font-size: 0.7rem;
		font-weight: 900;
		color: #ff3e3e;
		letter-spacing: 0.3em;
		display: block;
		margin-bottom: 0.5rem;
	}

	.encounter-header h2 {
		font-size: 1.8rem;
		font-weight: 800;
		color: #fff;
		margin: 0;
		text-shadow: 0 0 15px rgba(255, 62, 62, 0.3);
	}

	.enemy-visual-box {
		display: flex;
		gap: 2rem;
		align-items: center;
		justify-content: center;
	}

	.pixel-art-frame {
		width: 120px;
		height: 120px;
		background: rgba(0, 0, 0, 0.4);
		border: 2px solid rgba(255, 255, 255, 0.1);
		border-radius: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		position: relative;
	}

	.pixel-art-frame img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		image-rendering: pixelated;
	}

	.placeholder-icon {
		font-size: 3rem;
		opacity: 0.5;
	}

	.enemy-stats-mini {
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}

	.mini-stat {
		background: rgba(255, 255, 255, 0.05);
		padding: 8px 15px;
		border-radius: 10px;
		font-size: 0.8rem;
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		min-width: 100px;
	}

	.mini-stat span { color: var(--text-dim); font-weight: 600; }
	.mini-stat strong { color: #ff3e3e; font-weight: 800; }

	.enemy-desc {
		font-size: 0.95rem;
		line-height: 1.6;
		color: var(--text-dim);
		text-align: center;
		margin: 0;
		font-style: italic;
	}

	.combat-actions {
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}

	.combat-start-btn {
		background: #ff3e3e;
		color: #000;
		border: none;
		padding: 1.2rem;
		border-radius: 16px;
		font-weight: 900;
		font-size: 0.85rem;
		letter-spacing: 0.1em;
		cursor: pointer;
		transition: all 0.3s;
	}

	.combat-start-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 5px 20px rgba(255, 62, 62, 0.4);
		filter: brightness(1.1);
	}

	.combat-flee-btn {
		background: rgba(255, 255, 255, 0.05);
		color: #fff;
		border: 1px solid rgba(255, 255, 255, 0.1);
		padding: 1rem;
		border-radius: 16px;
		font-weight: 700;
		font-size: 0.8rem;
		cursor: pointer;
		transition: all 0.3s;
	}

	.combat-flee-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: #fff;
	}

	.shop-layout {
		display: grid;
		grid-template-columns: 60% 1fr;
		gap: var(--space-md);
		width: 100%;
	}

	/* Responsive: Stack on smaller screens */
	@media (max-width: 768px) {
		.shop-layout {
			grid-template-columns: 1fr;
		}
		.enemy-visual-box {
			flex-direction: column;
			gap: 1rem;
		}
		.mini-stat {
			min-width: 150px;
		}
	}

	::placeholder {
		color: #aaa;
	}
</style>
