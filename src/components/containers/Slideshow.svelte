<script>
  import { onMount } from 'svelte';
  import Flickity from 'flickity';
  export let slides = [];
  let flickity;
  let flickityNode;
  let options = { imagesLoaded: true, percentPosition: false, wrapAround: true };

  onMount(() => {
    flickity = new Flickity(flickityNode, options || {});
    setTimeout(() => {
      refreshFlickity();
    }, 500);
  });

  const refreshFlickity = () => {
    if (!flickity) return;
    flickity.reloadCells();
    flickity.resize();
    flickity.updateDraggable();
  };
</script>

<style>
  .carousel {
    background: transparent;
  }

  .carousel img {
    display: block;
    height: 600px;
  }
</style>

<svelte:window on:resize={refreshFlickity} />

<svelte:head>
  <link rel="stylesheet" href="https://unpkg.com/flickity@2/dist/flickity.min.css" />
</svelte:head>

<div class="carousel mb-100" bind:this={flickityNode}>
  {#each slides as slide, i}<img src={slide} alt="slide{i}" />{/each}
</div>
