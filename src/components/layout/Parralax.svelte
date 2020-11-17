<script>
  export let video;
  export let url;
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
    background-image: var(--url);
    padding-bottom: 65%;
    background-attachment: fixed;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    @media (hover: none) and (pointer: coarse) {
      background-attachment: scroll;
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
  <div style="--url: url({url})" class="parralax" />
{/if}
