<script lang="ts">
	import { game } from '../../../stores'
	import { misc } from '../../../stores'
	import { ui } from '../../../stores'
	import { gameState } from '../../../stores'
	import { createEventDispatcher } from 'svelte'
	import { fade, fly, scale } from 'svelte/transition'
	import { backOut, cubicOut } from 'svelte/easing'

	const dispatch = createEventDispatcher()
	let delay: number = 0

	function emitAnswer(answer: any) {
		if (!answer) return
		dispatch('emittedAnswer', { answer })
		delay = 0 
	}

	function emitInteractiveAnswer(answer: any) {
		if (!answer) return
		if (answer.toLowerCase().includes('sex') || answer.toLowerCase().includes('kill')) {
			$ui.errorWarnMsg = "There's a flawed word in your answer."
			return
		}

		if ($misc.interactivePoints == 0) {
			$ui.errorWarnMsg = '0 chat points left. Buy from merchants or win battles.'
			return
		}
		$misc.interactivePoints -= 1

		dispatch('emittedAnswer', { answer })
		delay = 0 
	}

	function movePlayer(dx: number, dy: number) {
		if (!$gameState.player) return;
		const newX = Math.max(0, Math.min(19, $gameState.player.x + dx));
		const newY = Math.max(0, Math.min(19, $gameState.player.y + dy));
		
		if (newX !== $gameState.player.x || newY !== $gameState.player.y) {
			$gameState.player.x = newX;
			$gameState.player.y = newY;
			
			const dir = dx > 0 ? "east" : dx < 0 ? "west" : dy > 0 ? "south" : "north";
			emitAnswer(`I'll move ${dir}.`);
		}
	}
</script>

<div
	class="choices-panel glass-container"
	in:fade={{ duration: 400 }}
	out:scale={{ duration: 300, start: 0.95 }}
>
	<!-- Choice Buttons -->
	<div class="choices-list">
		{#each $game.gameData.choices as choice, i}
			<button
				class="choice-btn glass-button"
				disabled={$misc.loading}
				in:fly={{ y: 20, duration: 500, delay: i * 100, easing: cubicOut }}
				out:fly={{ x: -20, duration: 300, delay: i * 60 }}
				on:click={() => emitAnswer(choice)}
			>
				<span class="choice-text">{choice}</span>
			</button>
		{/each}
	</div>

	<!-- Custom Input & Navigation -->
	<div class="input-controls-container">
		<!-- Navigation D-PAD -->
		<div class="d-pad">
			<button class="nav-btn up" on:click={() => movePlayer(0, -1)} title="Move North">▲</button>
			<div class="nav-row">
				<button class="nav-btn left" on:click={() => movePlayer(-1, 0)} title="Move West">◀</button>
				<button class="nav-btn down" on:click={() => movePlayer(0, 1)} title="Move South">▼</button>
				<button class="nav-btn right" on:click={() => movePlayer(1, 0)} title="Move East">▶</button>
			</div>
		</div>

		<div
			class="custom-input glass-input-group"
		>
			<div class="input-wrapper">
				<input
					type="text"
					placeholder="Enter custom action..."
					bind:value={$misc.query}
					on:keydown={(e) => e.key === 'Enter' && emitInteractiveAnswer($misc.query)}
					class="glass-input-field"
				/>
			</div>
			<button
				class="submit-btn glass-submit-btn"
				disabled={$misc.loading || !$misc.query}
				on:click={() => emitInteractiveAnswer($misc.query)}
			>
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
				</svg>
			</button>
		</div>
	</div>
</div>

<style>
	.choices-panel {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
		padding: 1.5rem;
		background: rgba(10, 10, 15, 0.4); 
		backdrop-filter: blur(40px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 16px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
	}

	.choices-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.choice-btn {
		width: 100%;
		padding: 1rem;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
		color: #e0e0e0;
		font-size: 1rem;
	}

	.choice-btn:hover:not(:disabled) {
		background: rgba(0, 242, 255, 0.08);
		border-color: #00f2ff;
		transform: translateX(5px);
	}

	.choice-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.input-controls-container {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-top: 0.5rem;
	}

	.d-pad {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
	}

	.nav-row {
		display: flex;
		gap: 2px;
	}

	.nav-btn {
		width: 32px;
		height: 32px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 6px;
		color: #00f2ff;
		font-size: 0.8rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}

	.nav-btn:hover {
		background: rgba(0, 242, 255, 0.2);
		border-color: #00f2ff;
	}

	.custom-input {
		flex: 1;
		display: flex;
		gap: 0.5rem;
		padding: 4px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
	}

	.input-wrapper {
		flex: 1;
		padding-left: 12px;
		display: flex;
		align-items: center;
	}

	.glass-input-field {
		width: 100%;
		background: transparent;
		border: none;
		outline: none;
		color: #e0e0e0;
		font-size: 0.95rem;
	}

	.submit-btn {
		width: 40px;
		height: 40px;
		background: linear-gradient(135deg, #00f2ff, #7000ff);
		border: none;
		border-radius: 8px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
	}

	.submit-btn:disabled {
		opacity: 0.3;
	}
</style>
