<script>
  import { onMount } from 'svelte';
  import ProjectHeader from 'components/layout/ProjectHeader.svelte';
  import Parralax from 'components/layout/Parralax.svelte';
  import ProjectIntro from 'components/layout/ProjectIntro.svelte';
  import { projectContainerScrollTop } from 'util/store.js';

  const factor = 0.1;
  let yvalue1 = 0;
  let yvalue2 = 0;
  let lastVal1 = 0;
  let lastVal2 = 0;

  let images = {
    image1: {
      ele: null,
      scrollTop: 0,
      distance: 0,
    },
    image2: {
      ele: null,
      scrollTop: 0,
      distance: 0,
    },
  };

  let template = {
    header: {
      title: ['ecographis'],
      year: "19'",
      skills: 'Work </br>Programming </br> Responisve CSS, HTML5, ',
    },
    parralax: {
      video: false,
      url: 'https://ik.imagekit.io/andreasriedel/ecographis_hero2_7Ii9E5onbVmqQ.jpg',
    },
    intro: {
      introTitle: 'ecographis is a design agency, which develops and implements sustainable concepts and designs.',
      introText: [
        'The design was provided by the agency. I developed the site with HTML5, CSS3 and Javascript – of course fully responsive and touch-friendly.',
        'The large, full-screen slideshows at the top of the pages are an unique eye-catcher. Through those slides, the highlighted projects get the attention they deserve.',
        "You want to see the site in action? Then click <a target='_blank' class='link --inverted' href='https://ecographis.de/'>here</a>!",
      ],
    },
  };

  onMount(() => {
    images.image1.scrollTop = images.image1.ele.getBoundingClientRect().top;
    images.image2.scrollTop = images.image2.ele.getBoundingClientRect().top;
  });

  $: {
    lastVal1 = lerp(lastVal1, $projectContainerScrollTop - images.image1.scrollTop * 1.1, 0.08);
    lastVal2 = lerp(lastVal2, $projectContainerScrollTop - images.image2.scrollTop * 1.1, 0.08);
    yvalue1 = lastVal1 * factor;
    yvalue2 = lastVal2 * factor;
  }

  const lerp = (a, b, n) => {
    return (1 - n) * a + n * b;
  };
</script>

<style lang="scss">
  main {
    background-color: #161616;
    color: #fff;
    width: 100%;
  }

  .wrapper {
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    flex-direction: column;
  }

  .content {
    background-color: #161616;
    max-width: 1400px;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    &__parralax-wrapper {
      max-width: 80vw;
      width: 100%;
      margin-left: auto;
      margin-right: auto;
    }
    &__text-wrapper {
      grid-area: text;
      display: flex;
      &--first {
        max-width: 500px;
        margin-right: auto;
        margin-left: -120px;
        z-index: 10;
        @media screen and (max-width: 800px) {
          margin-left: auto;
          margin-right: auto;
        }
      }
    }
    &__image-wrapper {
      display: grid;
      grid-gap: 70px;
      width: 100%;
      padding-left: 50px;
      padding-right: 50px;
      position: relative;
      @media screen and (max-width: 800px) {
        width: 90%;
        grid-gap: 90px;
        margin-left: auto;
        margin-right: auto;
      }
      &.c_2_1 {
        grid-template-columns: 3fr 2fr;
        grid-template-areas: 'image text';
        @media screen and (max-width: 800px) {
          grid-template-areas: 'text' 'image';
          grid-template-columns: 1fr;
        }
      }
      &.c_1_2 {
        grid-template-columns: 2fr 3fr;
        grid-template-areas: 'text image';
        @media screen and (max-width: 800px) {
          grid-template-areas: 'image' 'text';
          grid-template-columns: 1fr;
        }
      }
    }
    &__image {
      width: 100%;
      grid-area: image;
      &--first {
        margin-bottom: -20%;
      }
      &--second {
        margin-top: -20%;
      }
    }
  }

  .link-eco {
    width: 15vw;
    height: 15vw;
    max-height: 400px;
    max-width: 400px;
    min-height: 90px;
    min-width: 90px;
    align-self: center;
    justify-self: center;
    transform: rotate(-45deg);
    border: 2px solid #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: auto;
    border-radius: 50%;
    background-color: transparent;
    transition: background-color 0.5s ease-out;
    @media screen and (max-width: 800px) {
      margin-right: auto;
      transform: rotate(-90deg);
    }
    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 50%;
      z-index: 10;
      background-color: #fff;
      transform: scale(0) rotate(45deg);
      transform-origin: 50% 50%;
      transition: transform 0.5s ease-in;
    }
    & > svg {
      width: 50%;
    }
    &:hover {
      &:before {
        content: 'See live!';
        color: #000;
        transform: scale(1) rotate(45deg);
      }
    }
  }
</style>

<main>
  <div class="wrapper">
    <ProjectHeader {...template.header} />
    <Parralax {...template.parralax} />
    <div class="content pb-250">
      <ProjectIntro {...template.intro} />
      <div class="content__image-wrapper c_2_1">
        <img
          src="https://ik.imagekit.io/andreasriedel/ecographis_main_2_kanP0DUS7ZrHN.jpg"
          class="content__image content__image--first "
          alt="ecographis"
          bind:this={images.image1.ele}
          style="transform: translate3d(0, -{yvalue1}px, 0)" />
        <div class="content__text-wrapper--first headline3">ecographis <br /> DESIGN AGENCY WEBSITE.</div>
      </div>
      <div class="content__parralax-wrapper">
        <img
          src="https://ik.imagekit.io/andreasriedel/ecographis_main_VlDMTWdNoZCk.jpg"
          alt="ecographis"
          style="width: 100%; " />
      </div>
      <div class="content__image-wrapper c_1_2">
        <div class="content__text-wrapper">
          <a target="_blank" class="link-eco" href="https://ecographis.de/">
            <svg class="button__arrow" viewBox="0 0 91 118" fill="none">
              <path
                d="M15.2307 57.4152L15.9378 56.708L15.2307 56.0009L14.5236 56.708L15.2307 57.4152ZM34.9813 77.1658L34.2742 77.8729L35.9813 79.58L35.9813 77.1658L34.9813 77.1658ZM0.151478 72.4944L-0.555622 71.7873L-1.26273 72.4944L-0.555622 73.2015L0.151478 72.4944ZM45.29 117.633L44.5828 118.34L45.29 119.047L45.9971 118.34L45.29 117.633ZM60.3692 102.554L61.0763 103.261L61.7839 102.553L61.0758 101.846L60.3692 102.554ZM60.3685 102.553L59.6614 101.846L58.9538 102.553L59.6619 103.261L60.3685 102.553ZM90.427 72.4944L91.1341 73.2015L91.8412 72.4944L91.1341 71.7873L90.427 72.4944ZM75.3478 57.4152L76.0549 56.7081L75.3478 56.001L74.6407 56.7081L75.3478 57.4152ZM56.3065 76.4565L55.3065 76.4565L55.3065 78.8707L57.0136 77.1636L56.3065 76.4565ZM56.3065 0.120074L57.3065 0.120074L57.3065 -0.879926L56.3065 -0.879926L56.3065 0.120074ZM34.9813 0.120076L34.9813 -0.879924L33.9813 -0.879924L33.9813 0.120076L34.9813 0.120076ZM14.5236 58.1223L34.2742 77.8729L35.6884 76.4587L15.9378 56.708L14.5236 58.1223ZM0.858585 73.2015L15.9378 58.1223L14.5236 56.708L-0.555622 71.7873L0.858585 73.2015ZM45.9971 116.926L0.858585 71.7873L-0.555622 73.2015L44.5828 118.34L45.9971 116.926ZM59.662 101.846L44.5828 116.926L45.9971 118.34L61.0763 103.261L59.662 101.846ZM59.6619 103.261L59.6625 103.261L61.0758 101.846L61.0751 101.845L59.6619 103.261ZM61.0756 103.26L91.1341 73.2015L89.7199 71.7873L59.6614 101.846L61.0756 103.26ZM91.1341 71.7873L76.0549 56.7081L74.6407 58.1223L89.7199 73.2015L91.1341 71.7873ZM74.6407 56.7081L55.5994 75.7494L57.0136 77.1636L76.0549 58.1223L74.6407 56.7081ZM57.3065 76.4565L57.3065 0.120074L55.3065 0.120074L55.3065 76.4565L57.3065 76.4565ZM56.3065 -0.879926L34.9813 -0.879924L34.9813 1.12008L56.3065 1.12007L56.3065 -0.879926ZM33.9813 0.120076L33.9813 77.1658L35.9813 77.1658L35.9813 0.120076L33.9813 0.120076Z"
                fill="#fff" /></svg>
          </a>
        </div>
        <img
          src="https://ik.imagekit.io/andreasriedel/ecographis_main_1_DdctYtm2SwcRP.jpg"
          class="content__image content__image--second"
          bind:this={images.image2.ele}
          alt="ecographis"
          style="transform: translate3d(0, {yvalue2}px, 0)" />
      </div>
    </div>
  </div>
</main>
