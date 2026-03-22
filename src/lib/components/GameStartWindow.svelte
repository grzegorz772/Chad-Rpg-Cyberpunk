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
	<div class="start-window" id="game-start-window" in:fly={{ y: 40, duration: 800, delay: 200, easing: elasticOut }}>
			{#if worldCreationMode}
				<div class="world-creator-wrapper" transition:fade={{ duration: 500, easing: cubicOut }}>
					<WorldCreator on:worldCreated={handleWorldCreated} />
					<button class="skip-btn" on:click={skipWorldCreation}>
						<span class="btn-text">SKIP TO STANDARD WORLD</span>
						<span class="btn-glow"></span>
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
				<!-- Dynamic Background Effects -->
				<div class="particles-bg"></div>
				<div class="scanlines"></div>
				
				<!-- Neon Header -->
				<div class="neon-header">
					<div class="corner top-left"></div>
					<div class="corner top-right"></div>
					<div class="corner bottom-left"></div>
					<div class="corner bottom-right"></div>
					
					<div class="cyber-title">
						<div class="title-glitch" data-text="ALYSSIUM">ALYSSIUM</div>
						<div class="title-sub">
							<span class="sub-glitch">// SYSTEM BOOT //</span>
							<span class="version">v.0.2.0-alpha</span>
						</div>
					</div>
				</div>

				<!-- Main Menu -->
				<div class="cyber-menu">
					<div class="menu-panel glass-effect">
						<div class="panel-header">
							<span class="header-icon pulse-icon">◈</span>
							<span class="header-text">// INTERFACE LOADED //</span>
							<span class="header-icon pulse-icon">◈</span>
						</div>

						<!-- Main Story Card -->
						<div class="menu-item available" tabindex="0" role="button" on:click={() => handleGameMode(getRandomValueFromArray([...medievalTavernStarter]))}>
							<div class="item-glow"></div>
							<div class="item-number">01</div>
							<div class="item-content">
								<div class="item-title">
									<span class="title-main">POINT ZERO</span>
									<span class="title-type">[Start Game]</span>
								</div>
								<div class="item-description">
									Initialize main story. Post-apocalyptic world simulation, unknown powers rule the world.
								</div>
								<div class="item-specs">
									<div class="spec">
										<span class="spec-icon">⚔️</span>
										<span class="spec-bar">
											<span class="spec-fill" style="width: 80%"></span>
										</span>
										<span class="spec-value">COMBAT 80%</span>
									</div>
									<div class="spec">
										<span class="spec-icon">🔮</span>
										<span class="spec-bar">
											<span class="spec-fill" style="width: 60%"></span>
										</span>
										<span class="spec-value">MAGIC 60%</span>
									</div>
									<div class="spec">
										<span class="spec-icon">💠</span>
										<span class="spec-bar">
											<span class="spec-fill" style="width: 90%"></span>
										</span>
										<span class="spec-value">TECH 90%</span>
									</div>
								</div>
							</div>
							<div class="item-status">
								<div class="status-light"></div>
								<span class="status-text">ACTIVE</span>
							</div>
							<div class="item-arrow">▶</div>
						</div>

						<!-- Locked Items -->
						<div class="menu-item locked">
							<div class="item-number">02</div>
							<div class="item-content">
								<div class="item-title">
									<span class="title-main">Configuration</span>
									<span class="title-type">[Settings]</span>
								</div>
								<div class="item-description">
									Set API Key, Local LLM, Volume and more
								</div>
								<div class="progress-bar">
									<div class="progress-fill" style="width: 87%"></div>
								</div>
							</div>
							<div class="item-status">
								<span class="status-text locked">COMING SOON</span>
							</div>
						</div>

						<div class="menu-item locked">
							<div class="item-number">03</div>
							<div class="item-content">
								<div class="item-title">
									<span class="title-main">Delete Program</span>
									<span class="title-type">[Quit]</span>
								</div>
								<div class="item-description">
									Quit Game
								</div>
							</div>
							<div class="item-status">
								<span class="status-text locked">LOCKED</span>
							</div>
						</div>
					</div>

					<!-- Right Panel - System Info -->
					<div class="system-panel glass-effect">
						<div class="panel-section">
							<div class="section-title">
								<span class="title-icon">📡</span>
								<span>SYSTEM INFO</span>
							</div>
							<div class="info-grid">
								<div class="info-row">
									<span class="info-label">USER:</span>
									<span class="info-value">Player_2v77k</span>
								</div>
								<div class="info-row">
									<span class="info-label">TIME:</span>
									<span class="info-value info-clock">22:47:13</span>
								</div>
								<script>
									function updateClock() {
										const now = new Date();
										const timeString = now.toLocaleTimeString('pl-PL', {
											hour: '2-digit',
											minute: '2-digit',
											second: '2-digit',
											hour12: false
										});
										const clockElement = document.querySelector('.info-clock');
										if (clockElement) clockElement.textContent = timeString;
									}
									updateClock();
									setInterval(updateClock, 1000);
								</script>
								<div class="info-row">
									<span class="info-label">DATE:</span>
									<span class="info-value">07-14-2077</span>
								</div>
								<div class="info-row">
									<span class="info-label">LOCATION:</span>
									<span class="info-value">Congregation City</span>
								</div>
							</div>
						</div>

						<div class="panel-section">
							<div class="section-title">
								<span class="title-icon">🌐</span>
								<span>NETWORK</span>
							</div>
							<div class="network-stats">
								<div class="stat">
									<span class="stat-name">Status</span>
									<span class="stat-value connected">CONNECTED</span>
								</div>
								<div class="stat">
									<span class="stat-name">DOWNLOAD</span>
									<span id="download" class="stat-value">4.7 Mbps</span>
								</div>
								<div class="stat">
									<span class="stat-name">PING</span>
									<span id="ping" class="stat-value">42 ms</span>
								</div>
							<script>
								let download = 4.7;
								let ping = 42;

								function clamp(value, min, max) {
									return Math.max(min, Math.min(max, value));
								}

								function updateStats() {
									const downloadDelta = (Math.random() - 0.5) * 1.2;
									const pingDelta = (Math.random() - 0.5) * 8;

									download = clamp(download + downloadDelta, 2.5, 10);
									ping = clamp(ping + pingDelta, 20, 120);

									const downloadEl = document.getElementById("download");
									const pingEl = document.getElementById("ping");
									if (downloadEl) downloadEl.textContent = download.toFixed(1) + " Mbps";
									if (pingEl) pingEl.textContent = Math.round(ping) + " ms";
								}

								function loop() {
									updateStats();
									setTimeout(loop, 1000 + Math.random() * 1000);
								}
								loop();
							</script>
							</div>
						</div>

						<div class="panel-section">
							<div class="section-title">
								<span class="title-icon">⚠</span>
								<span>ALERTS</span>
							</div>
							<div class="warning-message">
								<span class="warning-icon pulse-warning">⚠</span>
								<span class="warning-text">SOS Signal Received</span>
							</div>
							<div class="warning-message minor">
								<span class="warning-icon">!</span>
								<span class="warning-text">System integrity: 97.3%</span>
							</div>
						</div>

						<div class="panel-footer">
							<div class="footer-line">
								<span class="prompt">></span>
								<span class="command">Illusion is everywhere</span>
								<span class="cursor">_</span>
							</div>
						</div>
					</div>
				</div>

				<!-- Bottom Bar -->
				<div class="bottom-bar">
					<div class="bar-left">
						<span class="badge">Creator: Solemensis</span>
						<span class="badge">Author: Mateusz</span>
					</div>
					<div class="bar-center">
						<div class="pulse-dot"></div>
						<span>SYSTEM ONLINE // 127.0.0.1</span>
						<div class="pulse-dot"></div>
					</div>
					<div class="bar-right">
						<span class="badge warning-badge">⚠ 3 ALERTS</span>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	/* Globalne animowane tło */
	.start-overlay {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-md);
		background: linear-gradient(135deg, 
			#0a0a0f 0%,
			#1a0033 25%,
			#000033 50%,
			#0a0a2a 75%,
			#0a0a0f 100%);
		background-size: 400% 400%;
		animation: gradientFlow 20s ease infinite;
	}

	@keyframes gradientFlow {
		0% { background-position: 0% 50%; }
		50% { background-position: 100% 50%; }
		100% { background-position: 0% 50%; }
	}

	/* Particle background */
	.particles-bg {
		position: absolute;
		inset: 0;
		background-image: 
			radial-gradient(2px 2px at 20% 40%, rgba(0, 255, 255, 0.3), transparent),
			radial-gradient(1px 1px at 80% 70%, rgba(255, 0, 255, 0.3), transparent),
			radial-gradient(1.5px 1.5px at 45% 90%, rgba(0, 255, 255, 0.2), transparent);
		background-size: 200px 200px, 150px 150px, 100px 100px;
		background-repeat: no-repeat;
		animation: particleMove 30s linear infinite;
		pointer-events: none;
		z-index: 0;
	}

	@keyframes particleMove {
		0% { transform: translateY(0px); }
		100% { transform: translateY(-200px); }
	}

	/* Scanlines effect */
	.scanlines {
		position: absolute;
		inset: 0;
		background: repeating-linear-gradient(
			0deg,
			rgba(0, 0, 0, 0.1) 0px,
			rgba(0, 0, 0, 0.1) 1px,
			transparent 1px,
			transparent 2px
		);
		pointer-events: none;
		z-index: 1;
		animation: scanMove 8s linear infinite;
	}

	@keyframes scanMove {
		0% { transform: translateY(0); }
		100% { transform: translateY(100%); }
	}

	.start-window {
		width: min(95%, 1300px);
		max-height: 90vh;
		background: rgba(10, 10, 20, 0.6);
		backdrop-filter: blur(20px) saturate(180%);
		-webkit-backdrop-filter: blur(20px) saturate(180%);
		border: 1px solid rgba(0, 255, 255, 0.4);
		border-radius: 24px;
		box-shadow: 
			0 0 60px rgba(0, 255, 255, 0.2),
			0 0 120px rgba(255, 0, 255, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
		overflow: hidden;
		position: relative;
		transition: all 0.3s ease;
	}

	.start-window:hover {
		box-shadow: 
			0 0 80px rgba(0, 255, 255, 0.3),
			0 0 160px rgba(255, 0, 255, 0.15);
	}

	.start-content {
		position: relative;
		z-index: 10;
		padding: 30px;
		overflow-y: auto;
		overflow-x: hidden;
		max-height: 90vh;
		color: #00ffff;
		font-family: 'Share Tech Mono', 'Courier New', monospace;
	}

	/* Glass effect class */
	.glass-effect {
		background: rgba(10, 10, 20, 0.5);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(0, 255, 255, 0.2);
	}

	/* Neon Header */
	.neon-header {
		position: relative;
		margin-bottom: 30px;
		padding: 30px;
		background: linear-gradient(135deg, rgba(0, 255, 255, 0.05), rgba(255, 0, 255, 0.05));
		border: 1px solid rgba(0, 255, 255, 0.3);
		border-radius: 16px;
		box-shadow: 0 0 30px rgba(0, 255, 255, 0.2);
		overflow: hidden;
	}

	.corner {
		position: absolute;
		width: 30px;
		height: 30px;
		border-style: solid;
		border-color: #ff00ff;
	}

	.corner.top-left {
		top: 0;
		left: 0;
		border-width: 2px 0 0 2px;
	}

	.corner.top-right {
		top: 0;
		right: 0;
		border-width: 2px 2px 0 0;
	}

	.corner.bottom-left {
		bottom: 0;
		left: 0;
		border-width: 0 0 2px 2px;
	}

	.corner.bottom-right {
		bottom: 0;
		right: 0;
		border-width: 0 2px 2px 0;
	}

	.cyber-title {
		text-align: center;
	}

	.title-glitch {
		font-size: 5rem;
		font-weight: bold;
		color: #00ffff;
		text-shadow: 
			-3px -3px 0 #ff00ff,
			3px 3px 0 #00ffff;
		animation: glitchText 3s infinite;
		position: relative;
		letter-spacing: 8px;
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
		animation: glitchBefore 0.3s infinite;
		color: #ff00ff;
		z-index: -1;
	}

	.title-glitch::after {
		animation: glitchAfter 0.3s infinite;
		color: #00ffff;
		z-index: -2;
	}

	@keyframes glitchText {
		0%, 100% { transform: skew(0deg); }
		95% { transform: skew(0deg); }
		96% { transform: skew(3deg); }
		97% { transform: skew(-3deg); }
		98% { transform: skew(0deg); }
	}

	@keyframes glitchBefore {
		0%, 100% { transform: translate(0); opacity: 0.8; }
		10% { transform: translate(-3px, -2px); }
		20% { transform: translate(2px, 3px); }
		30% { transform: translate(0); }
	}

	@keyframes glitchAfter {
		0%, 100% { transform: translate(0); opacity: 0.8; }
		10% { transform: translate(3px, 2px); }
		20% { transform: translate(-2px, -3px); }
		30% { transform: translate(0); }
	}

	.title-sub {
		margin-top: 15px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 15px;
		font-size: 1rem;
		color: #ff00ff;
		letter-spacing: 2px;
	}

	.sub-glitch {
		animation: subGlitch 2s infinite;
	}

	.version {
		color: rgba(0, 255, 255, 0.6);
		font-size: 0.85rem;
	}

	@keyframes subGlitch {
		0%, 100% { opacity: 1; }
		95% { opacity: 1; }
		96% { opacity: 0.7; }
		97% { opacity: 1; }
	}

	/* Cyber Menu */
	.cyber-menu {
		display: grid;
		grid-template-columns: 1fr 320px;
		gap: 20px;
		margin-bottom: 20px;
	}

	.menu-panel,
	.system-panel {
		border: 1px solid rgba(0, 255, 255, 0.3);
		border-radius: 16px;
		overflow: hidden;
		transition: all 0.3s ease;
	}

	.menu-panel:hover,
	.system-panel:hover {
		border-color: rgba(0, 255, 255, 0.6);
		box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
	}

	.panel-header {
		padding: 15px 20px;
		background: linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1));
		border-bottom: 1px solid rgba(0, 255, 255, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 15px;
		color: #ff00ff;
		font-weight: bold;
		letter-spacing: 2px;
	}

	.header-icon {
		font-size: 1.2rem;
	}

	.pulse-icon {
		animation: iconPulse 2s infinite;
	}

	@keyframes iconPulse {
		0%, 100% { opacity: 0.6; }
		50% { opacity: 1; text-shadow: 0 0 10px currentColor; }
	}

	.menu-item {
		display: flex;
		align-items: center;
		gap: 20px;
		padding: 20px;
		border-bottom: 1px solid rgba(0, 255, 255, 0.1);
		position: relative;
		overflow: hidden;
		cursor: pointer;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.menu-item.available:hover {
		background: linear-gradient(90deg, rgba(0, 255, 255, 0.1), transparent);
		transform: translateX(12px);
		border-left: 3px solid #00ffff;
	}

	.menu-item.locked {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.item-glow {
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background: radial-gradient(circle, rgba(0, 255, 255, 0.15), transparent);
		opacity: 0;
		transition: opacity 0.5s;
		pointer-events: none;
	}

	.menu-item.available:hover .item-glow {
		opacity: 1;
	}

	.item-number {
		font-size: 2.5rem;
		font-weight: bold;
		color: #ff00ff;
		opacity: 0.4;
		min-width: 70px;
		text-align: right;
		font-family: monospace;
	}

	.item-content {
		flex: 1;
	}

	.item-title {
		display: flex;
		align-items: center;
		gap: 15px;
		margin-bottom: 8px;
		flex-wrap: wrap;
	}

	.title-main {
		font-size: 1.4rem;
		font-weight: bold;
		color: #00ffff;
		letter-spacing: 1px;
	}

	.title-type {
		font-size: 0.75rem;
		color: #ff00ff;
		padding: 3px 10px;
		border: 1px solid #ff00ff;
		border-radius: 20px;
	}

	.item-description {
		font-size: 0.85rem;
		color: rgba(0, 255, 255, 0.7);
		margin-bottom: 12px;
		line-height: 1.4;
	}

	.item-specs {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.spec {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 0.75rem;
	}

	.spec-icon {
		font-size: 0.9rem;
		min-width: 24px;
	}

	.spec-bar {
		flex: 1;
		height: 4px;
		background: rgba(0, 255, 255, 0.2);
		border-radius: 2px;
		overflow: hidden;
	}

	.spec-fill {
		display: block;
		height: 100%;
		background: linear-gradient(90deg, #00ffff, #ff00ff);
		border-radius: 2px;
		animation: fillBar 0.6s ease-out;
	}

	@keyframes fillBar {
		from { width: 0; }
		to { width: var(--width); }
	}

	.item-status {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 5px;
		min-width: 70px;
	}

	.status-light {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #00ff00;
		box-shadow: 0 0 10px #00ff00;
		animation: statusPulse 1.5s infinite;
	}

	@keyframes statusPulse {
		0%, 100% { opacity: 1; transform: scale(1); }
		50% { opacity: 0.5; transform: scale(0.8); }
	}

	.status-text {
		font-size: 0.7rem;
		color: #00ff00;
	}

	.status-text.locked {
		color: #ff6600;
	}

	.item-arrow {
		font-size: 1.2rem;
		color: #ff00ff;
		opacity: 0;
		transition: all 0.3s;
	}

	.menu-item.available:hover .item-arrow {
		opacity: 1;
		transform: translateX(5px);
	}

	.progress-bar {
		width: 180px;
		height: 3px;
		background: rgba(0, 255, 255, 0.2);
		border-radius: 2px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #00ffff, #ff00ff);
		border-radius: 2px;
	}

	/* System Panel */
	.system-panel {
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.panel-section {
		border-bottom: 1px solid rgba(0, 255, 255, 0.15);
		padding-bottom: 15px;
	}

	.section-title {
		color: #ff00ff;
		margin-bottom: 12px;
		font-size: 0.85rem;
		display: flex;
		align-items: center;
		gap: 8px;
		letter-spacing: 1px;
	}

	.title-icon {
		font-size: 1rem;
	}

	.info-grid {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		font-size: 0.8rem;
	}

	.info-label {
		color: rgba(0, 255, 255, 0.5);
	}

	.info-value {
		color: #00ffff;
		font-family: monospace;
	}

	.network-stats {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.stat {
		display: flex;
		justify-content: space-between;
		font-size: 0.8rem;
	}

	.stat-name {
		color: rgba(0, 255, 255, 0.6);
	}

	.stat-value {
		color: #00ffff;
		font-family: monospace;
	}

	.stat-value.connected {
		color: #00ff00;
		text-shadow: 0 0 5px #00ff00;
	}

	.warning-message {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px;
		background: rgba(255, 0, 0, 0.1);
		border: 1px solid #ff3300;
		border-radius: 8px;
		margin-bottom: 8px;
	}

	.warning-message.minor {
		background: rgba(255, 102, 0, 0.05);
		border-color: #ff6600;
	}

	.warning-icon {
		font-size: 1rem;
	}

	.pulse-warning {
		animation: warningPulse 1s infinite;
	}

	@keyframes warningPulse {
		0%, 100% { opacity: 1; transform: scale(1); }
		50% { opacity: 0.6; transform: scale(1.1); }
	}

	.warning-text {
		font-size: 0.8rem;
		color: #ff6600;
	}

	.panel-footer {
		margin-top: auto;
	}

	.footer-line {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px;
		background: rgba(0, 255, 255, 0.05);
		border: 1px solid rgba(0, 255, 255, 0.3);
		border-radius: 8px;
		font-size: 0.8rem;
	}

	.prompt {
		color: #ff00ff;
		font-weight: bold;
	}

	.command {
		flex: 1;
		color: #00ffff;
	}

	.cursor {
		animation: blink 1s infinite;
	}

	@keyframes blink {
		0%, 50% { opacity: 1; }
		51%, 100% { opacity: 0; }
	}

	/* Bottom Bar */
	.bottom-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 20px;
		background: rgba(10, 10, 20, 0.8);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(0, 255, 255, 0.3);
		border-radius: 12px;
		font-size: 0.8rem;
		margin-top: 20px;
	}

	.bar-left,
	.bar-right {
		display: flex;
		gap: 12px;
	}

	.badge {
		padding: 4px 12px;
		border: 1px solid rgba(0, 255, 255, 0.4);
		border-radius: 20px;
		background: rgba(0, 255, 255, 0.05);
		font-size: 0.7rem;
	}

	.warning-badge {
		border-color: #ff6600;
		color: #ff6600;
	}

	.bar-center {
		display: flex;
		align-items: center;
		gap: 12px;
		color: #ff00ff;
	}

	.pulse-dot {
		width: 6px;
		height: 6px;
		background: #00ff00;
		border-radius: 50%;
		animation: pulse 1s infinite;
	}

	/* Skip button */
	.skip-btn {
		position: relative;
		margin-top: 20px;
		padding: 12px 24px;
		background: linear-gradient(135deg, rgba(255, 102, 0, 0.2), rgba(255, 51, 0, 0.2));
		border: 1px solid #ff6600;
		border-radius: 40px;
		color: #ff6600;
		font-family: monospace;
		font-weight: bold;
		cursor: pointer;
		overflow: hidden;
		transition: all 0.3s ease;
	}

	.skip-btn:hover {
		background: linear-gradient(135deg, rgba(255, 102, 0, 0.4), rgba(255, 51, 0, 0.4));
		transform: translateY(-2px);
		box-shadow: 0 4px 20px rgba(255, 102, 0, 0.3);
	}

	.btn-glow {
		position: absolute;
		inset: 0;
		background: radial-gradient(circle, rgba(255, 102, 0, 0.3), transparent);
		opacity: 0;
		transition: opacity 0.3s;
	}

	.skip-btn:hover .btn-glow {
		opacity: 1;
	}

	/* Character Select */
	.character-select {
		padding: var(--space-lg);
		display: flex;
		flex-direction: column;
		justify-content: center;
		position: relative;
		z-index: 2;
		color: #00ffff;
	}

	.world-creator-wrapper {
		padding: 20px;
	}

	/* Scrollbar */
	.start-content::-webkit-scrollbar {
		width: 6px;
	}

	.start-content::-webkit-scrollbar-track {
		background: rgba(0, 0, 0, 0.5);
		border-radius: 3px;
	}

	.start-content::-webkit-scrollbar-thumb {
		background: linear-gradient(180deg, #00ffff, #ff00ff);
		border-radius: 3px;
	}

	.start-content::-webkit-scrollbar-thumb:hover {
		background: linear-gradient(180deg, #ff00ff, #00ffff);
	}

	/* Responsive */
	@media (max-width: 900px) {
		.cyber-menu {
			grid-template-columns: 1fr;
		}

		.title-glitch {
			font-size: 2.5rem;
			letter-spacing: 4px;
		}

		.start-content {
			padding: 20px;
		}
	}

	@media (max-width: 600px) {
		.menu-item {
			flex-direction: column;
			align-items: flex-start;
			gap: 12px;
		}

		.item-number {
			text-align: left;
			min-width: auto;
		}

		.item-status {
			align-self: flex-end;
		}

		.bottom-bar {
			flex-direction: column;
			gap: 10px;
			text-align: center;
		}

		.title-glitch {
			font-size: 1.8rem;
		}

		.neon-header {
			padding: 20px;
		}
	}
</style>m