<script>
  import { onMount } from 'svelte';
  import Flickity from 'flickity';
  export let slides = [];
  export let options;
  export let height = 600;
  let flickity;
  let flickityNode;

  onMount(() => {
    flickity = new Flickity(flickityNode, options || {});
    preloadAll(slides)
      .then((_) => {
        console.log('Preloaded images');
        refreshFlickity();
      })
      .catch((err) => console.error('Failed', err));
  });

  const preload = (src) => {
    return new Promise(function (resolve, reject) {
      const img = new Image();
      img.onload = function () {
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
  };

  const preloadAll = (sources) => Promise.all(sources.map(preload));

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
    height: var(--height);
  }
</style>

<svelte:window on:resize={refreshFlickity} />

<svelte:head>
  <link rel="stylesheet" href="https://unpkg.com/flickity@2/dist/flickity.min.css" />
</svelte:head>

<div class="carousel" bind:this={flickityNode} style="--height: {height}px">
  {#each slides as slide, i}<img src={slide} alt="slide{i}" />{/each}
</div>
