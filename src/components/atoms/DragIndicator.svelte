<style lang="scss">
  .scroll-indicator {
    color: #fff;
    height: 22px;
    width: 50px;
    overflow: hidden;
    &__inner {
      font-size: 14px;
      animation: slideIndicator 1.5s ease-in infinite reverse forwards;
    }
  }

  @keyframes slideIndicator {
    0% {
      transform: translate3d(100%, 0, 0);
      opacity: 0.8;
    }
    100% {
      opacity: 1;
      transform: translate3d(-110%, 0, 0);
    }
  }
</style>

<div class="scroll-indicator">
  <div class="scroll-indicator__inner">Drag</div>
</div>
