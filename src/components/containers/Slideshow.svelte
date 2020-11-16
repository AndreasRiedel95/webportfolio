<script>
  import { onMount } from 'svelte';
  import Flickity from 'flickity';
  let flickity;
  let flickityNode;
  let options = { imagesLoaded: true, percentPosition: false, wrapAround: true };

  onMount(() => {
    flickity = new Flickity(flickityNode, options || {});
    setTimeout(() => {
      refreshFlickity();
    }, 200);
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
    background: #eee;
  }

  .carousel img {
    display: block;
    height: 400px;
  }
</style>

<svelte:window on:resize={refreshFlickity} />

<svelte:head>
  <link rel="stylesheet" href="https://unpkg.com/flickity@2/dist/flickity.min.css" />
</svelte:head>

<div class="carousel mb-200" bind:this={flickityNode}>
  <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/82/orange-tree.jpg" alt="orange tree" />
  <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/82/submerged.jpg" alt="submerged" />
  <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/82/look-out.jpg" alt="look-out" />
  <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/82/one-world-trade.jpg" alt="One World Trade" />
  <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/82/drizzle.jpg" alt="drizzle" />
  <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/82/cat-nose.jpg" alt="cat nose" />
</div>
