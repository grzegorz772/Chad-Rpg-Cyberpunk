<script lang="ts">
	// Preferred prop name (used by `Game.svelte`).
	export let text: string | string[] | null | undefined = undefined
	// Backwards-compatible alias.
	export let message: string | string[] | null | undefined = undefined

	$: {
		// Ensure 'text' always takes precedence if both are provided
		const value = text ?? message;
		if (Array.isArray(value)) {
			text = value.join(' '); // Join array into a single string
		} else if (typeof value === 'string') {
			text = value; // Keep as is
		} else {
			text = ''; // Default to empty string
		}
	}
</script>

<p>
	{text}
</p>

<style>
	/* Removed all custom styling, including the fadeIn animation,
	   to ensure it renders as plain text. */
	p {
		margin: 0; /* Ensure no default paragraph margins interfere with layout */
	}
</style>
