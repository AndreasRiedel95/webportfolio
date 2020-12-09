<script>
  import { fade } from 'svelte/transition';
  import ProjectHeader from 'components/layout/ProjectHeader.svelte';
  import Parralax from 'components/layout/Parralax.svelte';
  import ProjectIntro from 'components/layout/ProjectIntro.svelte';
  import Slideshow from 'components/containers/Slideshow.svelte';
  import ImageCompare from 'svelte-image-compare';
  import { projectContainerScrollTop } from 'util/store.js';
  import { onMount } from 'svelte';

  let template = {
    header: {
      title: ['mueslibar'],
      year: "16'",
      skills: 'University <br /> Conception, Design </br> Logo Design',
    },
    parralax: {
      video: false,
      url: 'https://ik.imagekit.io/andreasriedel/mueslibar_hero_tYISgUQzHiNq.jpg',
    },
    intro: {
      introTitle:
        "Whether breakfast lover or philistine. At the <span class='font-italic'>mueslibar </span> the right meal should be found for everyone.",
      introText: [
        'Behind the idea of the mueslibar magazine is a fictional, hipster café. Everyone should find his perfect breakfast here. The magazine is kind of guide and should offer the guest the perfect muesli through information and playful questionnaires.',
        'The design and presentation of the magazine should reflect the sustainable values of the café and the regional and organic ingredients used for each breakfast.',
        'The logo represents the variety of cereal ingredients through the great variety of colors and the differently sized shapes. We also took a large part of the photos ourselves.',
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
        'https://ik.imagekit.io/andreasriedel/28bfed24-85f4-4e78-8561-4d539c164b0e_2_BOvGlqwBQ1Da.jpg',
      ],
      options: { imagesLoaded: true, percentPosition: false, wrapAround: true, pageDots: false },
    },
  };

  let vh;
  let vw;
  let wrapperHeight = 500;
  let logoWrapper;
  let startScroll = 0;
  let distance = 0;
  let percentage = 0;

  onMount(() => {
    calculateBoundings();
  });

  const calculateBoundings = () => {
    wrapperHeight = vh * 3.5;
    startScroll = logoWrapper.getBoundingClientRect().top;
  };

  $: if ($projectContainerScrollTop >= startScroll + vh / 6) {
    distance = $projectContainerScrollTop - (startScroll - vh / 6);
    percentage = (100 / wrapperHeight) * distance;
  }
</script>

<style lang="scss">
  :global {
    .after-label {
      top: 10px !important;
      right: 10px !important;
    }

    .before-label {
      top: 10px !important;
      left: 10px !important;
    }
  }

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

  .imagecompare_wrapper {
    height: 0;
    padding-bottom: 65%;
    position: relative;
    &__inner {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
    }
  }

  .logo-outer-wrapper {
    background-color: #000;
  }

  .logo-image-wrapper {
    width: 100%;
    max-width: 700px;
    height: 0;
    padding-bottom: 85%;
    position: relative;
  }

  .logo-image {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    object-fit: contain;
  }
</style>

<svelte:window bind:innerWidth={vw} on:resize={calculateBoundings} bind:innerHeight={vh} />
<main>
  <div class="wrapper">
    <ProjectHeader {...template.header} />
    <Parralax {...template.parralax} />
    <div class="content">
      <ProjectIntro {...template.intro} />
      <div>
        <Slideshow slides={template.slideshow.slides} options={template.slideshow.options} />
      </div>
      <div style="height: {wrapperHeight}px" class="logo-outer-wrapper" bind:this={logoWrapper}>
        <div
          class=" display-flex justify-content-center align-items-center width-100 max-width-1200 margin-left-auto margin-right-auto pl-50 pr-50"
          style="height: 100vh; position: sticky; top: 0">
          <div
            class="display-grid grid-template-columns-responsive-400 jusify-content-center align-items-center grid-gap-small width-100">
            <div class="display-flex flex-direction-column justify-content-center align-items-center">
              <div class="headline1 headline1--thin color-white">
                One logo, a lot of
                <br />
                {#if percentage > 13}
                  <span transition:fade={{ duration: 300 }} style="font-weight: 600; color: #740136"> V</span>
                {/if}
                {#if percentage > 26}
                  <span transition:fade={{ duration: 300 }} style="font-weight: 600; color: #46caf2"> A</span>
                {/if}
                {#if percentage > 39}
                  <span transition:fade={{ duration: 300 }} style="font-weight: 600; color: #edd35e"> R</span>
                {/if}
                {#if percentage > 52}
                  <span transition:fade={{ duration: 300 }} style="font-weight: 600; color: #236b15"> I</span>
                {/if}
                {#if percentage > 65}
                  <span transition:fade={{ duration: 300 }} style="font-weight: 600; color: #c93e91"> E</span>
                {/if}
                {#if percentage > 78}
                  <span transition:fade={{ duration: 300 }} style="font-weight: 600; color: #9738ea"> T</span>
                {/if}
                {#if percentage > 91}
                  <span transition:fade={{ duration: 300 }} style="font-weight: 600; color: #2d9b34"> Y</span>
                {/if}
              </div>
            </div>
            <div class="logo-image-wrapper">
              {#if percentage > 18}
                <img
                  transition:fade={{ duration: 300 }}
                  class="logo-image"
                  src="/svg/mueslibar_logo_5.svg"
                  alt="mueslibar-logo" />
              {/if}
              {#if percentage > 36}
                <img
                  transition:fade={{ duration: 300 }}
                  class="logo-image"
                  src="/svg/mueslibar_logo_4.svg"
                  alt="mueslibar-logo" />
              {/if}
              {#if percentage > 54}
                <img
                  transition:fade={{ duration: 300 }}
                  class="logo-image"
                  src="/svg/mueslibar_logo_3.svg"
                  alt="mueslibar-logo" />
              {/if}
              {#if percentage > 72}
                <img
                  transition:fade={{ duration: 300 }}
                  class="logo-image"
                  src="/svg/mueslibar_logo_2.svg"
                  alt="mueslibar-logo" />
              {/if}
              {#if percentage > 91}
                <img
                  transition:fade={{ duration: 300 }}
                  class="logo-image"
                  src="/svg/mueslibar_logo_1.svg"
                  alt="mueslibar-logo" />
              {/if}
            </div>
          </div>
        </div>
      </div>
      <div class="width-100 background-white pt-100 pb-100">
        <div
          class="max-width-1200 width-100 pl-50 pr-50 margin-left-auto margin-right-auto display-flex flex-direction-column">
          <div class="mb-100 max-width-500 margin-left-auto">
            <div class="headline1 headline1--thin mb-30 color-black">
              From conception
              <br />
              to handcrafted prototype
            </div>
            <div class="color-black">
              Before we started designing and manufacturing the prototype, we scribbled a lot. The goal was to create a
              prototype that would come as close as possible to a real product and that could later be presented in a
              store.
            </div>
          </div>
          <div class="imagecompare_wrapper">
            <div class="imagecompare_wrapper__inner">
              <ImageCompare
                before="https://ik.imagekit.io/andreasriedel/mueslibar_compare_2_AkXw4e9LXJUR.jpg"
                after="https://ik.imagekit.io/andreasriedel/mueslibar_compare_1_0ejGQRMK_1kx.jpg"
                contain={true}>
                <span slot="before">Conception</span>
                <span slot="after">Final Prototype</span>
              </ImageCompare>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>
