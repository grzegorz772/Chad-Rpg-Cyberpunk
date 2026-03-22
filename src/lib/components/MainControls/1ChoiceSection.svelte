<script lang="ts">
	import { game } from '../../../stores'
	import { misc } from '../../../stores'
	import { ui } from '../../../stores'

	import { createEventDispatcher } from 'svelte'
	import { fade, fly, scale } from 'svelte/transition'
	import { backOut, cubicOut } from 'svelte/easing' // Added cubicOut for smoother fly

	const dispatch = createEventDispatcher()

	// Delay is still used, keep it
	let delay: number = 0

	function emitAnswer(answer: any) {
		if (!answer) return
		dispatch('emittedAnswer', { answer })
		delay = 0 // Reset delay for next set of choices
	}

	function emitInteractiveAnswer(answer: any) {
		if (!answer) return
		if (answer.includes('sex') || answer.includes('kill')) {
			$ui.errorWarnMsg = "There's a flawed word in your answer."
			return
		}

		if ($misc.interactivePoints == 0) {
			$ui.errorWarnMsg = '0 chat points left. Buy from merchants or win battles.'
			return
		}
		$misc.interactivePoints -= 1

		dispatch('emittedAnswer', { answer })
		delay = 0 // Reset delay
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

	<!-- Custom Input -->
	{#if $game.gameData.choices?.length >= 1}
		<div
			class="custom-input glass-input-group"
			in:fly={{ y: 20, duration: 500, delay: $game.gameData.choices.length * 100, easing: cubicOut }}
			out:fade={{ duration: 300 }}
		>
			<div class="input-wrapper">
				<input
					type="text"
					placeholder="Enter custom action..."
					bind:value={$misc.query}
					on:keydown={(e) => e.key === 'Enter' && emitInteractiveAnswer($misc.query)}
					class="glass-input-field"
				/>
				<span class="points-badge glass-badge">{$misc.interactivePoints}</span>
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
	{/if}
</div>

<style>
	/* Inherit root variables from parent components or define here if not */
	:root {
		--glass-bg: rgba(255, 255, 255, 0.03);
		--glass-border: rgba(255, 255, 255, 0.1);
		--accent-primary: #00f2ff;
		--accent-secondary: #7000ff;
		--text-main: #e0e0e0;
		--text-dim: rgba(224, 224, 224, 0.5);
		--success: #00ffaa;
		--gold-color: #f5b042;

		--space-xs: 0.25rem; /* 4px */
		--space-sm: 0.5rem;  /* 8px */
		--space-md: 1rem;    /* 16px */
		--space-lg: 1.5rem;  /* 24px */

		--radius-sm: 4px;
		--radius-md: 8px;
		--radius-lg: 16px;

		--transition-fast: 0.2s ease-out;
	}

	.choices-panel {
		background: none !important;
		border: none !important;
		padding: 0 !important;
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		width: 100%;
		padding: var(--space-lg);
		background: rgba(10, 10, 15, 0.4); /* Darker glass background */
		backdrop-filter: blur(40px);
		-webkit-backdrop-filter: blur(40px);
		border: 1px solid var(--glass-border);
		border-radius: var(--radius-lg);
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
		transition: box-shadow var(--transition-fast);
	}

	.choices-list {
		margin-bottom: 1rem;
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.choice-btn {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		width: 100%;
		padding: var(--space-md) var(--space-lg);
		background: var(--glass-bg);
		border: 1px solid var(--glass-border);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all var(--transition-fast);
		text-align: left;
		color: var(--text-main);
		font-size: 1rem;
		font-weight: 500;
		line-height: 1.4;
	}

	.choice-btn:hover:not(:disabled) {
		background: rgba(0, 242, 255, 0.08); /* Accent hover */
		border-color: var(--accent-primary);
		transform: translateX(5px);
		box-shadow: 0 0 15px rgba(0, 242, 255, 0.2);
	}

	.choice-btn:active:not(:disabled) {
		transform: translateX(2px) scale(0.99);
		background: rgba(0, 242, 255, 0.15);
	}

	.choice-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
		filter: grayscale(1);
	}

	.choice-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 32px; /* Fixed width */
		height: 32px;
		background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
		border-radius: var(--radius-sm);
		font-size: 0.9rem;
		font-weight: 700;
		color: #1a1a1a; /* Dark text for contrast */
		flex-shrink: 0;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
	}

	.choice-text {
		padding: 1rem !important;
		flex: 1; /* Allows text to grow */
		color: var(--text-main);
	}

	/* Custom Input Group */
	.custom-input {
		display: flex;
		gap: var(--space-sm);
		padding: var(--space-xs);
		background: rgba(255, 255, 255, 0.05); /* Slightly lighter glass for input */
		border: 1px solid var(--glass-border);
		border-radius: var(--radius-lg);
		box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
	}

	.input-wrapper {
		flex: 1;
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: 0 var(--space-sm);
	}

	.glass-input-field {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		font-size: 1rem;
		color: var(--text-main);
		padding: var(--space-sm) 0;
	}

	.glass-input-field::placeholder {
		color: var(--text-dim);
	}

	.points-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 32px;
		height: 32px;
		padding: 0 var(--space-xs);
		background: var(--gold-color);
		border-radius: 16px; /* Pill shape */
		font-size: 0.75rem;
		font-weight: 700;
		color: #2c1a0a; /* Dark text for gold */
		flex-shrink: 0;
	}

	.submit-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
		border: none;
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all var(--transition-fast);
		flex-shrink: 0;
	}

	.submit-btn:hover:not(:disabled) {
		transform: scale(1.05);
		box-shadow: 0 0 20px rgba(0, 242, 255, 0.3);
	}

	.submit-btn:active:not(:disabled) {
		transform: scale(0.98);
	}

	.submit-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.submit-btn svg {
		color: white;
		stroke-width: 2.5; /* Slightly thicker icon stroke */
	}

	/* Responsive Adjustments */
	@media (max-width: 768px) {
		.choices-panel {
			padding: var(--space-md);
			gap: var(--space-sm);
		}

		.choice-btn {
			padding: var(--space-sm);
			gap: var(--space-sm);
			font-size: 0.9rem;
		}

		.choice-indicator {
			min-width: 28px;
			height: 28px;
			font-size: 0.8rem;
		}

		.custom-input {
			padding: var(--space-xs);
		}

		.glass-input-field {
			font-size: 0.9rem;
		}

		.points-badge {
			min-width: 28px;
			height: 28px;
			font-size: 0.7rem;
		}

		.submit-btn {
			width: 44px;
			height: 44px;
		}
	}

	@media (max-width: 480px) {
		.choices-panel {
			padding: var(--space-sm);
			gap: var(--space-xs);
		}

		.choice-btn {
			padding: var(--space-xs);
			gap: var(--space-xs);
			font-size: 0.8rem;
		}

		.choice-indicator {
			min-width: 24px;
			height: 24px;
			font-size: 0.7rem;
		}

		.custom-input {
			gap: var(--space-xs);
		}

		.input-wrapper {
			padding: 0 var(--space-xs);
		}

		.glass-input-field {
			font-size: 0.8rem;
			padding: var(--space-xs) 0;
		}

		.points-badge {
			min-width: 24px;
			height: 24px;
			font-size: 0.65rem;
		}

		.submit-btn {
			width: 38px;
			height: 38px;
		}
	}
</style>
