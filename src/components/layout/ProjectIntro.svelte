<script>
  export let introTitle;
  export let introText;
</script>

<style lang="scss">
  .intro-header {
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
    padding-left: 20px;
    padding-right: 20px;
    z-index: 10;
    &__title {
      font-size: 32px;
      font-weight: 500;
      line-height: 40px;
    }
    &__paragraph {
      margin-top: 20px;
      &:first-child {
        margin-top: 0;
      }
    }
  }

  .divider {
    width: 80%;
    height: 1px;
    background-color: #fff;
  }
</style>

<div class="intro-header mt-100 mb-100">
  <div class="divider mt-100 mb-50" />
  <div class="intro-header__title mb-30">
    {@html introTitle}
  </div>
  {#each introText as text}
    <p class="intro-header__paragraph">
      {@html text}
    </p>
  {/each}
</div>
