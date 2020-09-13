<script>
	import { fade } from 'svelte/transition';
	export let navWidth;
	export let w;
	let render = false;
	$: if (w < 700) {
		render = true;
	} else {
		render = false;
	}
</script>

<style type="text/sass">
  .nav-wrapper
    width: var(--width)
    height: 100%
    background-color: #AAAFBF
    flex-shrink: 0
    z-index: 100
    border-right: 1px solid #fff
    display: flex
    justify-content: center
    align-items: center

  .nav-text
    transform: rotate(-90deg)
    color: #fff
    white-space: nowrap
    letter-spacing: 1.1px
    font-size: 16px


</style>

<div class="nav-wrapper" style="--width: {navWidth}px">
	{#if render}
		<div transition:fade class="nav-text">Andreas Riedel</div>
	{/if}
</div>
