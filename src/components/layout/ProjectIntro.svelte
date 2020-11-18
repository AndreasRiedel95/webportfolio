<script>
  export let introTitle;
  export let introText;
</script>

<style lang="scss">
  .intro-header {
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
    padding-left: 30px;
    padding-right: 30px;
    z-index: 10;
    &__paragraph {
      margin-top: 20px;
      &:first-child {
        margin-top: 0;
      }
    }
  }
</style>

<div class="intro-header mt-150 mb-150">
  <div class="divider mt-100 mb-50" />
  <div class="intro-header__title headline2 mb-30">
    {@html introTitle}
  </div>
  {#each introText as text}
    <p class="intro-header__paragraph">
      {@html text}
    </p>
  {/each}
</div>
