<script>
  export let video;
  export let url;
</script>

<style lang="scss">
  .parallax-video {
    max-width: 100vh;
    height: 100vh;
    & > video {
      width: 100%;
      object-fit: cover;
      position: fixed;
      top: 0;
      z-index: 0;
    }
  }
  .parralax {
    width: 100%;
    background-image: var(--url);
    padding-bottom: 65%;
    background-attachment: fixed;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
  }
</style>

{#if video}
  <div class="parallax-video">
    <video autoplay muted loop>
      <source src="/videos/toa.mp4" type="video/mp4" />
    </video>
  </div>
{:else}
  <div style="--url: url({url})" class="parralax" />
{/if}
