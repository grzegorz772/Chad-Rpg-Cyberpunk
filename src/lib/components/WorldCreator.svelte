<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { fade, fly } from 'svelte/transition'
	import { cubicOut } from 'svelte/easing'
	
	const dispatch = createEventDispatcher()
	
	let userPrompt = ''
	let isGenerating = false
	let generatedWorldPrompt = ''
	let error = ''
	
	const suggestions = [
		'Cyberpunk with dinosaurs',
		'Space horror',
		'Victorian Steampunk',
		'Post-apocalypse magic',
		'Cities in the clouds'
	]
	
	async function generateWorld() {
		if (!userPrompt.trim()) {
			error = 'Enter world description'
			return
		}
		
		isGenerating = true
		error = ''
		
		try {
			const response = await fetch('/api/generate-world', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					prompt: userPrompt,
					type: 'world_generation'
				})
			})
			
			if (!response.ok) throw new Error('Generation failed')
			
			const data = await response.json()
			generatedWorldPrompt = data.worldPrompt
		} catch (err) {
			error = 'Failed to generate world. Try again.'
		} finally {
			isGenerating = false
		}
	}
	
	async function generateStaticWorld() {
		if (!userPrompt.trim()) {
			error = 'Enter world description'
			return
		}
		
		isGenerating = true
		error = ''
		
		try {
			const response = await fetch('/api/generate-world', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					prompt: userPrompt,
					type: 'static_world_generation'
				})
			})
			
			if (!response.ok) throw new Error('Generation failed')
			
			const data = await response.json()
			generatedWorldPrompt = data.worldPrompt
		} catch (err) {
			error = 'Failed to generate world. Try again.'
		} finally {
			isGenerating = false
		}
	}
	
	function acceptWorld() {
		dispatch('worldCreated', { worldPrompt: generatedWorldPrompt })
	}
	
	function regenerate() {
		generatedWorldPrompt = ''
		generateWorld()
	}
	
	function useSuggestion(suggestion: string) {
		userPrompt = suggestion
	}
</script>

<div class="world-creator" transition:fade={{ duration: 600 }}>
	<!-- Breathing Liquid Gradient Background -->
	<div class="liquid-bg">
		<div class="blob blob-primary"></div>
		<div class="blob blob-secondary"></div>
	</div>

	<div class="glass-content" in:fly={{ y: 30, duration: 800, easing: cubicOut }}>
		<header class="creator-header">
			<div class="header-main">
				<h2 class="title">COSMOS ARCHITECT</h2>
				<div class="badge">SYSTEM READY</div>
			</div>
			<p class="subtitle">Define the parameters of your reality.</p>
		</header>

		<div class="layout-main">
			{#if !generatedWorldPrompt}
				<div class="input-area" in:fade={{ duration: 400 }}>
					<div class="field-group">
						<label for="world-prompt">FOUNDATION PROMPT</label>
						<textarea
							id="world-prompt"
							bind:value={userPrompt}
							placeholder="Describe your universe..."
							class="glass-textarea"
							rows="4"
						></textarea>
					</div>

					<div class="suggestions-container">
						<span class="label">SEED IDEAS</span>
						<div class="tags">
							{#each suggestions as suggestion}
								<button class="tag" on:click={() => useSuggestion(suggestion)}>
									{suggestion}
								</button>
							{/each}
						</div>
					</div>

					{#if error}
						<div class="error-box">
							<span class="icon">⚠</span>
							<p>{error}</p>
						</div>
					{/if}

					<div class="action-grid">
						<button 
							class="glass-btn primary" 
							on:click={generateWorld}
							disabled={isGenerating || !userPrompt.trim()}
						>
							<div class="btn-inner">
								{#if isGenerating}
									<span class="loading-spinner"></span>
									<span>COMPUTING...</span>
								{:else}
									<span class="icon">✨</span>
									<span>AI SYNTHESIS</span>
								{/if}
							</div>
						</button>

						<button 
							class="glass-btn secondary" 
							on:click={generateStaticWorld}
							disabled={isGenerating || !userPrompt.trim()}
						>
							<div class="btn-inner">
								<span class="icon">⚡</span>
								<span>STATIC LOAD</span>
							</div>
						</button>
					</div>
				</div>
			{:else}
				<div class="result-area" in:fade={{ duration: 400 }}>
					<div class="protocol-card">
						<div class="card-header">
							<span class="tag">OUTPUT PROTOCOL</span>
							<span class="status online">STABLE</span>
						</div>
						
						<div class="scroll-container">
							<p class="prompt-text">{generatedWorldPrompt}</p>
						</div>

						<div class="card-footer">
							<div class="meta-item">
								<span class="label">SOURCE:</span>
								<span class="value">NEURAL_GEN_V2</span>
							</div>
							<div class="meta-item">
								<span class="label">TYPE:</span>
								<span class="value">{userPrompt.slice(0, 20)}...</span>
							</div>
						</div>
					</div>

					<div class="action-grid">
						<button class="glass-btn secondary" on:click={regenerate}>
							<div class="btn-inner">
								<span class="icon">↺</span>
								<span>RE-GENERATE</span>
							</div>
						</button>
						
						<button class="glass-btn success" on:click={acceptWorld}>
							<div class="btn-inner">
								<span class="icon">▶</span>
								<span>INITIALIZE WORLD</span>
							</div>
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	:root {
		--glass-bg: rgba(255, 255, 255, 0.03);
		--glass-border: rgba(255, 255, 255, 0.1);
		--accent-primary: #00f2ff;
		--accent-secondary: #7000ff;
		--success: #00ffaa;
		--text-main: #e0e0e0;
		--text-dim: rgba(224, 224, 224, 0.5);
	}

	.world-creator {
		position: relative;
		width: 100%;
		min-height: 400px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: var(--text-main);
		font-family: 'Inter', system-ui, sans-serif;
		overflow: hidden;
		border-radius: 24px;
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
		animation: swirl 12s infinite linear;
		mix-blend-mode: screen;
	}

	.blob-primary {
		width: min(450px, 70vw);
		height: min(450px, 70vw);
		background: var(--accent-primary);
		top: -10%;
		left: -10%;
		animation-duration: 9s;
	}

	.blob-secondary {
		width: min(400px, 60vw);
		height: min(400px, 60vw);
		background: var(--accent-secondary);
		bottom: -10%;
		right: -10%;
		animation-duration: 14s;
		animation-delay: -3s;
		animation-direction: reverse;
	}

	@keyframes swirl {
		0% { transform: translate(0, 0) rotate(0deg) scale(1); }
		33% { transform: translate(10%, 15%) rotate(120deg) scale(1.1); }
		66% { transform: translate(-15%, 5%) rotate(240deg) scale(0.9); }
		100% { transform: translate(0, 0) rotate(360deg) scale(1); }
	}

	/* Content Container */
	.glass-content {
		position: relative;
		z-index: 10;
		width: 100%;
		max-width: 800px;
		background: rgba(10, 10, 15, 0.3);
		backdrop-filter: blur(20px);
		border: 1px solid var(--glass-border);
		border-radius: 32px;
		padding: 2.5rem;
		box-sizing: border-box;
	}

	.creator-header {
		margin-bottom: 2rem;
	}

	.header-main {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 0.5rem;
	}

	.title {
		font-size: 1.8rem;
		font-weight: 800;
		letter-spacing: -0.02em;
		margin: 0;
		background: linear-gradient(to right, #fff, #aaa);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.badge {
		font-size: 0.65rem;
		font-weight: 700;
		padding: 0.2rem 0.6rem;
		background: rgba(0, 242, 255, 0.1);
		color: var(--accent-primary);
		border-radius: 20px;
		font-family: monospace;
	}

	.subtitle {
		font-size: 0.95rem;
		color: var(--text-dim);
		margin: 0;
	}

	/* Form Elements */
	.field-group {
		margin-bottom: 1.5rem;
	}

	.field-group label {
		display: block;
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--text-dim);
		margin-bottom: 0.8rem;
		letter-spacing: 0.1em;
	}

	.glass-textarea {
		width: 100%;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid var(--glass-border);
		border-radius: 16px;
		padding: 1rem;
		color: white;
		font-family: inherit;
		font-size: 1rem;
		resize: none;
		transition: all 0.3s;
		box-sizing: border-box;
	}

	.glass-textarea:focus {
		outline: none;
		border-color: rgba(255, 255, 255, 0.3);
		background: rgba(255, 255, 255, 0.06);
	}

	.suggestions-container {
		margin-bottom: 2rem;
	}

	.suggestions-container .label {
		font-size: 0.7rem;
		color: var(--text-dim);
		display: block;
		margin-bottom: 0.8rem;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
	}

	.tag {
		background: var(--glass-bg);
		border: 1px solid var(--glass-border);
		padding: 0.4rem 0.8rem;
		border-radius: 12px;
		color: var(--text-dim);
		font-size: 0.8rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.tag:hover {
		background: rgba(255, 255, 255, 0.08);
		color: white;
		border-color: rgba(255, 255, 255, 0.2);
	}

	/* Buttons */
	.action-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.glass-btn {
		background: var(--glass-bg);
		border: 1px solid var(--glass-border);
		border-radius: 16px;
		padding: 1rem;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		color: white;
		font-weight: 600;
	}

	.glass-btn:hover:not(:disabled) {
		transform: translateY(-2px);
		border-color: rgba(255, 255, 255, 0.2);
		background: rgba(255, 255, 255, 0.08);
	}

	.glass-btn.primary {
		background: linear-gradient(135deg, rgba(0, 242, 255, 0.1), rgba(112, 0, 255, 0.1));
		border-color: rgba(0, 242, 255, 0.2);
	}

	.glass-btn.success {
		background: rgba(0, 255, 170, 0.1);
		border-color: rgba(0, 255, 170, 0.3);
		color: var(--success);
	}

	.btn-inner {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.8rem;
	}

	.glass-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	/* Result Protocol Card */
	.protocol-card {
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid var(--glass-border);
		border-radius: 20px;
		padding: 1.5rem;
		margin-bottom: 2rem;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 1.5rem;
	}

	.status.online {
		color: var(--success);
		font-size: 0.7rem;
		font-weight: 800;
		letter-spacing: 0.1em;
	}

	.scroll-container {
		max-height: 200px;
		overflow-y: auto;
		margin-bottom: 1.5rem;
		padding-right: 1rem;
	}

	.prompt-text {
		font-size: 1rem;
		line-height: 1.6;
		margin: 0;
		color: rgba(255, 255, 255, 0.9);
	}

	.card-footer {
		display: flex;
		gap: 2rem;
		padding-top: 1rem;
		border-top: 1px solid var(--glass-border);
	}

	.meta-item {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.meta-item .label {
		font-size: 0.6rem;
		color: var(--text-dim);
		font-weight: 700;
	}

	.meta-item .value {
		font-size: 0.75rem;
		font-family: monospace;
		color: var(--accent-primary);
	}

	/* Utils */
	.error-box {
		background: rgba(255, 50, 50, 0.1);
		border: 1px solid rgba(255, 50, 50, 0.2);
		border-radius: 12px;
		padding: 1rem;
		display: flex;
		align-items: center;
		gap: 0.8rem;
		margin-bottom: 1.5rem;
		color: #ff8888;
	}

	.error-box p { margin: 0; font-size: 0.9rem; }

	.loading-spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.1);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	@media (max-width: 600px) {
		.action-grid { grid-template-columns: 1fr; }
		.glass-content { padding: 1.5rem; }
	}
</style>
