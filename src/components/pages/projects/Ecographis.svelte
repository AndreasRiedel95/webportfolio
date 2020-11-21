<script>
  import ProjectHeader from 'components/layout/ProjectHeader.svelte';
  import Parralax from 'components/layout/Parralax.svelte';
  import ProjectIntro from 'components/layout/ProjectIntro.svelte';

  let template = {
    header: {
      title: ['ecographis'],
      year: "19'",
      skills: 'Work </br>Programming </br> Responisve CSS, HTML5, ',
    },
    parralax: {
      video: false,
      url: '/images/ecographis_hero2.jpg',
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
    &__parralax-wrapper {
      max-width: 80vw;
      width: 100%;
      margin-left: auto;
      margin-right: auto;
    }
    &__image-wrapper {
      display: grid;
      width: 100%;
      &.c_2_1 {
        grid-template-columns: 2fr 1fr;
      }
      &.c_1_2 {
        grid-template-columns: 1fr 1fr;
      }
    }
  }
</style>

<main>
  <div class="wrapper">
    <ProjectHeader {...template.header} />
    <Parralax {...template.parralax} />
    <div class="content">
      <ProjectIntro {...template.intro} />
      <div class="content__image-wrapper c_2_1" />
      <div class="content__parralax-wrapper">
        <Parralax {...template.parralax} />
      </div>
      <div class="content__image-wrapper c_1_2">
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Fugiat eveniet, repellat eos saepe doloribus corporis
        nobis doloremque facere non commodi nulla voluptates nemo maiores maxime aliquid? Molestias voluptatem
        temporibus voluptates!
      </div>
    </div>
  </div>
</main>
