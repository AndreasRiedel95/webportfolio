<script>
  import { fly, fade } from 'svelte/transition';
  import { expoOut } from 'svelte/easing';

  export let title;
  export let skills;
  export let year;

  const animationDelay = 1400;
  const animationDuration = 1500;
</script>

<style lang="scss">
  .header {
    height: 100vh;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
    background-color: #161616;
    &__wrapper {
      position: relative;
    }
    &__project-title {
      font-size: 7rem;
      font-weight: 600;
      overflow: hidden;
      line-height: 8rem;
    }
    &__year {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      position: absolute;
      left: 0;
      transform: translateX(-180%);
      top: 15px;
      font-size: 3rem;
    }
    &__skills {
      position: absolute;
      bottom: 0;
      transform: translate(100%, 110%);
      font-weight: 400;
      right: 100px;
    }
  }
</style>

<div class="header">
  <div class="header__wrapper">
    {#each title as t}
      <h1 class="header__project-title">
        <div
          class="header__project-title_inner"
          in:fly={{ y: 100, duration: animationDuration, delay: animationDelay, easing: expoOut }}>
          {t}
        </div>
      </h1>
    {/each}
    <div class="header__year" in:fade={{ duration: animationDuration, delay: animationDelay, easing: expoOut }}>
      {year}
    </div>
    <div
      class="header__skills"
      in:fly={{ y: 100, duration: animationDuration, delay: animationDelay, easing: expoOut }}>
      {@html skills}
    </div>
  </div>
</div>
