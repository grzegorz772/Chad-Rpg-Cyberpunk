<script lang="ts">
	import '../app.css';
	import { initDeviceDetection } from '$lib/stores/device'
	import { onMount } from 'svelte'

	onMount(() => {
		const cleanup = initDeviceDetection()
		return cleanup
	})
</script>

<slot />