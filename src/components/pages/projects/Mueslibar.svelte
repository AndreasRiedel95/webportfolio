<script>
  import ProjectHeader from 'components/layout/ProjectHeader.svelte';
  import Parralax from 'components/layout/Parralax.svelte';
  import ProjectIntro from 'components/layout/ProjectIntro.svelte';
  import Slideshow from 'components/containers/Slideshow.svelte';

  let template = {
    header: {
      title: ['mueslibar'],
      year: "16'",
      skills: 'University <br /> Conception, Design',
    },
    parralax: {
      video: false,
      url: 'https://ik.imagekit.io/andreasriedel/mueslibar_hero_tYISgUQzHiNq.jpg',
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
        'https://ik.imagekit.io/andreasriedel/d9ad1e2b-8024-40c1-8c14-21d3eb893541_N8yZpvLD6ti0Y.jpg',
        'https://ik.imagekit.io/andreasriedel/ef2c46a2-eb03-469d-9072-ebec19b6a940_lWg0pAF1P0o9g.jpg',
        'https://ik.imagekit.io/andreasriedel/647a6f26-cfba-44b2-b61a-5aa8c3baf52e_5JFaPumB-Mp83.jpg',
        'https://ik.imagekit.io/andreasriedel/3a0703f3-055e-43dd-9ffa-7febc3c88965_2BBxaW06UjCs.jpg',
        'https://ik.imagekit.io/andreasriedel/f3d7474c-44cc-4882-b686-2daa2fb7a6a4_MvO-wlBXLLC2M.jpg',
        'https://ik.imagekit.io/andreasriedel/289f4cee-ed0c-423d-8c7b-a83f93b6c39d_NRJGdChE4ZFwl.jpg',
        'https://ik.imagekit.io/andreasriedel/8bac07e5-2826-4ee4-bbeb-444b779098fa_Eume8iYtoQDT.jpg',
      ],
      options: { imagesLoaded: true, percentPosition: false, wrapAround: true },
    },
  };
</script>

<style lang="scss">
  main {
    background-color: #161616;
    color: #fff;
    width: 100%;
    z-index: 10;
  }

  .wrapper {
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    flex-direction: column;
    z-index: 10;
  }

  .content {
    background-color: #161616;
    z-index: 10;
  }
</style>

<main>
  <div class="wrapper">
    <ProjectHeader {...template.header} />
    <Parralax {...template.parralax} />
    <div class="content">
      <ProjectIntro {...template.intro} />
      <div class="mb-100">
        <Slideshow slides={template.slideshow.slides} options={template.slideshow.options} />
      </div>
    </div>
  </div>
</main>
