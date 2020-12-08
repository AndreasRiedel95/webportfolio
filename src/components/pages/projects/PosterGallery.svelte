<script>
  import { onMount } from 'svelte';
  import 'intersection-observer';
  import ProjectHeader from 'components/layout/ProjectHeader.svelte';
  import Parralax from 'components/layout/Parralax.svelte';
  import ProjectIntro from 'components/layout/ProjectIntro.svelte';

  onMount(() => {
    images.forEach((image) => {
      observer.observe(image);
    });
  });
  let images = [];
  let index;
  const template = {
    header: {
      title: ['Poster Gallery'],
      year: "11-15'",
      skills: 'Privat </br> Design, Conception ',
    },
    parralax: {
      video: false,
      url: 'https://ik.imagekit.io/andreasriedel/poster_gallery_hero_2_eTyP5sKdz17ho.jpg',
    },
    intro: {
      introTitle: "It all started with having Photoshop on the parents' computer and the urge to try something new...",
      introText: [
        'Very soon I designed various posters for school events like school parties, band contests etc.',
        'Together with Photoshop the interest in the programs InDesign and Illustrator arose. And then, at some point, programming was introduced to my world - and with it the opportunity to become even more creative. But I did not say goodbye to the classic design and I still like to design in those fancy programs like Sketch or Photoshop.',
        'For now, enjoy browsing through a selection of my best posters of the early days.',
      ],
    },
  };

  const buildThresholdList = () => {
    let thresholds = [];
    let numSteps = 20;

    for (let i = 1.0; i <= numSteps; i++) {
      let ratio = i / numSteps;
      thresholds.push(ratio);
    }

    thresholds.push(0);
    return thresholds;
  };

  const config = {
    root: null,
    rootMargin: '0px',
    threshold: buildThresholdList(),
  };

  let observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.intersectionRatio > 0.3 && entry.intersectionRatio < 0.5) {
        index = parseInt(entry.target.dataset.index);
      } else if (entry.intersectionRatio > 0.5) {
        observer.unobserve(entry.target);
      }
    });
  }, config);
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
  }

  .image-gallery {
    padding-left: 100px;
    padding-right: 100px;
    @media screen and (max-width: 1000px) {
      padding-left: 20px;
      padding-right: 20px;
    }
  }

  .responsive_image {
    width: 100%;
    object-fit: cover;
    display: block;
  }

  .white-wrapper {
    background-color: #fff;
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    &--big {
      padding: 150px;
      @media screen and (max-width: 1000px) {
        padding: 100px;
      }
      @media screen and (max-width: 500px) {
        padding: 30px;
      }
    }
    &--small {
      padding: 100px;
      @media screen and (max-width: 1000px) {
        padding: 60px;
      }
      @media screen and (max-width: 500px) {
        padding: 20px;
      }
    }
    &.animate-from-center {
      transform: scale(0.8);
      transition: transform 0.7s ease-out;
      transform-origin: 50% 50%;
      &.animate-to-outside {
        transform: scale(1);
      }
    }
    &.animate-to-right,
    &.animate-to-left {
      &:before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #161616;
        z-index: 10;
        transform: scaleX(1);
        transition: transform 0.7s ease-out;
      }
      &.animate-right {
        &:before {
          content: '';
          transform-origin: 100% 50%;
          transform: scaleX(0);
        }
      }
      &.animate-left {
        &:before {
          content: '';
          transform-origin: 0% 50%;
          transform: scaleX(0);
        }
      }
    }
  }

  .description {
    position: absolute;
    right: 20px;
    bottom: 10px;
    font-size: 13px;
    line-height: 1.5;
    text-align: right;
    color: #000;
    font-family: 'Kalam', cursive;
    @media screen and (max-width: 650px) {
      display: none;
    }
  }

  .responsive-grid {
    display: grid;
    grid-gap: 100px;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    @media screen and (max-width: 650px) {
      grid-gap: 50px;
    }
    &--no-gap {
      grid-gap: 0;
    }
  }
</style>

<main>
  <div class="wrapper">
    <ProjectHeader {...template.header} />
    <Parralax {...template.parralax} />
    <div class="content">
      <ProjectIntro {...template.intro} />
      <div class="image-gallery">
        <div class="responsive-grid mb-100">
          <div
            class="white-wrapper white-wrapper--small animate-to-right"
            bind:this={images[0]}
            data-index={1}
            class:animate-right={index > 0}>
            <img
              class="responsive_image"
              src="https://ik.imagekit.io/andreasriedel/after_show_party_alone_YB50q-g9Q8i8L.jpg"
              alt="aftershow party" />
          </div>
          <div
            class="white-wrapper white-wrapper--small animate-to-left"
            bind:this={images[1]}
            data-index={2}
            class:animate-left={index > 1}>
            <img
              class="responsive_image animate-to-left"
              src="https://ik.imagekit.io/andreasriedel/schulfest_alone_FbVuOTbGNwART.jpg"
              alt="schulfest" />
          </div>
        </div>
        <div
          class="white-wrapper white-wrapper--big mb-100 animate-from-center"
          bind:this={images[3]}
          data-index={4}
          class:animate-to-outside={index > 3}>
          <img
            class="responsive_image"
            src="https://ik.imagekit.io/andreasriedel/spring_ball_both_ZXykUywth4jF.jpg"
            alt="springball" />
        </div>
        <div class="responsive-grid responsive-grid  mb-80">
          <div
            class="white-wrapper white-wrapper--small animate-to-right"
            bind:this={images[4]}
            data-index={5}
            class:animate-right={index > 4}>
            <img
              class="responsive_image"
              src="https://ik.imagekit.io/andreasriedel/wm_poster_alone_t8XH3jtoWNod.jpg"
              alt="wm poster" />
          </div>
          <div
            class="white-wrapper white-wrapper--small animate-to-left"
            bind:this={images[5]}
            data-index={6}
            class:animate-left={index > 5}>
            <img
              class="responsive_image"
              src="https://ik.imagekit.io/andreasriedel/bandcontest_mR852Y02mtTC5.jpg"
              alt="bandcontest" />
          </div>
        </div>
      </div>
    </div>
  </div>
</main>
