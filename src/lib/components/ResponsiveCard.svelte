<script lang="ts">
	import { deviceType } from '$lib/stores/device'
</script>

<div class="card" class:mobile={$deviceType === 'mobile'} class:desktop={$deviceType === 'desktop'}>
	<div class="card-content">
		<slot />
	</div>
</div>

<style>
	.card {
		transition: all 0.3s ease;
	}

	/* Wersja desktopowa */
	.card.desktop {
		padding: 24px;
		border-radius: 16px;
		box-shadow: 0 10px 30px rgba(0,0,0,0.2);
		background: rgba(0,0,0,0.7);
		backdrop-filter: blur(10px);
	}

	/* Wersja mobilna */
	.card.mobile {
		padding: 16px;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0,0,0,0.15);
		background: rgba(0,0,0,0.85);
		width: 100%;
		margin: 0;
	}
</style>