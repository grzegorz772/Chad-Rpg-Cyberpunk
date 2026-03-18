<script lang="ts">
	import { createEventDispatcher, tick } from 'svelte'
	import { fade, fly } from 'svelte/transition'

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
				duration: 400,
				easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
			})

			animation.onfinish = () => {
				el.style.height = 'auto'
			}
		}
	}
</script>

<div class="start-overlay" transition:fade={{ duration: 500 }}>
	<div class="start-window" id="game-start-window" in:fly={{ y: 30, duration: 600, delay: 200 }}>
			{#if worldCreationMode}
				<div class="world-creator-wrapper" transition:fade={{ duration: 400 }}>
					<WorldCreator on:worldCreated={handleWorldCreated} />
					<button class="skip-btn" on:click={skipWorldCreation}>SKIP TO STANDARD WORLD</button>
				</div>
			{:else if gameModeSelected}
				<div class="character-select" transition:fade={{ duration: 400 }}>
					<CharacterClasses
						on:emittedAnswer={() => {
							emitAnswer(customWorldPrompt || gameStarterPrompt)
						}}
					/>
				</div>
			{:else}
			<div class="start-content" transition:fade={{ duration: 400 }}>
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
						<div class="title-glitch" data-text="ALYSSIUM">ALYSSIUM</div>
						<div class="title-sub">// SYSTEM BOOT // v.0.2.0-alpha</div>
					</div>
					

				</div>

				<!-- Main Menu -->
				<div class="cyber-menu">
					<div class="menu-panel">
						<div class="panel-header">
							<span class="header-icon"></span>
							<span style="margin: 0;" class="title-sub header-text">// INTERFACE LOADED //</span>
							<span class="header-icon"></span>
						</div>

						<!-- Main Story Card -->
						<div class="menu-item available" tabindex="0" role="button" on:click={() => handleGameMode(getRandomValueFromArray([...medievalTavernStarter]))} on:keydown>
							<div class="item-glow"></div>
							<div class="item-number">01</div>
							<div class="item-content">
								<div class="item-title">
									<span class="title-main">POINT ZERO</span>
									<span class="title-type">[Start Game]</span>
								</div>
								<div class="item-description">
									Initialize main story. Post-apocalyptic world simulation, uknown powers rule the world.
								</div>
								<div class="item-specs">
									<div class="spec">
										<span class="spec-icon"></span>
										<span class="spec-bar">
											<span class="spec-fill" style="width: 80%"></span>
										</span>
										<span class="spec-value">COMBAT 80%</span>
									</div>
									<div class="spec">
										<span class="spec-icon"></span>
										<span class="spec-bar">
											<span class="spec-fill" style="width: 60%"></span>
										</span>
										<span class="spec-value">MAGIC 60%</span>
									</div>
									<div class="spec">
										<span class="spec-icon"></span>
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
							</div>
						</div>
					</div>

					<!-- Right Panel - System Info -->
					<div class="system-panel">
						<div class="panel-section">
							<div class="section-title">SYSTEM INFO</div>
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
										document.querySelector('.info-clock').textContent = timeString;
									}

									// Uruchomienie od razu i ustawienie interwału co 1s
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
							<div class="section-title">NETWORK</div>
							<div class="network-stats">
								<div class="stat">
									<span class="stat-name">Status</span>
									<span class="stat-value">CONNECTED</span>
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
									// realistyczne zmiany (random walk)
									const downloadDelta = (Math.random() - 0.5) * 1.2; // ~ -0.6 do +0.6
									const pingDelta = (Math.random() - 0.5) * 8; // ~ -4 do +4

									download = clamp(download + downloadDelta, 2.5, 10);
									ping = clamp(ping + pingDelta, 20, 120);

									// lekkie wygładzenie (zaokrąglenie)
									document.getElementById("download").textContent =
										download.toFixed(1) + " Mbps";

									document.getElementById("ping").textContent =
										Math.round(ping) + " ms";
								}

								// losowy interwał 1–2s
								function loop() {
									updateStats();
									setTimeout(loop, 1000 + Math.random() * 1000);
								}

								loop();
							</script>
							</div>
						</div>

						<div class="panel-section">
							<div class="section-title">WARNING</div>
							<div class="warning-message">
								<span class="warning-icon">⚠</span>
								<span class="warning-text">SOS Signal Recived</span>
							</div>
						</div>

						<div class="panel-footer">
							<div class="footer-line">
								<span class="prompt">></span>
								<span class="command">Ilusion is everywhere</span>
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
						<div class="pulse"></div>
						<span>SYSTEM ONLINE // 127.0.0.1</span>
						<div class="pulse"></div>
					</div>
					<div class="bar-right">
						<span class="badge">⚠ 3 ALERTS</span>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.start-overlay {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-md);
		background: #000000;
	}

	.start-window {
		width: min(95%, 1200px);
		max-height: 90vh;
		background: #0a0a0f;
		border: 1px solid #00ffff;
		box-shadow: 0 0 30px rgba(0, 255, 255, 0.3), inset 0 0 20px rgba(0, 255, 255, 0.2);
		overflow: hidden;
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		position: relative;
	}

	/* Cyberpunk Effects */
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

	@keyframes gridMove {
		0% { background-position: 0 0; }
		100% { background-position: 50px 50px; }
	}

	.glitch-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(90deg, transparent, rgba(255, 0, 255, 0.1), transparent);
		animation: glitch 3s infinite;
		pointer-events: none;
		z-index: 2;
	}

	@keyframes glitch {
		0%, 100% { transform: translateX(0); opacity: 0; }
		10% { transform: translateX(-2px); opacity: 0.3; }
		20% { transform: translateX(2px); opacity: 0.3; }
		30% { transform: translateX(0); opacity: 0; }
	}

	.start-content {
		grid-area: 1 / 1;
		width: 100%;
		height: 100%;
		overflow-y: auto;
		overflow-x: hidden;
		position: relative;
		z-index: 10;
		padding: 20px;
		color: #00ffff;
		font-family: 'Share Tech Mono', 'Courier New', monospace;
	}

	/* Neon Header */
	.neon-header {
		position: relative;
		margin-bottom: 30px;
		padding: 20px;
		border: 1px solid #00ffff;
		background: rgba(0, 0, 0, 0.8);
		box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
	}

	.corner {
		position: absolute;
		width: 20px;
		height: 20px;
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
		font-size: 4rem;
		font-weight: bold;
		color: #00ffff;
		text-shadow: 
			-2px -2px 0 #ff00ff,
			2px 2px 0 #00ffff;
		animation: glitchText 4s infinite;
		position: relative;
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
		font-size: 1rem;
		color: #ff00ff;
		margin-top: 10px;
		letter-spacing: 2px;
	}

	.status-bar {
		display: flex;
		gap: 20px;
		margin-top: 20px;
		padding-top: 10px;
		border-top: 1px solid #00ffff;
	}

	.status-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 5px;
	}

	.status-label {
		font-size: 0.8rem;
		color: #ff00ff;
	}

	.status-value {
		font-size: 1rem;
		font-weight: bold;
	}

	.status-value.online {
		color: #00ff00;
		text-shadow: 0 0 10px #00ff00;
	}

	/* Cyber Menu */
	.cyber-menu {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: 20px;
		margin-bottom: 20px;
	}

	.menu-panel,
	.system-panel {
		border: 1px solid #00ffff;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(5px);
	}

	.panel-header {
		padding: 15px;
		background: rgba(0, 255, 255, 0.1);
		border-bottom: 1px solid #00ffff;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 15px;
		color: #ff00ff;
	}

	.menu-item {
		display: flex;
		align-items: center;
		gap: 20px;
		padding: 20px;
		border-bottom: 1px solid rgba(0, 255, 255, 0.2);
		position: relative;
		overflow: hidden;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.menu-item.available:hover {
		background: rgba(0, 255, 255, 0.1);
		transform: translateX(10px);
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
		background: radial-gradient(circle, rgba(0, 255, 255, 0.1), transparent);
		opacity: 0;
		transition: opacity 0.3s;
		pointer-events: none;
	}

	.menu-item.available:hover .item-glow {
		opacity: 1;
	}

	.item-number {
		font-size: 2rem;
		font-weight: bold;
		color: #ff00ff;
		opacity: 0.5;
		min-width: 60px;
		text-align: right;
	}

	.item-content {
		flex: 1;
	}

	.item-title {
		display: flex;
		align-items: center;
		gap: 15px;
		margin-bottom: 5px;
	}

	.title-main {
		font-size: 1.5rem;
		font-weight: bold;
		color: #00ffff;
	}

	.title-type {
		font-size: 0.8rem;
		color: #ff00ff;
		padding: 2px 8px;
		border: 1px solid #ff00ff;
	}

	.item-description {
		font-size: 0.9rem;
		color: rgba(0, 255, 255, 0.7);
		margin-bottom: 10px;
	}

	.item-specs {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.spec {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 0.8rem;
	}

	.spec-bar {
		flex: 1;
		height: 6px;
		background: rgba(0, 255, 255, 0.2);
		border: 1px solid #00ffff;
	}

	.spec-fill {
		display: block;
		height: 100%;
		background: linear-gradient(90deg, #00ffff, #ff00ff);
	}

	.item-status {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 5px;
	}

	.status-light {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: #00ff00;
		box-shadow: 0 0 10px #00ff00;
		animation: pulse 1s infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	.status-text.locked {
		color: #ff00ff;
	}

	.item-arrow {
		font-size: 1.5rem;
		color: #ff00ff;
		opacity: 0;
		transition: opacity 0.3s;
	}

	.menu-item.available:hover .item-arrow {
		opacity: 1;
	}

	.progress-bar {
		width: 200px;
		height: 4px;
		background: rgba(0, 255, 255, 0.2);
		border: 1px solid #00ffff;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #00ffff, #ff00ff);
	}

	/* System Panel */
	.system-panel {
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.panel-section {
		border-bottom: 1px solid rgba(0, 255, 255, 0.2);
		padding-bottom: 15px;
	}

	.section-title {
		color: #ff00ff;
		margin-bottom: 15px;
		font-size: 1rem;
	}

	.info-grid {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		font-size: 0.9rem;
	}

	.info-label {
		color: rgba(0, 255, 255, 0.5);
	}

	.info-value {
		color: #00ffff;
	}

	.network-stats {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.stat {
		display: flex;
		justify-content: space-between;
	}

	.warning-message {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px;
		background: rgba(255, 0, 255, 0.1);
		border: 1px solid #ff00ff;
	}

	.warning-icon {
		color: #ff00ff;
		font-size: 1.2rem;
	}

	.warning-text {
		font-size: 0.9rem;
		color: #ff00ff;
	}

	.panel-footer {
		margin-top: auto;
	}

	.footer-line {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px;
		background: rgba(0, 255, 255, 0.1);
		border: 1px solid #00ffff;
	}

	.prompt {
		color: #ff00ff;
		font-weight: bold;
	}

	.command {
		flex: 1;
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
		padding: 10px;
		border: 1px solid #00ffff;
		background: rgba(0, 0, 0, 0.8);
		font-size: 0.9rem;
	}

	.bar-left,
	.bar-right {
		display: flex;
		gap: 10px;
	}

	.badge {
		padding: 3px 8px;
		border: 1px solid #00ffff;
		background: rgba(0, 255, 255, 0.1);
	}

	.bar-center {
		display: flex;
		align-items: center;
		gap: 15px;
		color: #ff00ff;
	}

	.pulse {
		width: 5px;
		height: 5px;
		background: #00ffff;
		border-radius: 50%;
		animation: pulse 1s infinite;
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

	/* Scrollbar */
	.start-content::-webkit-scrollbar {
		width: 8px;
	}

	.start-content::-webkit-scrollbar-track {
		background: #000;
		border: 1px solid #00ffff;
	}

	.start-content::-webkit-scrollbar-thumb {
		background: #00ffff;
		border: 1px solid #ff00ff;
	}

	/* Responsive */
	@media (max-width: 900px) {
		.cyber-menu {
			grid-template-columns: 1fr;
		}

		.title-glitch {
			font-size: 2.5rem;
		}
	}

	@media (max-width: 600px) {
		.status-bar {
			flex-direction: column;
			gap: 10px;
		}

		.menu-item {
			flex-direction: column;
			align-items: flex-start;
		}

		.item-number {
			text-align: left;
		}

		.bottom-bar {
			flex-direction: column;
			gap: 10px;
		}
	}
</style>