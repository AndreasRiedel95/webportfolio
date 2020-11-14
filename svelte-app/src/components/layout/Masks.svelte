<script>
  import { fly, fade } from 'svelte/transition';
  import { expoOut } from 'svelte/easing';
  export let mask = 0;
  export let transitionLength = 6000;
  export let animate;

  $: console.log('Animate', animate, mask);
  $: if (!animate) {
    mask = 0;
  }

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

  const slideOutHorizontal = (node, { duration, delay }) => {
    return {
      duration,
      delay,
      css: (t) => {
        const eased = expoOut(t);
        return `
                transform: translateX(${100 - eased * 100}%);
                transform-origin: left
              `;
      },
    };
  };
</script>

<style lang="scss">
  .mask-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 100;
  }

  .mask {
    height: 100%;
    width: 100%;
    &__inner {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translateX(-50%) translateY(-50%);
    }
    &-line {
      position: relative;
      transform-origin: left;
      width: 20rem;
      height: 2px;
      overflow: hidden;
      background-color: rgba(#fff, 0.25);
      opacity: 1;
      &__inner {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        background-color: #fff;
        transform-origin: left;
      }
    }
  }

  .mask-slice {
    &__black {
      position: relative;
      transform: translateX(0);
      background-color: red;
      width: 100%;
      height: 33%;
    }
    &__white {
      position: relative;
      transform: translateY(0);
      background-color: #fff;
      height: 100%;
      width: 33%;
    }
  }

  .logo {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    &--mask {
      overflow: hidden;
      height: 18px;
      margin-bottom: 20px;
    }
    &--font {
      font-size: 1.2vw;
      font-family: 'Domine', serif;
      color: #fff;
      letter-spacing: 1.1;
      @media screen and (max-width: 800px) {
        font-size: 20px;
      }
    }
  }
</style>

<main class="mask-wrapper">
  <!-- First Mask for inital Load
    -> Loading Andreas Riedel and 3 Mask Tiles slide out -->
  {#if mask === 1}
    <div class="mask">
      <div out:slideOutHorizontal={{ duration: 1000, delay: 0 }} class="mask-slice__black" />
      <div out:slideOutHorizontal={{ duration: 1000, delay: 300 }} class="mask-slice__black" />
      <div out:slideOutHorizontal={{ duration: 1000, delay: 600 }} class="mask-slice__black" />
      <div class="mask__inner">
        <div class="logo logo--mask">
          <div out:fly={{ y: 100, duration: 1000 }} in:fly={{ y: -100, duration: 1000 }} class="logo--font">
            ANDREAS RIEDEL
          </div>
        </div>
        <div class="mask-line" out:fade={{ duration: 1000 }}>
          <div in:fadeWidth={{ duration: 4000 }} class="mask-line__inner" />
        </div>
      </div>
    </div>
  {/if}

  <!-- Second Mask for filter: 3 Mask Tiles in black slide in and out starting from right to left -->
  {#if mask === 2}
    <div class="mask">
      <div
        in:slideOutHorizontal={{ duration: 1000, delay: 0 }}
        out:slideOutHorizontal={{ duration: 1000, delay: 0 }}
        class="mask-slice__black" />
      <div
        in:slideOutHorizontal={{ duration: 1000, delay: 300 }}
        out:slideOutHorizontal={{ duration: 1000, delay: 300 }}
        class="mask-slice__black" />
      <div
        in:slideOutHorizontal={{ duration: 1000, delay: 600 }}
        out:slideOutHorizontal={{ duration: 1000, delay: 600 }}
        class="mask-slice__black" />
    </div>
  {/if}

  <!-- Third Mask for project/profile: 3 Mask Tiles in white slide in and out starting from bottom to top -->
  {#if mask === 3}
    <div class="mask" />
  {/if}
</main>
