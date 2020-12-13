<script>
  import ProjectHeader from 'components/layout/ProjectHeader.svelte';
  import 'intersection-observer';
  import Parralax from 'components/layout/Parralax.svelte';
  import ProjectIntro from 'components/layout/ProjectIntro.svelte';
  import Slideshow from 'components/containers/Slideshow.svelte';
  import { onMount } from 'svelte';

  let vw;
  let slideshowHeight = 400;
  let active;
  let wrappers = [];

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
      introTitle: 'Conception of an app that guides visitors through the Rijksmuseum in an intuitive and simple way.',
      introText: [
        'The brief was to develop a complete prototyping series – from a paper prototype to an interactive one.',
        'For this purpose, I developed two use case scenarios which were tailored to a suitable persona.',
        'This app is all about easy navigation and intuitive swipe movements. The goal was to make the user concentrate and be as less distracted as possible. Moreover, the user can get more details and additional information by scanning the paintings.',
      ],
    },
    slideshow: {
      slides: [
        'https://ik.imagekit.io/andreasriedel/persona_1_xcL-KdAUC6en.jpg',
        '/svg/persona_4.svg',
        '/svg/persona_2.svg',
        '/svg/persona_3.svg',
      ],
      options: { imagesLoaded: true, freeScroll: true, freeScrollFriction: 0.03, contain: true, pageDots: false },
    },
  };

  let observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        active = parseInt(entry.target.dataset.index);
        observer.unobserve(entry.target);
      } else {
      }
    });
  });

  onMount(() => {
    wrappers.forEach((wrapper) => {
      observer.observe(wrapper);
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

  .wireframe-outer-wrapper {
    background-color: rgb(240, 241, 246);
  }

  .wireframe {
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    grid-gap: 100px;
    max-width: 1400px;
    margin-left: auto;
    margin-right: auto;
    padding-left: 50px;
    padding-right: 50px;
    grid-template-areas: 'text image';
    &--right {
      grid-template-columns: 1.5fr 1fr;
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
        top: 50px;
        color: #000;
        margin-top: 50px;
        & > p {
          opacity: 0;
        }
        @media screen and (max-width: 950px) {
          position: relative;
          top: 0;
          margin-top: 20px;
        }
      }
    }
    &__container {
      width: 100%;
      opacity: 0;
      grid-area: image;
    }
  }

  .wireframe-img {
    width: 100%;
  }

  .persona-grid-outer {
    background-color: #eaecf3;
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
      opacity: 0;
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
      padding: 10px 30px;
      box-shadow: -2px 0px 7px 1px rgb(31 31 31 / 20%);
      @media screen and (max-width: 950px) {
        padding: 25px 70px;
      }
      @media screen and (max-width: 600px) {
        padding: 25px 20px;
        flex-direction: column;
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
      <div class="wireframe-outer-wrapper pt-150 pb-100">
        <div class="wireframe mb-100">
          <div class="wireframe__user-stories" data-index="0" bind:this={wrappers[0]}>
            <div class="wireframe__user-stories__text">
              <div
                class="headline2 headline2--thin mb-30"
                style="color: #bbb; opacity: 0"
                class:activeFadeUp={active >= 0}>
                TO GET MORE INFORMATION ABOUT AN ARTWORK
              </div>
              <p class:activeFadeUpDelay400={active >= 0}>
                When I’m in Amsterdam with my family for only two days, we are visiting the Rijksmuseum and my son is
                annoyed by long and boring guided tours or reading long art descriptions, I want to have an easy, fast
                and entertaining way to get compact and interesting background information about the artworks we are
                passing by, so I can enjoy my visit at the museum, while my son is busy and entertained and we all can
                improve our knowledge about arts.
              </p>
            </div>
          </div>
          <div class="wireframe__container" class:activeFadeUp={active >= 0}>
            <img class:activeFadeUp={active >= 0} class="wireframe-img" src="/svg/wireframe_1_a.svg" alt="" />
            <img class:activeFadeUp={active >= 0} class="wireframe-img mt-50" src="/svg/wireframe_1_b.svg" alt="" />
          </div>
        </div>
        <div class="persona-grid-outer pt-100 pb-150">
          <div
            class="mb-100 pl-70 pr-70 max-width-500 margin-left-auto"
            data-index="2"
            bind:this={wrappers[1]}
            class:activeFadeInLeft={active >= 1}>
            <div class="headline1 headline1--thin mb-30 color-black">All about the <br /> right persona.</div>
            <div class="color-black" style="opacity: 0" class:activeFadeInLeftDelay300={active >= 1}>
              A good prototype is only as good as the persona. In this case I concentrated more on the digital knowledge
              of a possible persona.
            </div>
          </div>
          <div class="persona-grid">
            <div class="persona-grid__slideshow-wrapper" class:activeFadeUpDelay400={active >= 2}>
              <Slideshow
                slides={template.slideshow.slides}
                options={template.slideshow.options}
                height={slideshowHeight} />
            </div>
            <div
              class="persona-grid__iphone-wrapper pr-10 pl-10"
              data-index="2"
              bind:this={wrappers[2]}
              class:activeFadeUpDelay400={active >= 2}>
              <img
                class="persona-grid__iphone-img"
                width="180"
                src="https://ik.imagekit.io/andreasriedel/iphone_persona_AcupdbgBeDhv.png"
                alt="iPhone_Persona" />
              <div class="ml-20">
                <div class="headline3 mb-20">Appscreen Overview</div>
                To get an overview about apps she uses at the moment and to learn more about her mobile usage behaviour
                as well as her technological knowledge.
              </div>
            </div>
          </div>
        </div>
        <div class="wireframe wireframe--right mt-100" data-index="3" bind:this={wrappers[3]}>
          <div class="wireframe__container" class:activeFadeUp={active >= 3}>
            <img class="wireframe-img" src="/svg/wireframe_2_a.svg" alt="" />
            <img class="wireframe-img mt-50" src="/svg/wireframe_2_b.svg" alt="" />
          </div>
          <div class="wireframe__user-stories--right">
            <div class="wireframe__user-stories__text">
              <div
                class="headline2 headline2--thin mb-30"
                style="color: #bbb; opacity: 0"
                class:activeFadeUp={active >= 3}>
                TO GET MORE INFORMATION ABOUT WHAT‘S GOING ON TODAY
              </div>
              <p class:activeFadeUpDelay400={active >= 3}>
                When I wake up at our hotel room and recognize the bad wheater we were not prepared for and we decide to
                go to the museum, I want to have an opportunity to plan our day spontaneously and get easily more
                information about what‘s going on, so we can keep our feet dry and seize the day.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="width-100 background-white">
      <div
        bind:this={wrappers[4]}
        data-index="4"
        class="color-black display-grid grid-template-columns-responsive-400 pl-50 pr-50 pt-100 pb-100 grid-gap-medium background-white max-width-1200 width-100 margin-left-auto margin-right-auto">
        <div>
          <div class:activeFadeUp={active >= 4} class="opacity-0 headline1 headline1--thin mb-30 color-black">
            It's your turn!
            <br />
            Test the prototype now!
          </div>
          <p class="mb-20 opacity-0" class:activeFadeUpDelay300={active >= 4}>
            I developed an interactive prototype with Axure. You can try it out
            <a target="_blank" class="link" href="http://4t2tyj.axshare.com/#c=2">here</a>.
          </p>
          <p class="mb-20 opacity-0" class:activeFadeUpDelay400={active >= 4}>
            For the final presentation, I prepared interactive slides that explain the whole process and the reasons for
            choosing several techniques in detail. If you are interested, you can learn more about it
            <a
              target="_blank"
              class="link"
              href="https://www.icloud.com/keynote/0RSnJMtpDNqSDogDX9rJcIsqA#DesignPrototyp">here</a>.
          </p>
        </div>
        <img
          class:activeFadeUp={active >= 4}
          class="opacity-0 justify-self-center width-100"
          src="https://ik.imagekit.io/andreasriedel/rijksmuseum_phone_9zUXtR1htl3H.png"
          alt="rijksmuseum"
          style="max-width: 200px" />
      </div>
    </div>
  </div>
</main>
