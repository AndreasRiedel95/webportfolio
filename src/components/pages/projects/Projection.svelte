<script>
  import ProjectHeader from 'components/layout/ProjectHeader.svelte';
  import Parralax from 'components/layout/Parralax.svelte';
  import ProjectIntro from 'components/layout/ProjectIntro.svelte';
  import Slideshow from 'components/containers/Slideshow.svelte';
  let width;
  let template = {
    header: {
      title: ['Human', 'Projection'],
      year: "17'",
      skills: 'University </br> Conception, Photography',
    },
    parralax: {
      video: false,
      url: 'https://ik.imagekit.io/andreasriedel/hero_projection_I8Ldon9x7QSD0.jpg',
    },
    intro: {
      introTitle: 'A light installation which merges the individual human being with the colorful world we live in.',
      introText: [
        'Abstract artworks and patterns have been projected onto the faces of models in front of a black screen.',
        'In portrait format, the individual is the centre of attention, being in unity with the darkness and the light of the patterns.',
        'Browse through the gallery and discover the expressive power of light, darkness and the individual human being.',
      ],
    },
    slideshow: {
      slides: [
        'https://ik.imagekit.io/andreasriedel/projection_2_2q4A6UcgTNYeo.jpg',
        'https://ik.imagekit.io/andreasriedel/projection_4_K9cAp8LyzSepC.jpg',
        'https://ik.imagekit.io/andreasriedel/projection_3_RcZ6xKCSS7x7-.jpg',
        'https://ik.imagekit.io/andreasriedel/projection_5_UXXwd8_Suk7hj.jpg',
        'https://ik.imagekit.io/andreasriedel/projection_1_n4sxEAkM8qxp.jpg',
        'https://ik.imagekit.io/andreasriedel/projection_10_CV-Bja4ofntMN.jpg',
        'https://ik.imagekit.io/andreasriedel/projection_8_7NB2MXfVcfXN.jpg',
        'https://ik.imagekit.io/andreasriedel/projection_7_o8juSX2sDZHPf.jpg',
        'https://ik.imagekit.io/andreasriedel/projection_9_CAr_QSTE8vMyd.jpg',
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

  .projection-image-wrapper {
    padding-left: 50px;
    padding-right: 50px;
    width: 100%;
    background-color: #fff;
  }

  .text {
    position: sticky;
    top: 200px;
    margin-top: 200px;
    z-index: 0;
    font-size: 8vw;
    font-weight: 700;
    color: #000;
  }

  .projection-grid {
    display: grid;
    z-index: 10;
    grid-template-columns: 1fr 1fr;
    grid-gap: 120px;
    width: 100%;
  }

  .projection-image {
    width: 100%;
    max-width: 45vw;
    z-index: 10;
    grid-area: image;
  }
</style>

<svelte:window bind:innerWidth={width} />
<main>
  <div class="wrapper">
    <ProjectHeader {...template.header} />
    <Parralax {...template.parralax} />
    <div class="content">
      <ProjectIntro {...template.intro} />
      {#if width < 800}
        <Slideshow slides={template.slideshow.slides} options={template.slideshow.options} />
        <div class="mb-50 mt-100 thanks">Special thanks to Janina Hörauf and Phillip Breuker.</div>
      {:else}
        <div class="projection-image-wrapper">
          <div class="text">Projection</div>
          <div class="projection-grid mb-140" style="grid-template-areas:'. image'">
            <img
              style="width: 30vw; margin-left: auto"
              class="projection-image"
              src="https://ik.imagekit.io/andreasriedel/projection_7_o8juSX2sDZHPf.jpg"
              alt="" />
          </div>
          <div class="projection-grid mb-140" style="grid-template-areas:'image1 image'">
            <img
              style="grid-area: image1; align-self: center"
              class="projection-image"
              src="https://ik.imagekit.io/andreasriedel/projection_10_CV-Bja4ofntMN.jpg"
              alt="" />
            <img
              class="projection-image"
              src="https://ik.imagekit.io/andreasriedel/projection_5_UXXwd8_Suk7hj.jpg"
              alt="" />
          </div>
          <div class="projection-grid mb-140" style="grid-template-areas:'image .'">
            <img
              style="width: 90%; margin-left: auto"
              class="projection-image"
              src="https://ik.imagekit.io/andreasriedel/projection_9_CAr_QSTE8vMyd.jpg"
              alt="" />
          </div>
          <div class="projection-grid mb-140" style="grid-template-areas:'image1 image'">
            <img
              style="grid-area: image1; align-self: flex-end"
              class="projection-image"
              src="https://ik.imagekit.io/andreasriedel/projection_4_K9cAp8LyzSepC.jpg"
              alt="" />
            <img
              style="width: 95%; margin-right: auto;"
              class="projection-image"
              src="https://ik.imagekit.io/andreasriedel/projection_3_RcZ6xKCSS7x7-.jpg"
              alt="" />
          </div>

          <div class="projection-grid mb-140" style="grid-template-areas:'image1 image'">
            <img
              style="grid-area: image1; width: 75%; margin-right: auto"
              class="projection-image"
              src="https://ik.imagekit.io/andreasriedel/projection_1_n4sxEAkM8qxp.jpg"
              alt="" />
            <img
              style="width: 95%; margin-right: auto;"
              class="projection-image"
              src="https://ik.imagekit.io/andreasriedel/projection_8_7NB2MXfVcfXN.jpg"
              alt="" />
          </div>
          <div class="projection-grid mb-140" style="grid-template-areas:'. image'">
            <img
              style="width: 90%; margin-left: auto"
              class="projection-image"
              src="https://ik.imagekit.io/andreasriedel/projection_2_2q4A6UcgTNYeo.jpg"
              alt="" />
          </div>
        </div>
      {/if}
    </div>
  </div>
</main>
