<script>
  import { onMount } from 'svelte';
  // import gsap from 'gsap';
  // import { TimelineMax, Expo } from 'gsap/all';
  import { TimelineMax, Expo, CSSPlugin } from 'gsap';
  import Navigation from './components/layout/Navigation.svelte';
  import imagesLoaded from 'imagesloaded';
  import Slide from './components/containers/Slide.svelte';
  // gsap.registerPlugin(TimelineMax);
  const slideTemplates = [
    {
      id: 0,
      uuid: Date.now(),
      title: 'TurnOver',
      type: 'iOS App for iPad',
      filter: 'digital',
      subTitle: 'University',
      imgSrc: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/project-one.png',
      url: '',
    },
    {
      id: 1,
      uuid: Date.now(),
      title: 'Rijksmuseums',
      type: 'App Conception',
      filter: 'digital',
      subTitle: 'University',
      imgSrc: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/project-two.png',
      url: '',
    },
    {
      id: 2,
      uuid: Date.now(),
      title: 'MAN InCar',
      type: 'Conception & App',
      filter: 'digital',
      subTitle: 'University',
      imgSrc: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/project-three.png',
      url: '',
    },
    {
      id: 4,
      uuid: Date.now(),
      title: 'ecographis',
      filter: 'digital',
      type: 'Website',
      subTitle: 'Work',
      imgSrc: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/project-one.png',
      url: '',
    },
    {
      id: 5,
      uuid: Date.now(),
      title: 'mueslibar',
      type: 'Conception / Magazine',
      filter: 'print',
      subTitle: 'University',
      imgSrc: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/project-two.png',
      url: '',
    },
    {
      id: 6,
      uuid: Date.now(),
      title: 'Human Projection',
      type: 'Photography',
      filter: 'multimedia',
      subTitle: 'University',
      imgSrc: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/project-three.png',
      url: '',
    },
    {
      id: 7,
      uuid: Date.now(),
      title: 'Learn to code!',
      type: 'Conception / Webapp',
      filter: 'digital',
      subTitle: 'University - Bachelorthesis',
      imgSrc: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/project-three.png',
      url: '',
    },
    {
      id: 8,
      uuid: Date.now(),
      title: 'Poster Gallery',
      type: 'Conception / Design',
      filter: 'print',
      subTitle: 'University - Bachelorthesis',
      imgSrc: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/project-three.png',
      url: '',
    },
  ];

  let windowHeight;
  let scrollInit = false;
  let scrollContentWidth;
  let windowWidth;
  let scrollY = 0;
  let scrollContent = [];
  let scrollHandle;
  let bounce = 0;
  let skew = 0;
  let scale = 0;
  let filteredTemplates = slideTemplates;
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
  let isTouch = false;

  //Transition
  let mask;
  let maskSlices = [];
  let maskLines = [];
  let tl = null;
  let transitionState = false;
  let logo;
  let dom = {};

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

  $: if (
    slideArrays[0].length === filteredTemplates.length &&
    slideArrays[1].length === filteredTemplates.length &&
    !scrollInit
  ) {
    scrollInit = true;
    initScroll();
  }

  onMount(() => {
    transition();
    isTouch = is_touch_device();
  });

  const is_touch_device = () => {
    if ('ontouchstart' in window || window.TouchEvent) return true;
    if (window.DocumentTouch && document instanceof DocumentTouch) return true;
    const prefixes = ['', '-webkit-', '-moz-', '-o-', '-ms-'];
    const queries = prefixes.map((prefix) => `(${prefix}touch-enabled)`);
    return window.matchMedia(queries.join(',')).matches;
  };

  const transition = () => {
    dom = {
      images: [...document.querySelectorAll('.js-transition-img')],
      imagesInner: [...document.querySelectorAll('.js-transition-img__inner')],
      titles: [...document.querySelectorAll('.js-transition-title')],
    };
    initTransition();
  };

  const filterTemplates = (e) => {
    triggerAnimation();
    setTimeout(() => {
      slideArrays = [[], []];
      const filter = e.detail.filter;
      filteredTemplates = slideTemplates.reduce((accu, curr) => {
        if (curr.filter === filter || filter === 'all') {
          curr.uuid = Date.now();
          accu.push(curr);
        }
        return accu;
      }, []);

      console.log('filtertemplates', filteredTemplates);
    }, 1500);
  };

  const initTransition = () => {
    createTimeline();
    transitionLoader();
  };

  const transitionLoader = () => {
    resetScroll();
    tl.tweenFromTo('loaderStart', 'loaderEnd');
  };

  const resetScroll = () => {
    skew = 0;
    data.current = 0;
    scrollY = 0;
  };

  const triggerAnimation = () => {
    if (transitionState) return;
    transitionState = true;
    tl.restart();
  };

  const createTimeline = () => {
    tl = new TimelineMax({
      paused: true,
      onComplete: () => {
        transitionState = false;
      },
    });

    tl.set([dom.images, dom.imagesInner], {
      xPercent: 0,
      scale: 1,
    })
      .set(dom.titles, {
        yPercent: 0,
      })
      .set(mask, {
        autoAlpha: 1,
      })
      .staggerFromTo(
        maskSlices,
        1.5,
        {
          xPercent: 100,
        },
        {
          xPercent: 0,
          ease: Expo.easeInOut,
        },
        -0.075
      )
      .add(resetScroll)
      .addLabel('loaderStart')
      .set(dom.images, {
        xPercent: -100,
      })
      .set(dom.imagesInner, {
        xPercent: 100,
      })
      .set(dom.titles, {
        yPercent: -100,
      })
      .set([maskLines[0], logo], {
        autoAlpha: 1,
      })
      .fromTo(
        logo,
        1,
        {
          yPercent: -100,
          rotation: 0,
        },
        {
          yPercent: 0,
          rotation: 0,
          ease: Expo.easeOut,
        }
      )
      .staggerFromTo(
        maskLines,
        1,
        {
          scaleX: 0,
        },
        {
          scaleX: 1,
          ease: Expo.easeInOut,
        },
        0.75,
        '-=1'
      )
      .set(maskLines, {
        transformOrigin: 'right',
      })
      .fromTo(
        maskLines[0],
        1,
        {
          scaleX: 1,
        },
        {
          scaleX: 0,
          ease: Expo.easeInOut,
        }
      )
      .fromTo(
        logo,
        1,
        {
          yPercent: 0,
        },
        {
          yPercent: 105,
          ease: Expo.easeOut,
        },
        '-=1'
      )
      .staggerFromTo(
        maskSlices,
        1.5,
        {
          xPercent: 0,
        },
        {
          xPercent: 100,
          ease: Expo.easeInOut,
        },
        0.075
      )
      .set(mask, {
        autoAlpha: 0,
      })
      .addLabel('imagesStart', '-=0.85')
      .staggerFromTo(
        dom.titles,
        1.5,
        {
          yPercent: 100,
        },
        {
          yPercent: 0,
          ease: Expo.easeInOut,
        },
        0.05,
        'imagesStart'
      )
      .staggerFromTo(
        dom.images,
        1.25,
        {
          xPercent: -100,
        },
        {
          xPercent: 0,
          ease: Expo.easeInOut,
        },
        0.05,
        'imagesStart'
      )
      .staggerFromTo(
        dom.imagesInner,
        1.25,
        {
          xPercent: 100,
        },
        {
          xPercent: 0,
          ease: Expo.easeInOut,
        },
        0.05,
        'imagesStart'
      )
      .addLabel('loaderEnd');
  };

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
  };

  const handleSlideCreate = (e) => {
    if (e.detail.cluster === 1 && e.detail.slide) {
      slideArrays = [[...slideArrays[0], e.detail.slide], [...slideArrays[1]]];
    } else if (e.detail.cluster === 2 && e.detail.slide) {
      slideArrays = [[...slideArrays[0]], [...slideArrays[1], e.detail.slide]];
    }
    resize();
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

  const handleTouchDown = (e) => {
    dragging = true;
    data.on = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (!dragging) return;
    touch(e);
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

  const touch = (e) => {
    data.current = scrollY - (e.touches[0].clientX - data.on);
    clamp();
  };

  const resize = () => {
    setBounds(slideArrays[0]);
    setBounds(slideArrays[1]);
    resetScroll();
  };

  const preload = () => {
    imagesLoaded(scrollContent, (instance) => {
      setBounds(slideArrays[0]);
      setBounds(slideArrays[1]);
    });
  };

  const run = () => {
    skew = 0;
    console.log(data.current);
    data.last.one = math.lerp(data.last.one, data.current, 0.085);
    data.last.one = Math.floor(data.last.one * 100) / 100;

    data.last.two = math.lerp(data.last.two, data.current, 0.07);
    data.last.two = Math.floor(data.last.two * 100) / 100;

    const diff = data.current - data.last.one;
    const acc = diff / windowWidth;
    const velo = +acc;
    bounce = 1 - Math.abs(velo * 0.25);
    skew = velo * 35;
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
    pointer-events: inherit;
    overflow: hidden;
  }

  .scroll-content {
    display: flex;
    white-space: nowrap;
    position: relative;
    height: 100vh;
    pointer-events: inherit;
    &--last {
      pointer-events: none;
      position: absolute;
      top: 0;
      left: 0;
    }
  }

  .logo {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    &--mask {
      overflow: hidden;
      height: 18px;
      margin-bottom: 20px;
    }
    &--font {
      font-size: 1.2vw;
      font-family: 'Domine', serif;
      color: #fff;
      letter-spacing: 1.1;
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
  on:touchstart={(e) => handleTouchDown(e)}
  on:touchmove={(e) => handleTouchMove(e)}
  on:touchend={(e) => handleMouseUp(e)}
  on:mousemove={(e) => handleMouseMove(e)}
  on:mousedown={(e) => handleMouseDown(e)}
  on:mouseup={(e) => handleMouseUp(e)} />
<div class="scroll">
  <Navigation on:handleItemClick={(e) => filterTemplates(e)} />
  <div
    class="scroll-content"
    bind:this={scrollContent[0]}
    style="transform: translate3d(-{data.last.one.toFixed(2)}px, 0, 0) scaleY({bounce}) skewX({skew}deg); width: {scrollContentWidth}px">
    {#each filteredTemplates as template, i}
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
    {#each filteredTemplates as template, i}
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

<div class="mask" bind:this={mask}>
  <div class="mask__slice" bind:this={maskSlices[0]} />
  <div class="mask__slice" bind:this={maskSlices[1]} />
  <div class="mask__slice" bind:this={maskSlices[2]} />
  <div class="mask__inner">
    <div class="logo logo--mask">
      <div class="logo--font" bind:this={logo}>ANDREAS RIEDEL</div>
    </div>
    <div class="mask-line" bind:this={maskLines[0]}>
      <div class="mask-line__inner" bind:this={maskLines[1]} />
    </div>
  </div>
</div>
