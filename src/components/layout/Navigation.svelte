<script>
</script>

<style lang="scss">
  .filter {
    display: flex;
    position: absolute;
    padding-top: 70px;
    padding-bottom: 70px;
    width: 100%;
    justify-content: center;
    align-items: center;
    z-index: 10;
    &__list {
      display: flex;
    }
    &__item {
      display: flex;
      flex-shrink: 0;
      font-size: 13px;
      white-space: nowrap;
    }
    &__link {
      position: relative;
      display: block;
      color: rgba(#fff, 0.5);
      text-decoration: none;
      padding: 0 1.5vw;
      font-size: 13px;
      line-height: 1.5;
      overflow: hidden;

      &-mask {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background-color: #111;
        transform: translate3d(-100%, 0, 0);
        transition: transform 0.75s ease;
        z-index: 2;

        span {
          display: block;
          padding: 0 1.5vw;
          font-size: 13px;
          transform: translate3d(100%, 0, 0);
          transition: transform 0.75s ease;
          color: #fff;

          .filter__link:hover &,
          .filter__link.is-active & {
            transform: translate3d(0, 0, 0);
          }
        }
        .filter__link:hover &,
        .filter__link.is-active & {
          transform: translate3d(0, 0, 0);
        }
      }
    }
  }
</style>

<nav class="filter">
  <ul class="filter__list">
    <li class="filter__item">
      <a href="#" class="filter__link js-trigger is-active">
        <div class="filter__link-mask" area-hidden><span>All projects</span></div>
        All projects
      </a>
      <a href="#" class="filter__link js-trigger">
        <div class="filter__link-mask" area-hidden><span>Digital</span></div>
        Digital
      </a>
    </li>
    <li class="filter__item">
      <a href="#" class="filter__link js-trigger">
        <div class="filter__link-mask" area-hidden><span>Print</span></div>
        Print
      </a>
    </li>
    <li class="filter__item">
      <a href="#" class="filter__link js-trigger">
        <div class="filter__link-mask" area-hidden><span>Multimedia</span></div>
        Multimedia
      </a>
    </li>
  </ul>
</nav>
