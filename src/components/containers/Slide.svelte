<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  export let imageSlide = false;
  export let alignment = 'flex-start';
  export let id;
  export let title;
  export let filter;
  export let type;
  export let subTitle;
  export let projectNr;
  export let imgSrc;
  export let url;

  let slideOne;
  let slideTwo;
  $: dispatch('slideCreate', { cluster: 2, slide: slideTwo });
  $: dispatch('slideCreate', { cluster: 1, slide: slideOne });
</script>

<style lang="scss">
  .slide {
    display: flex;
    width: 50vw;
    height: 100%;
    padding: 20vh 0;
    align-items: var(--alignment);
    &:last-child {
      width: 65vw;
      padding-right: 10vw;
    }
    &__inner {
      position: relative;
      padding-left: 20vw;
      width: 100%;
    }
    &__projectnr {
      z-index: -1;
      position: absolute;
      bottom: -20%;
      font-size: 8vw;
      left: 12vw;
      color: transparent;
      -webkit-text-stroke: 1px rgba(#fff, 0.2); /* width and color */
      line-height: 1;
    }
    &__type {
      position: absolute;
      color: rgba(#fff, 0.5);
      top: 4%;
      font-size: 12px;
      left: 7.5vw;
    }
    &__title {
      position: absolute;
      font-weight: 600;
      top: 7.5%;
      left: 7.5vw;
      color: #fff;
      font-size: 3.5vw;
      z-index: 2;
      line-height: 1.2;
      font-family: 'Montserrat', sans-serif;
      overflow: hidden;
    }
    &__project {
      color: #fff;
      position: absolute;
      top: 89%;
      right: 2%;
      font-size: 1vw;
      padding-top: 1.5vw;
    }
    &__img {
      position: relative;
      overflow: hidden;
      padding-top: 65%;
      width: 100%;
      figure {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        img {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          object-fit: cover;
        }
      }
    }
  }
</style>

{#if imageSlide}
  <article bind:this={slideOne} class="slide" style="--alignment: {alignment}">
    <div class="slide__inner">
      <div class="slide__img js-transition-img">
        <figure class="js-transition-img__inner"><img src={imgSrc} draggable="false" /></figure>
      </div>
    </div>
  </article>
{:else}
  <article bind:this={slideTwo} class="slide" style="--alignment: {alignment}">
    <div class="slide__inner">
      <div class="slide__type">{type}</div>
      <h1 class="slide__title">
        <div class="js-transition-title">{title}</div>
      </h1>
      <div class="slide__projectnr">0{projectNr}</div>
      <div class="slide__img slide__img--proxy" />
      <div class="slide__project">{subTitle}</div>
    </div>
  </article>
{/if}
