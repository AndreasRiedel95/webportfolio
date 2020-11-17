<script>
  import { onMount } from 'svelte';
  import { isDragging } from 'util/store.js';
  import Navigation from 'components/layout/Navigation.svelte';
  import imagesLoaded from 'imagesloaded';
  import Slide from 'components/containers/Slide.svelte';
  import { filterClick } from 'util/store.js';
  const slideTemplates = [
    {
      id: 0,
      uuid: Date.now(),
      title: 'Turn-Over-App',
      type: 'iOS App for iPad',
      filter: 'digital',
      subTitle: 'University',
      imgSrc: '/images/toa_hero.jpg',
      url: '/project/turnOverApp',
    },
    {
      id: 1,
      uuid: Date.now(),
      title: 'Rijksmuseum',
      type: 'App Conception',
      filter: 'digital',
      subTitle: 'University',
      imgSrc: '/images/rijksmuseum_hero.jpg',
      url: '/project/rijksmuseum',
    },
    {
      id: 2,
      uuid: Date.now(),
      title: 'MAN InCar',
      type: 'Conception & App',
      filter: 'digital',
      subTitle: 'University',
      imgSrc: '/images/manincar_hero.jpg',
      url: 'project/man-incar',
    },
    {
      id: 4,
      uuid: Date.now(),
      title: 'ecographis',
      filter: 'digital',
      type: 'Website',
      subTitle: 'Work',
      imgSrc: '/images/ecographis_hero.jpg',
      url: 'project/ecographis',
    },
    {
      id: 5,
      uuid: Date.now(),
      title: 'mueslibar',
      type: 'Conception / Magazine',
      filter: 'print',
      subTitle: 'University',
      imgSrc: 'https://ik.imagekit.io/andreasriedel/mueslibar_hero_2_xyM2sGqqMRRRb.jpg',
      url: 'project/mueslibar',
    },
    {
      id: 6,
      uuid: Date.now(),
      title: 'Human </br> Projection',
      type: 'Photography',
      filter: 'multimedia',
      subTitle: 'University',
      imgSrc: '/images/projection_main.jpg',
      url: 'project/human-projection',
    },
    {
      id: 7,
      uuid: Date.now(),
      title: 'Learn to code!',
      type: 'Conception / Webapp',
      filter: 'digital',
      subTitle: 'University - Bachelorthesis',
      imgSrc: '/images/learnplatform_hero.jpg',
      url: '/project/learnplattform',
    },
    {
      id: 8,
      uuid: Date.now(),
      title: 'Poster </br> Gallery',
      type: 'Conception / Design',
      filter: 'print',
      subTitle: 'University - Bachelorthesis',
      imgSrc: '/images/poster_gallery_hero.jpg',
      url: '/project/postergallery',
    },
  ];

  let windowHeight;
  let scrollInit = false;
  let scrollContentWidth;
  let windowWidth;
  let scrollY = 0;
  let scrollContent = [];
  let scrollHandle;
  let scrollEle;
  let bounce = 0;
  let skew = 0;
  let scale = 0;
  let main;
  let dragging = false;
  let filtering = false;
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
  let rAF = null;
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
    isTouch = is_touch_device();
  });

  const is_touch_device = () => {
    if ('ontouchstart' in window || window.TouchEvent) return true;
    if (window.DocumentTouch && document instanceof DocumentTouch) return true;
    const prefixes = ['', '-webkit-', '-moz-', '-o-', '-ms-'];
    const queries = prefixes.map((prefix) => `(${prefix}touch-enabled)`);
    return window.matchMedia(queries.join(',')).matches;
  };

  const filterTemplates = (e) => {
    filterClick.set(true);
    //We have to set the filtering to retrigger animation of slides
    setTimeout(() => {
      filtering = true;
    }, 1000);
    setTimeout(() => {
      slideArrays = [[], []];
      const filter = e.detail.filter;
      let temps = slideTemplates.reduce((accu, curr) => {
        if (curr.filter === filter || filter === 'all') {
          curr.uuid = Date.now();
          accu.push(curr);
        }
        return accu;
      }, []);
      filteredTemplates = [...temps];
      filtering = false;
    }, 1500);
  };

  const resetScroll = () => {
    skew = 0;
    data.current = 0;
    scrollY = 0;
  };

  const getSlideAlignment = (i) => {
    let alignment = 'flex-start';
    if (i % 2 === 0) {
      alignment = 'center';
    } else if (i % 3 === 0) {
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
    setStyles();
    customRequestAnimationFrame();
  };

  const handleScroll = (e) => {
    if (dragging) return;

    if (navigator.userAgent.includes('Firefox')) {
      console.log('IN FIREFOX');
      data.current += e.deltaY * 2.5;
    } else {
      data.current += e.deltaY;
    }
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
    isDragging.set(true);
    drag(e);
  };

  const handleMouseUp = (e) => {
    dragging = false;
    scrollY = data.current;
    setTimeout(() => {
      isDragging.set(false);
    }, 100);
  };

  const handleTouchUp = (e) => {
    dragging = false;
    scrollY = data.current;

    setTimeout(() => {
      isDragging.set(false);
    }, 100);
  };

  const handleKeyDown = (e) => {
    switch (e.keyCode) {
      case 37:
      case 38:
        (data.current -= 175), clamp();
        break;
      case 39:
      case 40:
        (data.current += 175), clamp();
    }
  };

  const drag = (e) => {
    data.current = scrollY - (e.clientX - data.on) * 3.5;
    clamp();
  };

  const touch = (e) => {
    data.current = scrollY - (e.touches[0].clientX - data.on) * 3.5;
    clamp();
  };

  const resize = () => {
    setBounds(slideArrays[0]);
    setBounds(slideArrays[1]);
    resetScroll();
    setStyles();
  };

  const setStyles = () => {
    scrollEle.style.position = 'fixed';
    scrollEle.style.top = 0;
    scrollEle.style.left = 0;
    scrollEle.style.height = '100%';
    scrollEle.style.width = '100%';
    scrollEle.style.overflow = 'hidden';
  };

  const preload = () => {
    imagesLoaded(scrollContent, (instance) => {
      setBounds(slideArrays[0]);
      setBounds(slideArrays[1]);
    });
  };

  const run = () => {
    skew = 0;
    data.last.one = math.lerp(data.last.one, data.current, 0.035);
    data.last.one = Math.floor(data.last.one * 100) / 100;

    data.last.two = math.lerp(data.last.two, data.current, 0.03);
    data.last.two = Math.floor(data.last.two * 100) / 100;

    const diff = data.current - data.last.one;
    const acc = diff / windowWidth;
    const velo = +acc;
    bounce = 1 - Math.abs(velo * 0.25);
    skew = velo * 10;
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
      if (slideArrays[0].length - 1 === index && elems === slideArrays[0]) {
        scrollContentWidth = w;
        // main.style.height = `${w}px`;
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

  .main {
    overflow: auto;
    width: 100%;
    height: 100vh;
    -webkit-overflow-scrolling: touch;
  }

  .scroll {
    cursor: grab;
    position: fixed;
    top: 0;
    left: 0;
    -webkit-overflow-scrolling: touch;
    width: 100%;
    height: 100%;
    pointer-events: inherit;
    overflow: hidden;
  }

  .scroll-content {
    display: flex;
    white-space: nowrap;
    position: fixed;
    height: 100%;
    pointer-events: inherit;
    &--last {
      pointer-events: none;
      position: fixed;
      top: 0;
      left: 0;
    }
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
</style>

<svelte:window
  bind:innerHeight={windowHeight}
  bind:innerWidth={windowWidth}
  on:resize={resize}
  on:wheel={(e) => handleScroll(e)}
  on:keydown={(e) => handleKeyDown(e)}
  on:mousemove={(e) => handleMouseMove(e)}
  on:touchstart={(e) => handleTouchDown(e)}
  on:touchmove={(e) => handleTouchMove(e)}
  on:touchend={(e) => handleTouchUp(e)}
  on:mousedown={(e) => handleMouseDown(e)}
  on:mouseup={(e) => handleMouseUp(e)} />
<div class="main" bind:this={main}>
  <div class="scroll" bind:this={scrollEle}>
    <Navigation on:handleItemClick={(e) => filterTemplates(e)} />
    {#if !filtering}
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
    {/if}
    <div class="scrollbar" data-scrollbar>
      <div class="scrollbar__handle" style="transform: scaleX({scale})" bind:this={scrollHandle} />
    </div>
  </div>
</div>
