<script>
  import { onMount } from 'svelte';
  import ProjectHeader from 'components/layout/ProjectHeader.svelte';
  import Parralax from 'components/layout/Parralax.svelte';
  import ProjectIntro from 'components/layout/ProjectIntro.svelte';
  import { projectContainerScrollTop } from 'util/store.js';
  let vh;

  let template = {
    header: {
      title: ['Digital InCar'],
      year: "17'",
      skills: 'University</br>Programming, <br/> Projectmanagement',
    },
    parralax: {
      video: true,
      url: 'https://ik.imagekit.io/andreasriedel/DigitalInCarManual_Trailer_1_K5lFOab8ZZfXf.mp4',
    },
    intro: {
      introTitle:
        'ecographis is a small design agency, which develops and implements sustainable concepts and designs.',
      introText: [
        'The design was provided by the agency. I developed the site with HTML5, CSS3 and Javascript – of course full responsive and touch friendly.',
        'The large, full-screen slideshows at the top of the pages are a special eye-catcher. Through those slides the highlighted projects get the attention they deserve.',
        "You want to see the site in action? Then click <a target='_blank' class='link --inverted' href='https://ecographis.de/'>here</a>!",
      ],
    },
  };

  onMount(() => {});
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

  .first-wrapper {
    background-color: green;
    height: calc(var(--vh, 1vh) * 100);
  }

  .third-wrapper {
    background: blue;
  }

  .digital-to-print {
    font-size: 10vw;
    font-weight: 700;
    position: sticky;
    background-color: red;
    top: 0;
  }
</style>

<svelte:window bind:innerHeight={vh} />
<main>
  <div class="wrapper">
    <ProjectHeader {...template.header} />
    <Parralax {...template.parralax} />
    <div class="content">
      <ProjectIntro {...template.intro} />
      <div
        class="pt-50 pb-50 display-flex justify-content-center align-items-center first-wrapper"
        style="--vh: {vh * 0.01}px">
        <div class="digital-to-print">Print To Digital</div>
      </div>
      <div class="pt-200 pb-200 display-flex" style="height: 200vh" />
      <div class="third-wrapper height-100h display-flex">third wrapper</div>
    </div>
  </div>
</main>
