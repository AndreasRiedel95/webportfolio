<script>
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import 'intersection-observer';
  import ProjectHeader from 'components/layout/ProjectHeader.svelte';
  import Parralax from 'components/layout/Parralax.svelte';
  import ProjectIntro from 'components/layout/ProjectIntro.svelte';
  import Slideshow from 'components/containers/Slideshow.svelte';
  import { projectContainerScrollTop } from 'util/store.js';
  import { clamp, math } from 'util/helpers.js';

  let vh;
  let vw;
  let invertedScrollTop;
  let inverted;
  let invert = false;
  let wrappers = [];
  let secondWrapper;
  let manualLeft = 0;
  let digitalLeft = 50;
  let startScroll;
  let distance;
  let percentage;
  let animationWrapperHeight;
  let rotate;
  let active;
  const textAnimation = 300;
  const textAnimationDelay = 350;
  let manualOpacity = 1;
  let digitalOpacity = 0;

  let template = {
    header: {
      title: ['Digital InCar'],
      year: "17'",
      skills: 'University</br>Programming, <br/> Project Management',
    },
    parralax: {
      video: true,
      url: 'https://ik.imagekit.io/andreasriedel/DigitalInCarManual_Trailer_1_oqd-LEgV76Pw.mp4',
    },
    intro: {
      introTitle:
        'In cooperation with Arvato - Bertelsmann, we have designed and developed a digital onboard manual for trucks.',
      introText: [
        'The Digital InCar Manual is a digital manual for trucks of the future.',
        'Our goal is to capitalize on the possibilities of a digital system to explain the operation of the vehicle to the user intuitively and simply.',
        'Therefore we rely on innovative ways to find the relevant chapters and challenge the traditional linear structures of an analogue onboard manual. An elegant design completes the optimal user experience.',
      ],
    },
    slideshow: {
      slides: [
        'https://ik.imagekit.io/andreasriedel/DigitalInCar_Home_5TkjusMUAmoT.JPG',
        'https://ik.imagekit.io/andreasriedel/DigitalInCar_Ausstattung_ZPl_acUb9PRti.JPG',
        'https://ik.imagekit.io/andreasriedel/DigitalInCar_Aussen2_qEyEmhPOcSduN.JPG',
        'https://ik.imagekit.io/andreasriedel/DigitalInCar_Scheibenwischer_Wm1JRYd6iLyWc.JPG',
        'https://ik.imagekit.io/andreasriedel/DigitalInCar_Artikel_tpg-i0Y-nLa2.JPG',
      ],
      options: {
        imagesLoaded: true,
        percentPosition: true,
        wrapAround: false,
        pageDots: false,
        freeScroll: true,
        freeScrollFriction: 0.03,
        prevNextButtons: false,
      },
    },
  };

  $: scrollAnimation($projectContainerScrollTop);

  let observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        active = parseInt(entry.target.dataset.index);
        if (entry.target.dataset.video) {
          entry.target.querySelector('video').play();
        }
        observer.unobserve(entry.target);
      } else {
      }
    });
  });

  onMount(() => {
    wrappers.forEach((wrapper) => {
      observer.observe(wrapper);
    });
    setTimeout(() => {
      calculateBoundings();
    }, 500);
  });

  const calculateBoundings = () => {
    animationWrapperHeight = vh * 2.5;
    invertedScrollTop = inverted.getBoundingClientRect().top - vh;
    startScroll = secondWrapper.getBoundingClientRect().top - vh / 4;
  };

  const scrollAnimation = (scroll) => {
    if (scroll >= invertedScrollTop) {
      invert = true;
    } else {
      invert = false;
    }

    if (scroll >= startScroll) {
      rotate = true;
      distance = scroll - startScroll;
      percentage = (100 / animationWrapperHeight) * distance;
      manualLeft = clamp(percentage, 0, 30);
      digitalLeft = clamp(percentage, 50, 100);
      if (manualLeft >= 20) {
        let val = 1 - (percentage - 20) / 10;
        manualOpacity = clamp(val, 0, 1);
      }
      if (percentage >= 50) {
        let val = (percentage - 50) / 10;
        digitalOpacity = clamp(val, 0, 1);
      } else {
        digitalOpacity = 0;
      }
    } else {
      rotate = false;
    }
  };
</script>

<style lang="scss">
  main {
    background-color: #161616;
    color: #fff;
    width: 100%;
    z-index: 10;
  }

  .wrapper {
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    flex-direction: column;
    z-index: 10;
  }

  .content {
    background-color: #161616;
    z-index: 10;
  }

  .first-wrapper {
    position: relative;
    background-color: #eaecf3;
    transition: background-color 0.5s;
    height: calc(var(--vh, 1vh) * 70);
    &.invert {
      background-color: #161616;
    }
  }

  .second-wrapper {
    background-color: #fff;
    transition: background-color 0.5s;
    padding-bottom: 100px;
    &.invert {
      background-color: #161616;
    }
  }

  .invertEle {
    position: absolute;
    bottom: -5vh;
    height: 20px;
    width: 100px;
    right: 0;
  }

  .third-wrapper {
    background-color: #eaecf3;
  }

  .third-wrapper-divider {
    width: 100%;
    height: 20vh;
    background-color: #eaecf3;
  }

  .digital-to-print {
    font-size: 10vw;
    line-height: 12vw;
    font-weight: 700;
    text-align: center;
    position: sticky;
    color: #161616;
    transition: color 0.5s;
    top: calc(var(--vh, 1vh) * 30);
    &.invert {
      color: #fff;
    }
  }

  .animation-wrapper {
    position: sticky;
    top: 20vh;
    max-width: 1200px;
    width: 100%;
    align-items: center;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    height: 200px;
  }

  .cog-wrapper {
    position: relative;
    margin-left: auto;
    margin-right: auto;
    width: 185px;
    height: 155px;
    @media screen and (max-width: 500px) {
      width: 100px;
      height: 85px;
    }
  }

  .cog-wheel {
    position: absolute;
    &--first {
      width: 45%;
      bottom: 0;
      left: 58%;
    }
    &--second {
      width: 55%;
      bottom: 0px;
      left: 0px;
    }
    &--third {
      width: 40%;
      bottom: 55%;
      left: 45%;
    }
    &.rotate {
      animation: rotating 4s linear infinite;
    }
  }

  .manual {
    position: absolute;
    left: var(--left);
    opacity: var(--opacity);
    width: 150px;
    @media screen and (max-width: 500px) {
      width: 80px;
    }
  }

  .digital {
    position: absolute;
    left: var(--left);
    width: 150px;
    opacity: var(--opacity);
    @media screen and (max-width: 500px) {
      width: 80px;
    }
  }

  .text-animation {
    position: sticky;
    text-align: center;
    top: 60vh;
    @media screen and (max-width: 500px) {
      top: 50vh;
    }
  }

  .grid-wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-areas: 'image text';
    @media screen and (max-width: 800px) {
      grid-template-columns: 1fr;
      grid-template-areas: 'text' 'image';
    }
  }

  .videoWrapper {
    position: relative;
    padding-bottom: 56.25%; /* 16:9 */
    height: 0;
    width: 100%;
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
    &__inner {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }

  @keyframes rotating {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>

<svelte:window bind:innerHeight={vh} bind:innerWidth={vw} />
<main>
  <div class="wrapper">
    <ProjectHeader {...template.header} />
    <Parralax {...template.parralax} />
    <div class="content">
      <ProjectIntro {...template.intro} />
      <div
        class="pt-50 pb-50 display-flex justify-content-center align-items-center first-wrapper"
        class:invert
        style="--vh: {vh * 0.01}px">
        <div class:invert class="digital-to-print" style="--vh: {vh * 0.01}px">From Print To Digital</div>
        <div bind:this={inverted} class="invertEle" />
      </div>
      <div
        bind:this={secondWrapper}
        class:invert
        class="pt-50 display-flex flex-direction-column second-wrapper"
        style="height: {animationWrapperHeight}px">
        <div class="animation-wrapper mb-150 pl-50 pr-50">
          <div class="position-relative width-100 height-100 display-flex align-items-center">
            <img
              src="/svg/manual.svg"
              class="manual"
              alt="Manual"
              style="--left: {manualLeft}%; --opacity: {manualOpacity}" />
            <div class="cog-wrapper">
              <img src="/svg/cog_wheel.svg" class="cog-wheel cog-wheel--first" class:rotate alt="Cog Wheel" />
              <img src="/svg/cog_wheel.svg" class="cog-wheel cog-wheel--second" class:rotate alt="Cog Wheel" />
              <img src="/svg/cog_wheel.svg" class="cog-wheel cog-wheel--third" class:rotate alt="Cog Wheel" />
            </div>
            <img
              src="/svg/digital-icon.svg"
              class="digital"
              alt="Digital"
              style="--left: {digitalLeft}%; --opacity: {digitalOpacity}" />
          </div>
        </div>
        {#if percentage > 5 && percentage < 30}
          <div
            class="headline1 headline1--thin text-animation"
            in:fade={{ duration: textAnimation, delay: textAnimationDelay }}
            out:fade={{ duration: textAnimation }}>
            XML-Data as Input
          </div>
        {/if}
        {#if percentage >= 30 && percentage < 55}
          <div
            class="headline1 headline1--thin text-animation"
            in:fade={{ duration: textAnimation, delay: textAnimationDelay }}
            out:fade={{ duration: textAnimation }}>
            Think creative!
          </div>
        {/if}
        {#if percentage >= 55 && percentage < 100}
          <div
            class="headline1 headline1--thin text-animation"
            in:fade={{ duration: textAnimation, delay: textAnimationDelay }}
            out:fade={{ duration: textAnimation }}>
            Digital InCar Board Manual
          </div>
        {/if}
      </div>
      <div class="third-wrapper pl-50 pr-50 display-flex flex-direction-column">
        <div class="pt-200 max-width-1200 width-100 margin-left-auto margin-right-auto">
          <div
            data-index="0"
            bind:this={wrappers[0]}
            class="headline1 max-width-500  width-100 headline1--thin mb-50 color-black opacity-0"
            class:activeFadeUp={active >= 0}>
            The Search.
            <br />
            Just the way you need it.
          </div>
          <div
            class="display-grid grid-template-columns-responsive-200 justify-content-center align-items-center grid-gap-small width-100 pt-50 pb-50">
            <div
              class:activeFadeUpDelay300={active >= 0}
              class="opacity-0 display-flex text-center flex-direction-column color-black flex-shrink-0 justify-content-center align-items-center">
              <img class="mb-20" width="100" src="/svg/icon_identifier.svg" alt="Identifier" />
              Identifier.
            </div>
            <div
              class:activeFadeUpDelay400={active >= 0}
              class="opacity-0 display-flex text-center flex-direction-column color-black flex-shrink-0 justify-content-center align-items-center">
              <img class="mb-20" width="100" src="/svg/icon_search.svg" alt="Search" />
              Word Search.
            </div>
            <div
              class:activeFadeUpDelay500={active >= 0}
              class="opacity-0 display-flex flex-direction-column color-black flex-shrink-0 justify-content-center text-center align-items-center">
              <img class="mb-20" width="100" src="/svg/icon_warning.svg" alt="Warning" />
              Warning-Light-Keyboard.
            </div>
            <div
              class:activeFadeUpDelay600={active >= 0}
              class="opacity-0 display-flex flex-direction-column color-black flex-shrink-0 justify-content-center align-items-center text-center">
              <img class="mb-20" width="100" src="/svg/icon_error.svg" alt="Error" />
              Error Code Search.
            </div>
          </div>
        </div>
      </div>
      <div class="pt-200 pb-200" style="background-color: #eaecf3;">
        <div data-index="1" bind:this={wrappers[1]} class="opacity-0 width-100" class:activeFadeUp={active >= 1}>
          <Slideshow
            height={vw > 800 ? 600 : 200}
            divider={true}
            slides={template.slideshow.slides}
            options={template.slideshow.options} />
        </div>
      </div>
      <div class="pl-50 pr-50 " style="background-color: #eaecf3;">
        <div
          data-index="2"
          bind:this={wrappers[2]}
          class="width-100 max-width-1200 margin-left-auto margin-right-auto display-flex flex-direction-column"
          style="padding-bottom: 28%">
          <div
            class:activeFadeUp={active >= 2}
            class="opacity-0 headline1 headline1--thin mb-50 color-black max-width-600">
            The Identifier.
            <br />
            Don't overthink, just find what you are looking for.
          </div>
          <p class:activeFadeUpDelay300={active >= 2} class="opacity-0 color-black width-100 max-width-600">
            Imagine you want to change the wheels of your vehicle, and you are looking for instructions in the manual.
            Usually, you would have to search for the right chapter in the rather long and confusing index. Instead, our
            identifier directly brings you to the chapter you are looking for. Almost without having to think.
          </p>
        </div>
      </div>
      <div
        data-index="3"
        data-video="true"
        bind:this={wrappers[3]}
        class:activeFadeUp={active >= 3}
        class="opacity-0 width-100 display-flex flex-direction-column justify-content-center pl-50 pr-50">
        <div class="videoWrapper mt-50" style="transform: translateY(-50%)">
          <video class="videoWrapper__inner" muted loop playsinline>
            <source
              src="https://ik.imagekit.io/andreasriedel/DigitalInCar_Identifier2_m4u5YtXz4Ck7k.mp4"
              type="video/mp4" />
          </video>
        </div>
      </div>
      <div
        style="padding-bottom: 28%"
        class="grid-wrapper height-100 grid-gap-medium margin-left-auto margin-right-auto  max-width-1200 width-100 pl-50 pr-50">
        <div data-index="4" bind:this={wrappers[4]} class="display-flex width-100">
          <img
            class:activeFadeUp={active >= 4}
            style="grid-area: image"
            class="opacity-0 width-100 height-100 object-fit-contain"
            src="https://ik.imagekit.io/andreasriedel/Warning_Signal_keyboard_e0k5yO1PXIxf.JPG"
            alt="" />
        </div>
        <div
          style="grid-area: text"
          class:activeFadeUp={active >= 4}
          class="opacity-0 display-flex width-100 flex-direction-column justify-content-center">
          <div class="headline2 headline2--thin mb-50 color-white max-width-600">
            The Warning-Light-Keyboard.
            <br />
            All warning lights at a glance.
          </div>
          <p class="color-white width-100 max-width-600">
            An unknown warning light appears. What does that mean again?
            <br />
            With our Warning-Light-Keyboard you can find all warning signals clearly arranged in one place.
          </p>
        </div>
      </div>
      <div data-index="5" bind:this={wrappers[5]} class="pl-50 pr-50" style="padding-bottom: 28%">
        <div
          class:activeFadeUp={active >= 5}
          class="opacity-0 width-100 max-width-1200 margin-left-auto margin-right-auto display-flex flex-direction-column position-relative">
          <div class="headline1 headline1--thin mb-50 color-white max-width-600">
            Take it with you.
            <br />
            Whereever you are.
          </div>
          <p class:activeFadeUpDelay300={active >= 5} class="opacity-0 color-white width-100 max-width-600">
            Imagine you want to change the motor oil, but you need the provided checklist with you to make sure you do
            it right. No problem. It takes you just one click, to send the chapter of your choice to your smartphone for
            further editing.
          </p>
        </div>
      </div>
      <div
        data-index="6"
        data-video="true"
        bind:this={wrappers[6]}
        class:activeFadeUp={active >= 6}
        class="opacity-0  pr-50 pl-50"
        style="background-color: #eaecf3;">
        <div class="max-width-1200 width-100 margin-left-auto margin-right-auto" style="transform: translateY(-50%)">
          <div class="width-100 display-flex flex-direction-column justify-content-center">
            <div class="videoWrapper mt-50">
              <video class="videoWrapper__inner" muted loop playsinline>
                <source
                  src="https://ik.imagekit.io/andreasriedel/DigitalInCar_handover_UVqe7b4BitQW.mp4"
                  type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>
