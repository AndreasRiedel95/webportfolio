<style lang="scss">
  .scroll-indicator {
    height: 22px;
    overflow: hidden;
    &__inner {
      font-size: 14px;
      color: #fff;
      animation: slideIndicator 1.5s ease-in infinite reverse forwards;
    }
  }

  @keyframes slideIndicator {
    0% {
      transform: translate3d(0, 70%, 0);
      opacity: 0.8;
    }
    100% {
      opacity: 1;
      transform: translate3d(0, -90%, 0);
    }
  }
</style>

<div class="scroll-indicator">
  <div class="scroll-indicator__inner">Scroll Down</div>
</div>
