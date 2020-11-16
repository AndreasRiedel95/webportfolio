<script>
  import { fly, fade } from 'svelte/transition';
  import { expoOut, quadIn } from 'svelte/easing';
  export let mask = 0;
  export let transitionLength = 6000;
  export let animate;

  $: if (!animate) {
    mask = 0;
  }

  const fadeWidth = (node, { duration, delay }) => {
    return {
      duration,
      delay,
      css: (t) => {
        const eased = quadIn(t);
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

  const slideOutVertical = (node, { duration, delay }) => {
    return {
      duration,
      delay,
      css: (t) => {
        const eased = expoOut(t);
        return `
                transform: translateY(${100 - eased * 100}%);
                transform-origin: top
              `;
      },
    };
  };
</script>

<style lang="scss">
  .mask-wrapper {
    position: absolute;
    top: 0;
    pointer-events: none;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 200;
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
    &-line-wrapper {
      position: relative;
      width: 20rem;
      height: 2px;
      overflow: hidden;
      &__line {
        transform-origin: left;
        height: 100%;
        width: 100%;
        background-color: rgba(#fff, 0.25);
        opacity: 1;
      }
      &__inner {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        background-color: #fff;
        transform-origin: left;
      }
    }
  }

  .mask-slice {
    &__black {
      position: relative;
      transform: translateX(0);
      background-color: #000;
      width: 100%;
      height: 33.333%;
    }
    &__white {
      position: relative;
      background-color: #fff;
      height: 100%;
      width: 33.333%;
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
          <div out:fly={{ y: 20, duration: 800 }} in:fly={{ y: -20, duration: 800 }} class="logo--font">
            ANDREAS RIEDEL
          </div>
        </div>
        <div class="mask-line-wrapper">
          <div class="mask-line-wrapper__line" in:fadeWidth={{ duration: 1000 }} out:fade={{ duration: 500 }}>
            <div in:fadeWidth={{ duration: 1900, delay: 500 }} class="mask-line-wrapper__inner" />
          </div>
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
    <div class="mask" style="display: flex">
      <div
        in:slideOutVertical={{ duration: 1000, delay: 0 }}
        out:slideOutVertical={{ duration: 1000, delay: 0 }}
        class="mask-slice__white" />
      <div
        in:slideOutVertical={{ duration: 1000, delay: 300 }}
        out:slideOutVertical={{ duration: 1000, delay: 300 }}
        class="mask-slice__white" />
      <div
        in:slideOutVertical={{ duration: 1000, delay: 600 }}
        out:slideOutVertical={{ duration: 1000, delay: 600 }}
        class="mask-slice__white" />
    </div>
  {/if}
</main>
