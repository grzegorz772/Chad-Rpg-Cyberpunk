<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { fade, fly } from 'svelte/transition'
	
	const dispatch = createEventDispatcher()
	
	let userPrompt = ''
	let isGenerating = false
	let generatedWorldPrompt = ''
	let error = ''
	
	// Przykładowe sugestie
	const suggestions = [
		'cyberpunk z dinozaurami',
		'horror w kosmosie',
		'steampunk w epoce wiktoriańskiej',
		'post-apokalipsa z magią',
		'świat, gdzie ludzie żyją w chmurach'
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
			console.error(err)
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

<div class="world-creator" transition:fade={{ duration: 400 }}>
	<!-- Cyberpunk Effects (takie same jak w innych ekranach) -->
	<div class="grid-overlay"></div>
	<div class="glitch-overlay"></div>
	
	<!-- Neon Header -->
	<div class="neon-header">
		<div class="corner top-left"></div>
		<div class="corner top-right"></div>
		<div class="corner bottom-left"></div>
		<div class="corner bottom-right"></div>
		
		<div class="cyber-title">
			<div class="title-glitch" data-text="WORLD CREATOR">WORLD CREATOR</div>
			<div class="title-sub">// GENERATE CUSTOM UNIVERSE //</div>
		</div>
	</div>
	
	<!-- Główny kontener -->
	<div class="creator-container" in:fly={{ y: 20, duration: 600 }}>
		
		{#if !generatedWorldPrompt}
			<!-- Krok 1: Wpisz pomysł -->
			<div class="input-section">
				<label for="world-prompt">DESCRIBE YOUR WORLD</label>
				<textarea
					id="world-prompt"
					bind:value={userPrompt}
					placeholder="e.g., dark fantasy with lovecraftian horror, or cyberpunk world where dinosaurs never went extinct..."
					class="world-input"
					rows="4"
				></textarea>
				
				<!-- Sugestie -->
				<div class="suggestions">
					<span class="suggestions-label">SUGGESTIONS:</span>
					<div class="suggestion-tags">
						{#each suggestions as suggestion}
							<button 
								class="suggestion-tag"
								on:click={() => useSuggestion(suggestion)}
							>
								{suggestion}
							</button>
						{/each}
					</div>
				</div>
				
				{#if error}
					<div class="error-message">⚠ {error}</div>
				{/if}
				
				<button 
					class="generate-btn" 
					on:click={generateWorld}
					disabled={isGenerating || !userPrompt.trim()}
				>
					{#if isGenerating}
						<span class="btn-text">GENERATING</span>
						<span class="loading-dots">...</span>
					{:else}
						<span class="btn-text">GENERATE WORLD</span>
						<span class="btn-icon">→</span>
					{/if}
				</button>
			</div>
		{:else}
			<!-- Krok 2: Podgląd wygenerowanego świata -->
			<div class="result-section">
				<div class="result-header">
					<span class="header-icon">◈</span>
					<span class="header-text">WORLD PROTOCOL GENERATED</span>
					<span class="header-icon">◈</span>
				</div>
				
				<div class="world-prompt-display">
					<p class="prompt-text">{generatedWorldPrompt}</p>
				</div>
				
				<div class="world-stats">
					<div class="stat-item">
						<span class="stat-label">STATUS:</span>
						<span class="stat-value online">READY</span>
					</div>
					<div class="stat-item">
						<span class="stat-label">TYPE:</span>
						<span class="stat-value">{userPrompt.toUpperCase()}</span>
					</div>
				</div>
				
				<div class="action-buttons">
					<button class="secondary-btn" on:click={regenerate}>
						<span class="btn-icon">↺</span>
						REGENERATE
					</button>
					
					<button class="primary-btn" on:click={acceptWorld}>
						<span class="btn-text">ACCEPT WORLD</span>
						<span class="btn-icon">▶</span>
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.world-creator {
		position: relative;
		width: 100%;
		min-height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20px;
		color: #00ffff;
		font-family: 'Share Tech Mono', 'Courier New', monospace;
		background: #0a0a0f;
		box-sizing: border-box;
	}
	
	/* Overlay - kopiuj z poprzednich komponentów */
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
	
	/* Neon Header - kopiuj z poprzednich */
	.neon-header {
		position: relative;
		width: 100%;
		max-width: 700px;
		margin-bottom: 20px;
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
		font-size: 2.2rem;
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
		font-size: 0.8rem;
		color: #ff00ff;
		margin-top: 5px;
		letter-spacing: 2px;
	}
	
	/* Główny kontener */
	.creator-container {
		width: 100%;
		max-width: 700px;
		display: flex;
		flex-direction: column;
		gap: 20px;
		padding: 30px;
		margin-bottom: 20px;
		border: 1px solid #00ffff;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(5px);
		box-shadow: 0 0 30px rgba(0, 255, 255, 0.2);
		position: relative;
		z-index: 10;
		box-sizing: border-box;
	}
	
	/* Input section */
	.input-section {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	
	.input-section label {
		font-size: 0.9rem;
		color: #ff00ff;
		letter-spacing: 2px;
	}
	
	.world-input {
		background: rgba(0, 0, 0, 0.5);
		border: 1px solid #00ffff;
		padding: 15px;
		font-size: 1rem;
		color: #00ffff;
		font-family: inherit;
		resize: vertical;
		outline: none;
		transition: all 0.2s ease;
	}
	
	.world-input:focus {
		border-color: #ff00ff;
		box-shadow: 0 0 20px #ff00ff;
	}
	
	.world-input::placeholder {
		color: rgba(0, 255, 255, 0.3);
	}
	
	/* Sugestie */
	.suggestions {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	
	.suggestions-label {
		font-size: 0.8rem;
		color: rgba(0, 255, 255, 0.6);
	}
	
	.suggestion-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}
	
	.suggestion-tag {
		background: transparent;
		border: 1px solid #00ffff;
		padding: 6px 12px;
		color: #00ffff;
		font-size: 0.8rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}
	
	.suggestion-tag:hover {
		background: #00ffff;
		color: #000;
		box-shadow: 0 0 15px #00ffff;
	}
	
	/* Error message */
	.error-message {
		color: #ff00ff;
		font-size: 0.9rem;
		padding: 10px;
		border: 1px solid #ff00ff;
		background: rgba(255, 0, 255, 0.1);
	}
	
	/* Generate button */
	.generate-btn {
		background: transparent;
		border: 1px solid #00ffff;
		padding: 15px;
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
		margin-top: 10px;
	}
	
	.generate-btn:hover:not(:disabled) {
		background: #00ffff;
		color: #000;
		box-shadow: 0 0 30px #00ffff;
	}
	
	.generate-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	
	.loading-dots {
		animation: blink 1s infinite;
	}
	
	/* Result section */
	.result-section {
		display: flex;
		flex-direction: column;
		gap: 25px;
	}
	
	.result-header {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 15px;
		color: #ff00ff;
	}
	
	.world-prompt-display {
		padding: 20px;
		border: 1px solid #00ffff;
		background: rgba(0, 255, 255, 0.05);
	}
	
	.prompt-text {
		color: #00ffff;
		font-size: 1rem;
		line-height: 1.6;
		margin: 0;
	}
	
	.world-stats {
		display: flex;
		justify-content: space-between;
		padding: 15px;
		border: 1px solid #00ffff;
		background: rgba(0, 0, 0, 0.5);
	}
	
	.stat-item {
		display: flex;
		gap: 10px;
	}
	
	.stat-label {
		color: #ff00ff;
	}
	
	.stat-value {
		color: #00ffff;
	}
	
	.stat-value.online {
		color: #00ff00;
		text-shadow: 0 0 10px #00ff00;
	}
	
	.action-buttons {
		display: flex;
		gap: 15px;
	}
	
	.primary-btn, .secondary-btn {
		flex: 1;
		padding: 15px;
		font-size: 1rem;
		font-weight: bold;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		transition: all 0.3s ease;
		text-transform: uppercase;
		letter-spacing: 1px;
	}
	
	.primary-btn {
		background: transparent;
		border: 1px solid #00ffff;
		color: #00ffff;
	}
	
	.primary-btn:hover {
		background: #00ffff;
		color: #000;
		box-shadow: 0 0 30px #00ffff;
	}
	
	.secondary-btn {
		background: transparent;
		border: 1px solid #ff00ff;
		color: #ff00ff;
	}
	
	.secondary-btn:hover {
		background: #ff00ff;
		color: #000;
		box-shadow: 0 0 30px #ff00ff;
	}
	
	@keyframes blink {
		0%, 50% { opacity: 1; }
		51%, 100% { opacity: 0; }
	}
	
	/* Responsive */
	@media (max-width: 600px) {
		.title-glitch {
			font-size: 1.6rem;
		}
		
		.action-buttons {
			flex-direction: column;
		}
	}
</style>