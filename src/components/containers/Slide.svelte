<script>
  import { createEventDispatcher, onDestroy } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import { isDragging } from 'util/store.js';
  import { expoOut } from 'svelte/easing';
  const dispatch = createEventDispatcher();
  export let imageSlide = false;
  export let alignment = 'flex-start';
  export let id;
  export let uuid;
  export let title;
  export let filter;
  export let type;
  export let subTitle;
  export let projectNr;
  export let imgSrc;
  export let url;
  let value = {};
  //When Page Transition starts to fade out and takes 1600ms
  //This Page gets called -> We need a delay, to see the animation here
  const animationDelay = 1400;

  let slideOne;
  let slideTwo;
  //We give in a uuid , to force svelte to rebind the slides
  //This is necessary to filter them
  $: dispatch('slideCreate', { cluster: 2, slide: slideTwo, uuid });
  $: dispatch('slideCreate', { cluster: 1, slide: slideOne, uuid });

  $: restartTransition(uuid);

  const restartTransition = (_) => {
    value = {};
  };

  onDestroy(() => {
    slideOne = null;
    slideTwo = null;
  });

  const fadeWidth = (node, { duration, delay }) => {
    return {
      duration,
      delay,
      css: (t) => {
        const eased = expoOut(t);
        return `
        width: ${eased * 100}%;
        `;
      },
    };
  };
</script>

<style lang="scss">
  .slide {
    display: flex;
    width: 55vw;
    height: 100%;
    padding: 20vh 0;
    pointer-events: none;
    -webkit-user-drag: none;
    -khtml-user-drag: none;
    -moz-user-drag: none;
    -o-user-drag: none;
    user-drag: none;
    user-select: none;
    align-items: var(--alignment);
    @media screen and (max-width: 800px) {
      align-items: center;
      width: 80vw;
      padding: 35vw 0;
    }
    &--image {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      pointer-events: inherit;
    }
    &:last-child {
      width: 70vw;
      padding-right: 15vw;
      @media screen and (max-width: 800px) {
        width: 95vw;
        padding-right: 15vw;
      }
    }
    &__inner {
      position: relative;
      padding-left: 20vw;
      width: 100%;
      @media screen and (max-width: 800px) {
        padding-left: 15vw;
      }
    }
    &__link {
      position: relative;
      width: 100%;
      -webkit-user-drag: none;
      -khtml-user-drag: none;
      -moz-user-drag: none;
      -o-user-drag: none;
      user-drag: none;
    }
    &__projectnr {
      z-index: -1;
      position: absolute;
      bottom: -20%;
      font-size: 8vw;
      left: 12vw;
      color: transparent;
      -webkit-text-stroke: 1px rgba(#fff, 0.2);
      line-height: 1;
    }
    &__type {
      position: absolute;
      color: rgba(#fff, 0.5);
      top: 8%;
      font-size: 12px;
      left: 7.5vw;
      @media screen and (max-width: 800px) {
        top: -70px;
      }
    }
    &__title {
      position: absolute;
      font-weight: 600;
      top: 12%;
      left: 7.5vw;
      color: #fff;
      font-size: 3.5vw;
      z-index: 2;
      line-height: 1.2;
      font-family: 'Montserrat', sans-serif;
      overflow: hidden;
      @media screen and (max-width: 800px) {
        font-size: 35px;
        top: -50px;
        white-space: nowrap;
      }
      &__inner {
        overflow: hidden;
      }
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
      @media screen and (max-width: 500px) {
        padding-top: 65%;
      }
      figure {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        -webkit-user-drag: none;
        -khtml-user-drag: none;
        -moz-user-drag: none;
        -o-user-drag: none;
        user-drag: none;
        img {
          position: absolute;
          top: 0;
          transform: scale(1);
          transition: transform 0.5s ease-out;
          left: 0;
          height: 100%;
          -webkit-user-drag: none;
          -khtml-user-drag: none;
          -moz-user-drag: none;
          -o-user-drag: none;
          user-drag: none;
          width: 100%;
          object-fit: cover;
          &:hover {
            transform: scale(1.2);
          }
        }
      }
    }
  }

  .transition-title {
    background-color: #000;
    height: 100%;
    width: 100%;
  }
</style>

{#if imageSlide}
  <article bind:this={slideOne} class="slide slide--image" style="--alignment: {alignment}">
    <a class="slide__link" href={$isDragging ? 'javascript:;' : url} draggable="false">
      <div class="slide__inner">
        <div in:fadeWidth={{ duration: 2000, delay: animationDelay }} class="slide__img ">
          <figure class=""><img src={imgSrc} draggable="false" /></figure>
        </div>
      </div>
    </a>
  </article>
{:else}
  <article bind:this={slideTwo} class="slide" style="--alignment: {alignment}">
    <div class="slide__inner">
      <div in:fly={{ x: -100, duration: 1500, delay: animationDelay, easing: expoOut }} class="slide__type">{type}</div>
      <h1 class="slide__title">
        <div in:fly={{ y: 100, duration: 1500, delay: animationDelay, easing: expoOut }} class="slide__title__inner">
          {@html title}
        </div>
      </h1>
      <div in:fly={{ y: 100, duration: 1500, delay: animationDelay, easing: expoOut }} class="slide__projectnr">
        0{projectNr}
      </div>
      <div class="slide__img slide__img--proxy" />
      <div class="slide__project">{subTitle}</div>
    </div>
  </article>
{/if}
