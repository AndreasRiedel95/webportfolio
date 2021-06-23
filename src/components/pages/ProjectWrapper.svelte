<script>
  import TurnOver from 'pages/projects/TurnOver.svelte';
  import Projection from 'pages/projects/Projection.svelte';
  import Rijksmuseum from 'pages/projects/Rijksmuseum.svelte';
  import Ecographis from 'pages/projects/Ecographis.svelte';
  import PosterGallery from 'pages/projects/PosterGallery.svelte';
  import Learnplatform from 'pages/projects/Learnplatform.svelte';
  import Mueslibar from 'pages/projects/Mueslibar.svelte';
  import DigitalInCar from 'pages/projects/DigitalInCar.svelte';
  import CloseButton from 'components/atoms/CloseButton.svelte';
  import Footer from 'components/layout/Footer.svelte';
  import { projectContainerScrollTop } from 'util/store.js';

  export let projectId;

  let templates = [
    { cp: TurnOver, id: 'turnOverApp', title: 'TurnOver App' },
    { cp: Projection, id: 'human-projection', title: 'Human Projection' },
    { cp: Rijksmuseum, id: 'rijksmuseum', title: 'Rijksmuseum' },
    { cp: Ecographis, id: 'ecographis', title: 'ecographis' },
    { cp: PosterGallery, id: 'postergallery', title: 'Poster Gallery' },
    { cp: Learnplatform, id: 'learnplattform', title: 'eLearning Platform' },
    { cp: Mueslibar, id: 'mueslibar', title: 'mueslibar' },
    { cp: DigitalInCar, id: 'digital-incar', title: 'Digital InCar' },
  ];
  let template;
  $: if (projectId) {
    template = templates.find((t) => t.id === projectId);
    if (!template) {
      let url = window.location.href;
      location.href = url + '/not-found';
    }
  }
</script>

<svelte:head>
  <title>{template.title} by Andreas Riedel</title>
</svelte:head>

<main on:scroll={(e) => projectContainerScrollTop.set(e.target.scrollTop)}>
  <div class="header">
    <CloseButton link="/" />
  </div>
  <svelte:component this={template.cp} />
  <Footer />
</main>

<style lang="scss">
  main {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    scroll-behavior: smooth;
  }

  .header {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    padding: 15px;
    z-index: 20;
    display: flex;
    justify-content: flex-end;
  }
</style>
