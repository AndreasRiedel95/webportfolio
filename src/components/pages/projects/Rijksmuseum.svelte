<script>
  import ProjectHeader from 'components/layout/ProjectHeader.svelte';
  import Parralax from 'components/layout/Parralax.svelte';
  import ProjectIntro from 'components/layout/ProjectIntro.svelte';

  let template = {
    header: {
      title: ['Rijksmuseum'],
      year: "18'",
      skills: 'University </br> Conception, User Stories </br> Prototyping',
    },
    parralax: {
      video: false,
      url: 'https://ik.imagekit.io/andreasriedel/rijksmuseum_hero2_0QvExjcQDRQNQ.jpg',
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

  .wireframe {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 70px;
    padding-left: 20px;
    padding-right: 20px;
    grid-template-areas: 'text image';
    &--right {
      grid-template-areas: 'image text';
    }
    @media screen and (max-width: 950px) {
      grid-template-columns: 1fr;
      grid-template-areas: 'text' 'image';
    }

    &__user-stories {
      text-align: right;
      grid-area: text;
      max-width: 500px;
      margin-left: auto;
      position: relative;
      padding-left: 40px;
      @media screen and (max-width: 950px) {
        padding-left: 30px;
        padding-right: 30px;
        text-align: left;
        max-width: 100%;
      }
      @media screen and (max-width: 650px) {
        padding-left: 10px;
        padding-right: 10px;
      }
      &--right {
        text-align: left;
        margin-right: auto;
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

  .subheadline {
    font-family: 'Domine', serif;
    font-style: italic;
    font-size: 40px;
    padding-left: 50px;
    padding-right: 50px;
    @media screen and (max-width: 650px) {
      padding-left: 30px;
      padding-right: 30px;
    }
    &__inner {
      display: inline-block;
    }
  }
</style>

<main>
  <div class="wrapper">
    <ProjectHeader {...template.header} />
    <Parralax {...template.parralax} />
    <div class="content">
      <ProjectIntro {...template.intro} />
      <div class="subheadline mb-20">
        <div class="subheadline__inner">
          <div class="divider ml-10 mb-10" />
          User Stories
        </div>
      </div>
      <div class="wireframe mb-100">
        <div class="wireframe__user-stories">
          <div class="wireframe__user-stories__text">
            <div class="headline3 mb-20">TO GET MORE INFORMATION ABOUT AN ARTWORK</div>
            When I’m in Amsterdam with my family for only two days, we are visiting the Rijksmuseum and my son is
            annoyed by long and boring guided tours or reading long art descriptions, I want to have an easy, fast and
            entertaining way to get compact and interesting background information about the artworks we are passing by,
            so I can enjoy my visit at the museum, while my son is busy and entertained and we all can improve our
            knowledge about arts.
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
            <div class="headline3 mb-20">TO GET MORE INFORMATION ABOUT WHAT‘S GOING ON TODAY</div>
            When I wake up at our hotel room and recognize the bad wheater we were not prepared for and we decide to go
            to the museum, I want to have an opportunity to plan our day spontaneously and get easily more information
            about what‘s going on, so we can keep our feet dry and seize the day.
          </div>
        </div>
      </div>
    </div>
  </div>
</main>
