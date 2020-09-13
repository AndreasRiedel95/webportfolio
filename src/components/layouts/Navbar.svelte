<script>
	export let navWidth;
</script>

<style type="text/sass">
  .nav-wrapper
    width: var(--width)
    height: 100%
    background: blue
    flex-shrink: 0
    z-index: 100


</style>

<div class="nav-wrapper" style="--width: {navWidth}px" />
