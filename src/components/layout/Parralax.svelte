<script>
  export let video;
  export let url;
  import { projectContainerScrollTop } from 'util/store.js';
  const xvalue = 'center';
  const factor = 0.1;
  let yvalue = 0;
  let lastVal = 0;

  $: {
    lastVal = lerp(lastVal, $projectContainerScrollTop, 0.08);
    yvalue = lastVal * factor;
  }

  const lerp = (a, b, n) => {
    return (1 - n) * a + n * b;
  };
</script>

<style lang="scss">
  .parallax-video {
    position: relative;
    padding-bottom: 56.25%;
    height: 0;
    width: 100vw;
    overflow: hidden;
    & > video {
      width: 100%;
      object-fit: cover;
      position: fixed;
      top: 0;
      z-index: 0;
      @media (hover: none) and (pointer: coarse) {
        position: relative;
      }
    }
  }
  .parralax {
    width: 100%;
    padding-bottom: 65%;
    background-attachment: fixed;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    &__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    @media (hover: none) and (pointer: coarse) {
      background-attachment: scroll;
      background-position: center !important;
    }
  }
</style>

{#if video}
  <div class="parallax-video">
    <video autoplay muted loop playsinline>
      <source src={url} type="video/mp4" />
    </video>
  </div>
{:else}
  <div style="background-position: {xvalue + ' ' + -yvalue + 'px'}; background-image: url({url});" class="parralax" />
{/if}
