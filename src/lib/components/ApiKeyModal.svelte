<script lang="ts">
	import { googleApiKey } from '../../stores';
	import { fade, scale } from 'svelte/transition';

	let inputValue = '';
	let show = false;

	$: if (!$googleApiKey) {
		show = true;
	} else {
		show = false;
	}

	function saveKey() {
		if (inputValue.trim()) {
			$googleApiKey = inputValue.trim();
			show = false;
		}
	}
</script>

{#if show}
	<div class="api-modal-overlay" transition:fade>
		<div class="glass-modal api-modal" transition:scale>
			<h2>GOOGLE AI API KEY REQUIRED</h2>
			<p>To use AI features on GitHub Pages, please enter your personal API Key. Your key is stored locally in your browser and never sent elsewhere.</p>
			
			<div class="input-group">
				<input 
					type="password" 
					bind:value={inputValue} 
					placeholder="AIzaSy..." 
					class="api-input"
				/>
				<button class="save-btn" on:click={saveKey} disabled={!inputValue.trim()}>
					SAVE KEY
				</button>
			</div>
			
			<p class="help-text">
				Don't have a key? Get one for free at 
				<a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
					Google AI Studio
				</a>
			</p>
		</div>
	</div>
{/if}

<style>
	.api-modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.9);
		backdrop-filter: blur(20px);
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.api-modal {
		max-width: 500px;
		width: 100%;
		border: 1px solid var(--accent-primary);
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
		margin: 2rem 0;
	}

	.api-input {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		padding: 1rem;
		border-radius: 12px;
		color: white;
		font-family: monospace;
	}

	.save-btn {
		background: var(--accent-primary);
		color: black;
		border: none;
		padding: 1rem;
		border-radius: 12px;
		font-weight: 800;
		cursor: pointer;
	}

	.save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

	.help-text { font-size: 0.8rem; color: var(--text-dim); }
	.help-text a { color: var(--accent-primary); text-decoration: none; }
</style>
