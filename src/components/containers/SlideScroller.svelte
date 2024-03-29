<script>
  import { onMount } from 'svelte';
  import 'intersection-observer';
  import { clamp } from 'util/helpers.js';
  export let scrollEvent;
  let maxBound;
  let transformWrapper = false;
  let actualScroll = 0;
  let startScroll = 0;
  let inScroll = false;
  let wrapper;
  let wrapperHeight;
  let innerWrapper;
  let vw;
  let vh;
  let intersector = [];
  export let slideIdentifier = 'skill';

  const templates = {
    skill: {
      inside: true,
      slides: {
        templates: [
          `<div class="slidescroller__content" style="--background: linear-gradient(90deg, rgba(225, 85, 66, 1) 0%, rgba(245, 200, 95, 1) 100%)">
            <div class="max-width-500">
              <span class="font-weight-medium">Allrounder.</span>
              From development and conception to the programming of multimedia apps and websites: In my previous projects and companies, I have gained a lot of practical experience in different areas. I am able to communicate with the respective specialists at eye level. I'm a programmer with additional expertise in UX Design.
            </div>
          </div>`,
          `<div class="slidescroller__content" style="--background: linear-gradient(90deg, rgba(241, 200, 95, 1) 0%, rgba(128, 195, 105, 1) 100%)">
            <div class="max-width-500">
              <span class="font-weight-medium">Maker.</span>
              I firmly believe that <span class="font-italic">going forward</span> is better than <span class="font-italic">standing still</span>. I easily adapt to ever-changing environments, push boundaries and strive for innovation.
              My goal is to keep evolving and always be part of the Digital Transformation. I'm aware that the most important thing for companies to last in the future is to offer their customers personalized and tailored digital solutions.

            </div>
          </div>`,
          `<div class="slidescroller__content" style="--background: linear-gradient(90deg, rgba(128, 195, 105, 1) 0%, #4994e9 100%)">
            <div class="max-width-500">
              <span class="font-weight-medium">Socializer.</span>
              Through my work at the Deutsche Oper am Rhein Düsseldorf as well as my two years of international experience in Amsterdam,
              I have learned to communicate efficiently in interdisciplinary team constellations and with different cultures.
              It is important for me to accomplish my tasks correctly and conscientiously. I am an open-minded person enjoying having fun.
            </div>
          </div>`,
          `<div class="slidescroller__content" style="--background: linear-gradient(90deg, #4994e9 0%, #603db1 100%)">
            <div class="max-width-500">
              <span class="font-weight-medium">International.</span>
             Due to my semester abroad in Amsterdam and my subsequent professional year as a Front-end developer in an Amsterdamer Consulting and IT company,
             I am used to working in multicultural and international teams and living in a global environment.
            </div>
          </div>`,
        ],
      },
    },
    about: {
      inside: false,
      slides: {
        templates: [
          `<div class="display-flex flex-direction-column flex-shrink-0 height-100 justify-content-center" style="width: 85vw">
            <div class="slidescroller__content width-100 small-image" style="background: url('https://ik.imagekit.io/andreasriedel/opera_hall_kiuODjklZsJ8.jpg'); background-size: cover; background-position: 50% 50%;"></div>
            <div class="mt-40 max-width-1000 pr-40 margin-left-auto margin-right-auto color-black">
              <span class="font-weight-medium">Düsseldorf.</span>
              After my A-levels, I followed my great passion for music and did a voluntary social year in Düsseldorf, at the Deutsche Oper
              am Rhein. After my exciting year at the longest bar in the world, I moved back to Stuttgart to start studying Print And Media Technology – Digital Publishing at the University of Media.
            </div>
          </div>`,
          `<div class="display-flex flex-direction-column flex-shrink-0 height-100 justify-content-center" style="width: 85vw">
            <div class="slidescroller__content width-100 small-image" style="background: url('https://ik.imagekit.io/andreasriedel/amsterdam_wiHN1x0zJE7rE.jpg'); background-size: cover; background-position: 50% 50%;"></div>
            <div class="mt-40 max-width-1000 pr-40 margin-left-auto margin-right-auto color-black">
              <span class="font-weight-medium">Amsterdam.</span>
                During my studies, I decided to spend a semester abroad. Here, I completed my 4th semester at the Hogeschool van Amsterdam in the Minor Mobile Development (<a class="link" href="/projects/turnOverApp"> Turn-Over-App</a>, <a class="link" href="/projects/rijksmuseum"> Rijksuseum</a>).
                As I fell in love with Amsterdam and it's multicultural environment, I stayed there for an additional practical semester as a Front-end developer.
            </div>
          </div>`,
          `<div class="display-flex flex-direction-column flex-shrink-0 height-100 justify-content-center" style="width: 85vw">
            <div class="slidescroller__content width-100 small-image" style="background: url('https://ik.imagekit.io/andreasriedel/IMG_7817_bsYhZD7VvD0Q.JPG'); background-size: cover; background-position: 50% 0%;"></div>
            <div class="mt-40 max-width-1000 pr-40 margin-left-auto margin-right-auto color-black">
              <span class="font-weight-medium">Stuttgart.</span>
              Back in Germany, I completed my Bachelor's degree as the best graduate of my faculty (<a class="link" href="/projects/learnplattform"> eLearning Platform</a>).
              While writing my thesis, I moved back to Amsterdam to work as a Front-end developer in a Consulting and IT company.
            </div>
          </div>`,
          `<div class="display-flex flex-direction-column flex-shrink-0 height-100 justify-content-center" style="width: 85vw">
            <div class="slidescroller__content width-100 small-image" style="background: url('https://ik.imagekit.io/andreasriedel/future_DnMREaIzPPKR.jpg'); background-size: cover; background-position: 50% 50%;"></div>
            <div class="mt-40 max-width-1000 pr-40 margin-left-auto margin-right-auto color-black">
              <span class="font-weight-medium">To be continued....</span>
              In March 2020, I decided that I wanted to develop myself further. Well, here we are!
              I am currently completing the PreMaster Program at the Bosch Engineering GmbH in the IoT Cloud division. My current responsibilities are mainly in the field of data visualization and cloud programming.
            </div>
          </div>`,
        ],
      },
    },
  };

  $: calculateScroll(scrollEvent);
  $: if (vw) {
    getBoundings();
  }

  onMount(() => {
    intersector.forEach((intersect) => {
      scrollObserver.observe(intersect);
    });
    getBoundings();
  });

  let scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        transformWrapper = true;
      } else {
        transformWrapper = false;
      }
    });
  });
  const getBoundings = () => {
    inScroll = false;
    maxBound = innerWrapper.scrollWidth;
    vw > 1100
      ? (wrapperHeight = maxBound - vw * 0.4)
      : (wrapperHeight = maxBound + vw);
  };

  const calculateScroll = (e) => {
    if (transformWrapper && !inScroll) {
      inScroll = true;
      let height = maxBound;
      startScroll = height - e.target.scrollTop;
    }

    if (transformWrapper) {
      actualScroll = startScroll - (maxBound - e.target.scrollTop);
      actualScroll = clamp(actualScroll, 0, maxBound - vw);
    }
  };
</script>

<svelte:window bind:innerWidth={vw} bind:innerHeight={vh} />
<div
  class="outer-wrapper"
  bind:this={wrapper}
  style="--height: {wrapperHeight}px"
>
  <div class="wrapper" bind:this={innerWrapper} style="--vh: {vh * 0.01}px">
    <div
      class="wrapper-100h display-flex width-100 position-relative display-flex align-items-center"
      style="--vh: {vh * 0.01}px"
    >
      <div
        class="wrapper__inner"
        style="transform: translate3d(-{actualScroll}px, 0,0)"
      >
        {#each templates[slideIdentifier].slides.templates as template}
          <div class="divider-padding" />
          {@html template}
        {/each}
        <div class="divider-padding" />
      </div>
      <div class="intersector" bind:this={intersector[0]} />
    </div>
  </div>
</div>

<style lang="scss">
  :global {
    .slidescroller__content {
      width: 85vw;
      flex-shrink: 0;
      min-height: 400px;
      padding: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #fff;
      background: var(--background);
    }

    .small-image {
      height: 300px;
      min-height: 300px;
      @media screen and (max-width: 500px) {
        height: 180px;
        min-height: 180px;
      }
      @media screen and (max-width: 350px) {
        height: 130px;
        min-height: 130px;
      }
    }
  }

  .outer-wrapper {
    height: var(--height);
    width: 100vw;
  }

  .wrapper {
    height: calc(var(--vh, 1vh) * 100);
    position: sticky;
    top: 0;
    background-color: #fafafa;
    display: flex;
    width: 100vw;
    align-items: center;
    padding-top: 5px;
    padding-bottom: 5px;
    overflow-x: hidden;
    overflow-y: hidden;
    &__inner {
      left: 0;
      width: 100%;
      position: absolute;
      display: flex;
    }
  }

  .divider-padding {
    width: 40px;
    flex-shrink: 0;
    height: 400px;
  }

  .intersector {
    position: absolute;
    bottom: 2vw;
    right: 0;
    width: 100px;
    height: 10px;
    @media screen and (max-width: 350px) {
      bottom: 0;
    }
  }

  .wrapper-100h {
    height: calc(var(--vh, 1vh) * 100);
  }
</style>
