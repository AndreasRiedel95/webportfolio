<script>
  import { onMount } from 'svelte';
  import Navigation from './components/layout/Navigation.svelte';
  import imagesLoaded from 'imagesloaded';
  import Slide from './components/containers/Slide.svelte';
  const slideTemplates = [
    {
      id: 0,
      title: 'TurnOver',
      type: 'iOS App for iPad',
      filter: 'print',
      subTitle: 'University',
      imgSrc: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/project-one.png',
      url: '',
    },
    {
      id: 1,
      title: 'Rijksmuseums',
      type: 'App Conception',
      filter: 'print',
      subTitle: 'University',
      imgSrc: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/project-two.png',
      url: '',
    },
    {
      id: 2,
      title: 'MAN InCar',
      type: 'Conception & App',
      filter: 'print',
      subTitle: 'University',
      imgSrc: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/project-three.png',
      url: '',
    },
    {
      id: 4,
      title: 'ecographis',
      filter: 'digital',
      type: 'Website',
      subTitle: 'Work',
      imgSrc: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/project-one.png',
      url: '',
    },
    {
      id: 5,
      title: 'mueslibar',
      type: 'Conception / Magazine',
      filter: 'print',
      subTitle: 'University',
      imgSrc: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/project-two.png',
      url: '',
    },
    {
      id: 6,
      title: 'Human Projection',
      type: 'Photography',
      filter: 'digital',
      subTitle: 'University',
      imgSrc: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/project-three.png',
      url: '',
    },
  ];

  let windowHeight;
  let scrollContentWidth;
  let windowWidth;
  let scrollY = 0;
  let scrollContent = [];
  let scrollHandle;
  let bounce = 0;
  let skew = 0;
  let scale = 0;
  let data = {
    total: 0,
    current: 0,
    last: {
      one: 0,
      two: 0,
    },
    on: 0,
    off: 0,
  };
  let slideArrays = [[], []];
  let bounds = {
    elem: 0,
    content: 0,
    width: 0,
    max: 0,
    min: 0,
  };

  let dragging = false;
  let rAF = null;
  let parallax = null;
  const math = {
    lerp: (a, b, n) => {
      return (1 - n) * a + n * b;
    },
    norm: (value, min, max) => {
      return (value - min) / (max - min);
    },
  };

  $: if (slideArrays[0].length === slideTemplates.length && slideArrays[1].length === slideTemplates.length) {
    initScroll();
  }

  onMount(() => {
    // transition();
  });

  const getSlideAlignment = (i) => {
    let alignment = 'flex-start';
    if (i % 2 === 0) {
      alignment = 'center';
    }

    if (i % 3 === 0) {
      alignment = 'flex-end';
    }

    return alignment;
  };

  const initScroll = () => {
    data = {
      total: slideArrays[0].length - 1,
      current: 0,
      last: {
        one: 0,
        two: 0,
      },
      on: 0,
      off: 0,
    };
    preload();
    on();
    run();
    // this.createTimeline();
  };

  const handleSlideCreate = (e) => {
    if (e.detail.cluster === 1) {
      slideArrays = [[...slideArrays[0], e.detail.slide], [...slideArrays[1]]];
    } else {
      slideArrays = [[...slideArrays[0]], [...slideArrays[1], e.detail.slide]];
    }
  };

  const on = () => {
    setBounds(slideArrays[0]);
    setBounds(slideArrays[1]);
    customRequestAnimationFrame();
  };

  const handleScroll = () => {
    if (dragging) return;
    data.current = scrollY;
    clamp();
  };

  const handleMouseDown = (e) => {
    dragging = true;
    data.on = e.clientX;
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    drag(e);
  };

  const handleMouseUp = (e) => {
    dragging = false;
    scrollY = data.current;
  };
  const drag = (e) => {
    data.current = scrollY - (e.clientX - data.on);
    clamp();
  };

  const resize = () => {
    setBounds(slideArrays[0]);
    setBounds(slideArrays[1]);
    handleScroll();
  };

  const preload = () => {
    imagesLoaded(scrollContent, (instance) => {
      setBounds(slideArrays[0]);
      setBounds(slideArrays[1]);
    });
  };

  const run = () => {
    data.last.one = math.lerp(data.last.one, data.current, 0.085);
    data.last.one = Math.floor(data.last.one * 100) / 100;

    data.last.two = math.lerp(data.last.two, data.current, 0.07);
    data.last.two = Math.floor(data.last.two * 100) / 100;

    const diff = data.current - data.last.one;
    const acc = diff / windowWidth;
    const velo = +acc;
    bounce = 1 - Math.abs(velo * 0.25);
    skew = velo * 20;
    scale = math.norm(data.last.two, 0, bounds.max);
    customRequestAnimationFrame();
  };

  const customRequestAnimationFrame = () => {
    rAF = requestAnimationFrame(run);
  };
  const setBounds = (elems) => {
    let w = 0;
    elems.forEach((el, index) => {
      bounds = el.getBoundingClientRect();
      el.style.position = 'absolute';
      el.style.top = 0;
      el.style.left = `${w}px`;
      w = w + bounds.width;
      bounds.width = w;
      bounds.max = bounds.width - windowWidth;
      if (data.total === index && elems === slideArrays[0]) {
        scrollContentWidth = w;
        document.body.style.height = `${w}px`;
      }
    });
  };

  const clamp = () => {
    data.current = Math.min(Math.max(data.current, 0), bounds.max);
  };
</script>

<style lang="scss">
  figure {
    padding: 0;
    margin: 0;
  }

  .scroll {
    cursor: grab;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .scroll-content {
    display: flex;
    white-space: nowrap;
    position: relative;
    height: 100vh;
    &--last {
      position: absolute;
      top: 0;
      left: 0;
    }
  }

  .logo {
    position: relative;

    &--top {
      position: fixed;
      top: 2vw;
      left: 2vw;
      z-index: 10;

      img {
        height: 1vw;
        width: auto;
      }
    }

    &--resize {
      margin-bottom: 1rem;

      img {
        width: 10rem;
        margin: 0 auto;
      }
    }

    &--mask {
      overflow: hidden;
      margin-bottom: 2rem;

      img {
        width: 15rem;
        height: auto;
        margin: 0 auto;
        visibility: hidden;
        opacity: 0;
      }
    }
  }

  .menu-btn {
    position: fixed;
    top: 2vw;
    right: 2vw;
    display: flex;
    align-items: center;
    text-decoration: none;
    z-index: 999;

    &__circles {
      position: relative;
      height: 0.45vw;
      width: 0.45vw;
      margin-right: 0.75vw;
    }

    &__circle {
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #fff;
      border-radius: 50%;

      &--top {
        visiblity: hidden;
        opacity: 0;
      }
    }

    &__text {
      color: #fff;
      font-size: 1vw;
    }
  }

  img {
    display: block;
    width: 100%;
    height: auto;
  }

  .scrollbar {
    position: absolute;
    bottom: 7.5%;
    left: 20%;
    right: 20%;
    height: 1px;
    background-color: rgba(#fff, 0.25);

    &__handle {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      transform: scaleX(0);
      transform-origin: left;
      background-color: #fff;
    }
  }

  .mask {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    visibility: hidden;
    opacity: 0;

    &__slice {
      flex: 1;
      background-color: #000;
    }

    &__inner {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translateX(-50%) translateY(-50%);
    }

    &-line {
      position: relative;
      transform-origin: left;
      width: 20rem;
      height: 2px;
      overflow: hidden;
      background-color: rgba(#fff, 0.25);
      visibility: hidden;
      opacity: 0;

      &__inner {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #fff;
        transform-origin: left;
      }
    }
  }
</style>

<svelte:window
  bind:innerHeight={windowHeight}
  bind:innerWidth={windowWidth}
  bind:scrollY
  on:resize={resize}
  on:scroll={handleScroll}
  on:mousemove={(e) => handleMouseMove(e)}
  on:mousedown={(e) => handleMouseDown(e)}
  on:mouseup={(e) => handleMouseUp(e)} />
<div class="scroll">
  <Navigation />
  <div
    class="scroll-content"
    bind:this={scrollContent[0]}
    style="transform: translate3d(-{data.last.one.toFixed(2)}px, 0, 0) scaleY({bounce}) skewX({skew}deg); width: {scrollContentWidth}px">
    {#each slideTemplates as template, i}
      <Slide
        on:slideCreate={(e) => handleSlideCreate(e)}
        imageSlide={true}
        alignment={getSlideAlignment(i + 1)}
        projectNr={i + 1}
        {...template} />
    {/each}
  </div>
  <div
    class="scroll-content scroll-content--last"
    bind:this={scrollContent[1]}
    style="transform: translate3d(-{data.last.two.toFixed(2)}px, 0, 0) scaleY({bounce}); width: {scrollContentWidth}px">
    {#each slideTemplates as template, i}
      <Slide
        on:slideCreate={(e) => handleSlideCreate(e)}
        {...template}
        alignment={getSlideAlignment(i + 1)}
        projectNr={i + 1} />
    {/each}
  </div>

  <div class="scrollbar" data-scrollbar>
    <div class="scrollbar__handle" style="transform: scaleX({scale})" bind:this={scrollHandle} />
  </div>
</div>

<div class="mask js-mask">
  <div class="mask__slice js-mask__slice" />
  <div class="mask__slice js-mask__slice" />
  <div class="mask__slice js-mask__slice" />
  <div class="mask__inner">
    <figure class="logo logo--mask">
      <img class="js-logo" src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/logo.svg" />
    </figure>
    <div class="mask-line js-mask-line">
      <div class="mask-line__inner js-mask-line" />
    </div>
  </div>
</div>
