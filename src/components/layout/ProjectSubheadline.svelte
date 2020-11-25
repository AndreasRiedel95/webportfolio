<script>
  export let title;
  export let color = '#fff';
</script>

<style lang="scss">
  .subheadline {
    font-family: 'Domine', serif;
    font-style: italic;
    color: var(--color);
    font-size: 40px;
    padding-left: 50px;
    padding-right: 50px;
    @media screen and (max-width: 650px) {
      padding-left: 30px;
      padding-right: 30px;
      font-size: 30px;
    }
    &__inner {
      display: inline-block;
    }
  }
</style>

<div class="subheadline mb-40" style="--color: {color}">
  <div class="subheadline__inner">
    <div class="divider ml-10 mb-10" style="background-color: {color}" />
    {@html title}
  </div>
</div>
