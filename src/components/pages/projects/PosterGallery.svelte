<script>
  import ProjectHeader from 'components/layout/ProjectHeader.svelte';
  import Parralax from 'components/layout/Parralax.svelte';
  import ProjectIntro from 'components/layout/ProjectIntro.svelte';

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
    // @media screen and (max-width: 500px) {
    //   width: 300px;
    // }
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
          <div class="white-wrapper white-wrapper--small">
            <img
              class="responsive_image"
              src="https://ik.imagekit.io/andreasriedel/after_show_party_alone_YB50q-g9Q8i8L.jpg"
              alt="aftershow party" />
            <div class="description">DIN A2 Abiball Aftershow Plakat für Ellental-Gymnasien Jahrgang 2014</div>
          </div>
          <div class="white-wrapper white-wrapper--small">
            <img
              class="responsive_image"
              src="https://ik.imagekit.io/andreasriedel/schulfest_alone_FbVuOTbGNwART.jpg"
              alt="schulfest" />
            <div class="description">DIN A2 Schulfest Ellental-Gymnasien, 2011</div>
          </div>
        </div>
        <div class="white-wrapper white-wrapper--big mb-80">
          <img
            class="responsive_image"
            src="https://ik.imagekit.io/andreasriedel/spring_ball_both_ZXykUywth4jF.jpg"
            alt="springball" />
          <div class="description">DIN A2 Springball Plakat für Ellental-Gymnasien 2015</div>
        </div>
        <div class="responsive-grid responsive-grid  mb-80">
          <div class="white-wrapper white-wrapper--small">
            <img
              class="responsive_image"
              src="https://ik.imagekit.io/andreasriedel/wm_poster_alone_t8XH3jtoWNod.jpg"
              alt="wm poster" />
            <div class="description">DIN A2 Plakat zum WM Sieg 2014 mit Mario Götze</div>
          </div>
          <div class="white-wrapper white-wrapper--small">
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
