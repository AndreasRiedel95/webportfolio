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
      url: '/images/rijksmuseum_hero2.jpg',
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
    &__user-stories {
      text-align: right;
      max-width: 500px;
      margin-left: auto;
      position: relative;
      &__text {
        position: sticky;
        margin-top: 200px;
        top: 200px;
      }
    }
    &__container {
      width: 100%;
      padding-top: 50px;
      padding-bottom: 50px;
    }
  }

  .wireframe-img {
    width: 100%;
  }
</style>

<main>
  <div class="wrapper">
    <ProjectHeader {...template.header} />
    <Parralax {...template.parralax} />
    <div class="content">
      <ProjectIntro {...template.intro} />
      <div class="wireframe mb-100">
        <div class="wireframe__user-stories">
          <div class="wireframe__user-stories__text">
            <div class="content-header__title mb-20">TO GET MORE INFORMATION ABOUT AN ARTWORK</div>
            When I’m in Amsterdam with my family for only two days, we are visiting the Rijksmuseum and my son is
            annoyed by long and boring guided tours or reading long art descriptions, I want to have an easy, fast and
            entertaining way to get compact and interesting background information about the artworks we are passing by,
            so I can enjoy my visit at the museum, while my son is busy and entertained and we all can improve our
            knowledge about arts.
          </div>
        </div>
        <div class="wireframe__container">
          <!-- <img class="wireframe-img" src="/svg/wireframe_1_a.svg" alt="" /> -->
          <img class="wireframe-img mt-50" src="/svg/wireframe_1_b.svg" alt="" />
        </div>
      </div>
    </div>
  </div>
</main>
