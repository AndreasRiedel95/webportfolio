<script>
  import { onMount } from 'svelte';
  import ProjectHeader from 'components/layout/ProjectHeader.svelte';
  import Parralax from 'components/layout/Parralax.svelte';
  import ProjectIntro from 'components/layout/ProjectIntro.svelte';

  let images = [];
  let index;
  let template = {
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
      introTitle: 'Our team created this site to memorialize the works of great fashion photographer Peter Lindbergh.',
      introText: [
        'Obys agency is a fan of his photography and his vision, so our mission in creating this site was to remind the world of Lindbergh’s work and perhaps introduce someone to his art. Here in Ukraine, many people don’t know about him, unfortunately.',
        'The site was created entirely on Readymag, so any extra development wasn’t needed. Before this, we had only used Readymag for internal tasks and meetings. The list of animation opportunities was very attractive to us.',
      ],
    },
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

  function buildThresholdList() {
    let thresholds = [];
    let numSteps = 20;

    for (let i = 1.0; i <= numSteps; i++) {
      let ratio = i / numSteps;
      thresholds.push(ratio);
    }

    thresholds.push(0);
    return thresholds;
  }

  onMount(() => {
    images.forEach((image) => {
      console.log(image, observer);
      observer.observe(image);
    });
  });
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

  .content-header {
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
    padding-left: 20px;
    padding-right: 20px;
    &__title {
      font-size: 32px;
      font-weight: 500;
      line-height: 40px;
    }
  }

  .image-gallery {
    padding-left: 40px;
    padding-right: 40px;
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
      padding: 200px;
      @media screen and (max-width: 1000px) {
        padding: 100px;
      }
      @media screen and (max-width: 500px) {
        padding: 30px;
      }
    }
    &--small {
      padding: 120px;
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
        background-color: #000;
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
    grid-gap: 40px;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
        <div class="responsive-grid mb-80">
          <div
            class="white-wrapper white-wrapper--small animate-to-right"
            bind:this={images[0]}
            data-index={1}
            class:animate-right={index > 0}>
            <img
              class="responsive_image"
              src="https://ik.imagekit.io/andreasriedel/after_show_party_alone_YB50q-g9Q8i8L.jpg"
              alt="aftershow party" />
            <div class="description">DIN A2 Abiball Aftershow Plakat für Ellental-Gymnasien Jahrgang 2014</div>
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
            <div class="description">DIN A2 Schulfest Ellental-Gymnasien, 2011</div>
          </div>
        </div>
        <div
          class="white-wrapper white-wrapper--big mb-80 animate-from-center"
          bind:this={images[3]}
          data-index={4}
          class:animate-to-outside={index > 3}>
          <img
            class="responsive_image"
            src="https://ik.imagekit.io/andreasriedel/spring_ball_both_ZXykUywth4jF.jpg"
            alt="springball" />
          <div class="description">DIN A2 Springball Plakat für Ellental-Gymnasien 2015</div>
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
            <div class="description">DIN A2 Plakat zum WM Sieg 2014 mit Mario Götze</div>
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
            <div class="description">DIN A2 Bandcontest Plakat zum WM Sieg für Ellental-Gymnasien 2014</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>
