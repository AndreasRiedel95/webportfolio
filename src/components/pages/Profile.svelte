<script>
  import { fly } from 'svelte/transition';
  import { onDestroy } from 'svelte';

  onDestroy(() => {
    console.log('destroy');
  });
</script>

<style lang="scss">
  main {
    background-color: #fff;
    height: 100%;
  }
</style>

<main transition:fly={{ y: 1000, duration: 400 }}>Andreas Riedel <a href="/">Close</a></main>
