<script>
  import ProjectHeader from 'components/layout/ProjectHeader.svelte';
  import Parralax from 'components/layout/Parralax.svelte';
  import ProjectIntro from 'components/layout/ProjectIntro.svelte';
  import Slideshow from 'components/containers/Slideshow.svelte';

  let template = {
    header: {
      title: ['Human', 'Projection'],
      year: "17'",
      skills: 'University </br> Conception, Photography',
    },
    parralax: {
      video: false,
      url: '/images/hero_projection.jpg',
    },
    intro: {
      introTitle: 'Our team created this site to memorialize the works of great fashion photographer Peter Lindbergh.',
      introText: [
        'Obys agency is a fan of his photography and his vision, so our mission in creating this site was to remind the world of Lindbergh’s work and perhaps introduce someone to his art. Here in Ukraine, many people don’t know about him, unfortunately.',
        'The site was created entirely on Readymag, so any extra development wasn’t needed. Before this, we had only used Readymag for internal tasks and meetings. The list of animation opportunities was very attractive to us.',
      ],
    },
    slideshow: [
      'https://ik.imagekit.io/andreasriedel/projection_4_K9cAp8LyzSepC.jpg',
      'https://ik.imagekit.io/andreasriedel/projection_3_RcZ6xKCSS7x7-.jpg',
      'https://ik.imagekit.io/andreasriedel/projection_5_UXXwd8_Suk7hj.jpg',
      'https://ik.imagekit.io/andreasriedel/projection_1_n4sxEAkM8qxp.jpg',
      'https://ik.imagekit.io/andreasriedel/projection_10_CV-Bja4ofntMN.jpg',
      'https://ik.imagekit.io/andreasriedel/projection_8_7NB2MXfVcfXN.jpg',
      'https://ik.imagekit.io/andreasriedel/projection_7_o8juSX2sDZHPf.jpg',
      'https://ik.imagekit.io/andreasriedel/projection_9_CAr_QSTE8vMyd.jpg',
      'https://ik.imagekit.io/andreasriedel/projection_2_2q4A6UcgTNYeo.jpg',
    ],
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
    display: flex;
    flex-direction: column;
  }

  .thanks {
    font-style: italic;
    text-align: center;
    font-size: 12px;
  }
</style>

<main>
  <div class="wrapper">
    <ProjectHeader {...template.header} />
    <Parralax {...template.parralax} />
    <div class="content">
      <ProjectIntro {...template.intro} />
      <Slideshow slides={template.slideshow} />
      <div class="mb-50 thanks">Special thanks to Janina Hörauf and Phillip Breuker.</div>
      <p class="wrapper-small-centered mb-80">
        Obys agency is a fan of his photography and his vision, so our mission in creating this site was to remind the
        world of Lindbergh’s work and perhaps introduce someone to his art. Here in Ukraine, many people don’t know
        about him, unfortunately.', 'The site was created entirely on Readymag, so any extra development wasn’t needed.
        Before this, we had only used Readymag for internal tasks and meetings. The list of animation opportunities was
        very attractive to us.,
      </p>
    </div>
  </div>
</main>
