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
  export let award = false;
  let value = {};
  //When Page Transition starts to fade out and takes 1600ms
  //This Page gets called -> We need a delay, to see the animation here
  const animationDelay = 900;

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
    user-select: none;
    align-items: var(--alignment);
    @media screen and (max-width: 800px) {
      align-items: center;
      width: 90vw;
      padding: 40vw 0;
      transform: translateY(50px);
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
        width: 110vw;
        padding-right: 20vw;
      }
    }
    &__inner {
      position: relative;
      padding-left: 20vw;
      width: 100%;
    }
    &__award {
      position: absolute;
      right: -8%;
      top: -10%;
      width: 12vw;
      max-width: 95px;
      z-index: 20;
      transform: translate3d(0, 0, 0) rotate(14deg);
    }
    &__link {
      position: relative;
      width: 100%;
      -webkit-user-drag: none;
      -khtml-user-drag: none;
      -moz-user-drag: none;
      -o-user-drag: none;
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
      @media screen and (max-width: 800px) {
        font-size: 50px;
      }
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
      top: 14%;
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
    }
    &__project {
      color: #fff;
      position: absolute;
      top: 89%;
      right: 2%;
      font-size: 1vw;
      padding-top: 1.5vw;
    }
    &__imgwrapper {
      position: relative;
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
        & > .slide__img_wrapper {
          width: 100%;
          height: 100%;
          overflow: hidden;
          transform: translateZ(0);
        }
        .slide__image {
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
          width: 100%;
          object-fit: cover;
        }
        @media (hover: hover) and (pointer: fine) {
          &:hover .slide__image {
            transform: scale(1.2);
          }
          &:hover .slide__award {
            animation: shake 1s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
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

  @keyframes shake {
    10%,
    90% {
      transform: translate3d(-1px, 0, 0) rotate(14deg);
    }

    20%,
    80% {
      transform: translate3d(2px, 0, 0) rotate(14deg);
    }

    30%,
    50%,
    70% {
      transform: translate3d(-4px, 0, 0) rotate(14deg);
    }

    40%,
    60% {
      transform: translate3d(4px, 0, 0) rotate(14deg);
    }
  }
</style>

{#if imageSlide}
  <article
    bind:this={slideOne}
    on:mousedown={(e) => e.preventDefault()}
    class="slide slide--image"
    style="--alignment: {alignment};">
    <a
      class="slide__link"
      href={$isDragging ? 'javascript:;' : url}
      draggable="false"
      on:dragstart={() => {
        return false;
      }}>
      <div class="slide__inner">
        <div in:fadeWidth={{ duration: 2000, delay: animationDelay }} class="slide__imgwrapper">
          <figure>
            {#if award}
              <img
                in:fly={{ y: 100, duration: 1500, delay: animationDelay, easing: expoOut }}
                class="slide__award"
                src="/svg/award.svg"
                alt="award" />
            {/if}
            <div class="slide__img_wrapper">
              <img
                class="slide__image"
                slide
                src={imgSrc}
                draggable="false"
                on:mousedown={(e) => e.preventDefault()}
                alt="slide" />
            </div>
          </figure>
        </div>
      </div>
    </a>
  </article>
{:else}
  <article on:mousedown={(e) => e.preventDefault()} bind:this={slideTwo} class="slide" style="--alignment: {alignment}">
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
      <div class="slide__imgwrapper slide__imgwrapper--proxy" />
      <div class="slide__project" in:fly={{ y: 100, duration: 1500, delay: animationDelay, easing: expoOut }}>
        {subTitle}
      </div>
    </div>
  </article>
{/if}
