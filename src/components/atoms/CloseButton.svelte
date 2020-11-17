<script>
  export let link;
</script>

<style lang="scss">
  $button-size: 30px;
  $close-width: ($button-size / 10);
  .close-button {
    display: block;
    width: $button-size;
    height: $button-size;
    position: relative;
    overflow: hidden;
    > div {
      position: relative;
    }
    &-block {
      width: 20px;
      height: 20px;
      position: relative;
      overflow: hidden;
      &:before,
      &:after {
        content: '';
        position: absolute;
        bottom: 0;
        left: calc(55% - 2px);
        display: block;
        width: 2px;
        height: 20px;
        border-radius: 8px;
        transform-origin: bottom center;
        background: white;
        transition: all ease-out 280ms;
      }
      &:last-of-type {
        transform: rotate(180deg);
      }
    }
    .in {
      .close-button-block {
        &:before {
          transition-delay: 280ms;
          transform: translateX(20px) translateY(-20px) rotate(45deg);
        }
        &:after {
          transition-delay: 280ms;
          transform: translateX(-22px) translateY(-22px) rotate(-45deg);
        }
      }
    }
    .out {
      position: absolute;
      top: 0;
      left: 0;
      .close-button-block {
        &:before {
          transform: translateX(-5px) translateY(5px) rotate(45deg);
        }
        &:after {
          transform: translateX(5px) translateY(5px) rotate(-45deg);
        }
      }
    }
    &:hover {
      .in {
        .close-button-block {
          &:before {
            transform: translateX(-5px) translateY(5px) rotate(45deg);
          }
          &:after {
            transform: translateX(5px) translateY(5px) rotate(-45deg);
          }
        }
      }
      .out {
        .close-button-block {
          &:before {
            transform: translateX(-20px) translateY(20px) rotate(45deg);
          }
          &:after {
            transform: translateX(20px) translateY(20px) rotate(-45deg);
          }
        }
      }
    }
  }
</style>

<a href={link} class="close-button">
  <div class="in">
    <div class="close-button-block" />
    <div class="close-button-block" />
  </div>
  <div class="out">
    <div class="close-button-block" />
    <div class="close-button-block" />
  </div>
</a>
