<script>
  import { onMount } from 'svelte';
  import 'intersection-observer';
  export let introTitle;
  import { expoOut } from 'svelte/easing';
  export let introText;
  let wrapper;
  let visible = false;

  const fadeWidth = (node, { duration, delay }) => {
    return {
      duration,
      delay,
      css: (t) => {
        const eased = expoOut(t);
        return `
        opacity: ${eased * 100};
        width: ${eased * 80}%;
        `;
      },
    };
  };

  const config = {
    root: null,
    rootMargin: '0px',
    threshold: buildThresholdList(),
  };

  let observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.intersectionRatio > 0.4 && entry.intersectionRatio < 0.9) {
        visible = true;
      } else if (entry.intersectionRatio > 1) {
        observer.unobserve(entry.target);
      }
    });
  }, config);

  onMount(() => {
    observer.observe(wrapper);
  });

  function buildThresholdList() {
    let thresholds = [];
    let numSteps = 20;

    for (let i = 1.0; i <= numSteps; i++) {
      let ratio = i / numSteps;
      thresholds.push(ratio);
    }

    thresholds.push(0);
    return thresholds;
  }
</script>

<style lang="scss">
  .intro-header {
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
    padding-left: 30px;
    padding-right: 30px;
    z-index: 10;
    &__title {
      opacity: 0;
      transition: opacity 0.5s ease-out 100ms;
      &.visible {
        opacity: 1;
      }
    }
    &__paragraph {
      margin-top: 20px;
      opacity: 0;
      transition: opacity 1s ease-out 100ms;
      &.visible {
        opacity: 1;
      }
      &:first-child {
        margin-top: 0;
      }
    }
  }
</style>

<div class="intro-header mt-150 mb-150" bind:this={wrapper}>
  <div class="mt-100 mb-50" style="height: 1px">
    {#if visible}
      <div in:fadeWidth={{ duration: 1000 }} class="divider" />
    {/if}
  </div>
  <div class="intro-header__title headline2 mb-30" class:visible>
    {@html introTitle}
  </div>
  {#each introText as text}
    <p class="intro-header__paragraph" class:visible>
      {@html text}
    </p>
  {/each}
</div>
