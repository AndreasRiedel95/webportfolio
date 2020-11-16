<script>
  import ProjectHeader from 'components/layout/ProjectHeader.svelte';
  import Parralax from 'components/layout/Parralax.svelte';
  import ProjectIntro from 'components/layout/ProjectIntro.svelte';

  let template = {
    header: {
      title: ['Poster Gallery'],
      year: "11-14'",
      skills: 'Privat </br> Design, Conception ',
    },
    parralax: {
      video: false,
      url: '/images/poster_gallery_hero_2.jpg',
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
</style>

<main>
  <div class="wrapper">
    <ProjectHeader {...template.header} />
    <Parralax {...template.parralax} />
    <div class="content">
      <ProjectIntro {...template.intro} />
    </div>
  </div>
</main>
