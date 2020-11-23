<script>
  import ProjectHeader from 'components/layout/ProjectHeader.svelte';
  import ProjectSubheadline from 'components/layout/ProjectSubheadline.svelte';
  import Parralax from 'components/layout/Parralax.svelte';
  import ProjectIntro from 'components/layout/ProjectIntro.svelte';
  import Slideshow from 'components/containers/Slideshow.svelte';

  let vw;
  let slideshowHeight = 400;

  $: if (vw < 600) {
    slideshowHeight = 200;
  } else {
    slideshowHeight = 400;
  }

  let template = {
    header: {
      title: ['Rijksmuseum'],
      year: "18'",
      skills: 'University </br> Conception, User Stories </br> Prototyping',
    },
    parralax: {
      video: false,
      url: 'https://ik.imagekit.io/andreasriedel/rijksmuseum_hero2_1jSB2H8_6t6n.jpg',
    },
    intro: {
      introTitle: 'Our team created this site to memorialize the works of great fashion photographer Peter Lindbergh.',
      introText: [
        'Obys agency is a fan of his photography and his vision, so our mission in creating this site was to remind the world of Lindbergh’s work and perhaps introduce someone to his art. Here in Ukraine, many people don’t know about him, unfortunately.',
        'The site was created entirely on Readymag, so any extra development wasn’t needed. Before this, we had only used Readymag for internal tasks and meetings. The list of animation opportunities was very attractive to us.',
      ],
    },
    slideshow: {
      slides: [
        'https://ik.imagekit.io/andreasriedel/persona_1_xcL-KdAUC6en.jpg',
        '/svg/persona_2.svg',
        '/svg/persona_3.svg',
      ],
      options: { imagesLoaded: true, freeScroll: true, contain: true, pageDots: false },
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

  .wireframe {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 100px;
    padding-left: 70px;
    padding-right: 70px;
    grid-template-areas: 'text image';
    &--right {
      grid-template-areas: 'image text';
    }
    @media screen and (max-width: 950px) {
      grid-template-columns: 1fr;
      padding-left: 20px;
      padding-right: 20px;
      grid-template-areas: 'text' 'image';
    }

    &__user-stories {
      grid-area: text;
      max-width: 500px;
      margin-left: auto;
      position: relative;
      padding-left: 40px;
      @media screen and (max-width: 950px) {
        padding-left: 30px;
        padding-right: 30px;
        max-width: 100%;
      }
      @media screen and (max-width: 650px) {
        padding-left: 10px;
        padding-right: 10px;
      }
      &--right {
        text-align: left;
        margin-right: auto;
        max-width: 500px;
        padding-right: 40px;
        @media screen and (max-width: 950px) {
          padding-right: 0px;
        }
      }
      &__text {
        position: sticky;
        top: 200px;
        margin-top: 200px;
        @media screen and (max-width: 950px) {
          position: relative;
          top: 0;
          margin-top: 20px;
        }
      }
    }
    &__container {
      width: 100%;
      grid-area: image;
    }
  }

  .wireframe-img {
    width: 100%;
  }

  .persona-grid {
    display: grid;
    grid-template-columns: 1fr 450px;
    justify-content: center;
    @media screen and (max-width: 1100px) {
      grid-template-columns: 1fr 400px;
    }
    @media screen and (max-width: 950px) {
      grid-template-columns: 1fr;
    }
    &__slideshow-wrapper {
      flex-grow: 1;
      height: 400px;
      @media screen and (max-width: 600px) {
        height: 200px;
      }
    }
    &__iphone-wrapper {
      display: flex;
      z-index: 10;
      justify-content: center;
      align-items: center;
      background-color: rgb(240, 241, 246);
      color: #000;
      padding: 10px 10px 10px 30px;
      box-shadow: -2px 0px 7px 1px rgb(31 31 31 / 20%);
      @media screen and (max-width: 600px) {
        flex-direction: column;
        padding: 15px 20px;
        box-shadow: none;
        & > img {
          height: 250px;
          margin-bottom: 20px;
        }
      }
    }
    &__iphone-img {
      height: 100%;
      object-fit: contain;
    }
  }
</style>

<svelte:window bind:innerWidth={vw} />
<main>
  <div class="wrapper">
    <ProjectHeader {...template.header} />
    <Parralax {...template.parralax} />
    <div class="content">
      <ProjectIntro {...template.intro} />
      <ProjectSubheadline title="Persona" />
      <div class="persona-grid mb-200">
        <div class="persona-grid__slideshow-wrapper">
          <Slideshow slides={template.slideshow.slides} options={template.slideshow.options} height={slideshowHeight} />
        </div>
        <div class="persona-grid__iphone-wrapper pr-10 pl-10">
          <img
            class="persona-grid__iphone-img"
            width="180"
            src="https://ik.imagekit.io/andreasriedel/iphone_persona_AcupdbgBeDhv.png"
            alt="iPhone_Persona" />
          <div class="ml-20">
            <div class="headline3 mb-20">Appscreen Overview</div>
            To get an overview about apps she uses at the moment and to learn more about her mobile usage behaviour as
            well as her technological knowledge.
          </div>
        </div>
      </div>
      <ProjectSubheadline title="User Stories" />
      <div class="wireframe mb-100">
        <div class="wireframe__user-stories">
          <div class="wireframe__user-stories__text">
            <div class="headline2 headline2--thin mb-30" style="color: #bbb">
              TO GET MORE INFORMATION ABOUT AN ARTWORK
            </div>
            <p>
              When I’m in Amsterdam with my family for only two days, we are visiting the Rijksmuseum and my son is
              annoyed by long and boring guided tours or reading long art descriptions, I want to have an easy, fast and
              entertaining way to get compact and interesting background information about the artworks we are passing
              by, so I can enjoy my visit at the museum, while my son is busy and entertained and we all can improve our
              knowledge about arts.
            </p>
          </div>
        </div>
        <div class="wireframe__container">
          <img class="wireframe-img" src="/svg/wireframe_1_a.svg" alt="" />
          <img class="wireframe-img mt-50" src="/svg/wireframe_1_b.svg" alt="" />
        </div>
      </div>
      <div class="wireframe wireframe--right mb-100">
        <div class="wireframe__container">
          <img class="wireframe-img" src="/svg/wireframe_2_a.svg" alt="" />
          <img class="wireframe-img mt-50" src="/svg/wireframe_2_b.svg" alt="" />
        </div>
        <div class="wireframe__user-stories--right">
          <div class="wireframe__user-stories__text">
            <div class="headline2 headline2--thin mb-30" style="color: #bbb">
              TO GET MORE INFORMATION ABOUT WHAT‘S GOING ON TODAY
            </div>
            <p>
              When I wake up at our hotel room and recognize the bad wheater we were not prepared for and we decide to
              go to the museum, I want to have an opportunity to plan our day spontaneously and get easily more
              information about what‘s going on, so we can keep our feet dry and seize the day.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>
