<script>
  import { fly, fade } from 'svelte/transition';
  import { expoOut } from 'svelte/easing';

  export let title;
  export let skills;
  export let year;

  let vh;

  const animationDelay = 1400;
  const animationDuration = 1500;
</script>

<style lang="scss">
  .header {
    height: calc(var(--vh, 1vh) * 100);
    width: 100%;
    padding-left: 10px;
    padding-right: 10px;
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
      @media screen and (max-width: 950px) {
        font-size: 6rem;
        line-height: 6.8rem;
      }
      @media screen and (max-width: 750px) {
        font-size: 4rem;
        line-height: 4.8rem;
      }
      @media screen and (max-width: 500px) {
        font-size: 2.6rem;
        word-break: break-word;
        white-space: normal;
        line-height: 3rem;
      }
    }
    &__year {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      position: absolute;
      left: 0;
      transform: translateX(-180%);
      top: 15px;
      font-size: 3rem;
      @media screen and (max-width: 950px) {
        left: 10px;
        top: -50px;
        font-size: 2rem;
        line-height: 2.5;
        transform: translateX(0%);
      }
      @media screen and (max-width: 500px) {
        top: -60px;
        left: -2px;
      }
    }
    &__skills {
      position: absolute;
      bottom: 0;
      transform: translate(100%, 110%);
      font-weight: 400;
      right: 100px;
      @media screen and (max-width: 950px) {
        right: 0;
        text-align: right;
        transform: translate(0%, 110%);
      }
    }
  }
</style>

<svelte:window bind:innerHeight={vh} />

<div class="header" style="--vh: {vh * 0.01}px">
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
