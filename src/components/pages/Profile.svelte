<script>
  import TurnOver from 'pages/projects/TurnOver.svelte';
  import Projection from 'pages/projects/Projection.svelte';
  import Rijksmuseum from 'pages/projects/Rijksmuseum.svelte';
  import Ecographis from 'pages/projects/Ecographis.svelte';
  import PosterGallery from 'pages/projects/PosterGallery.svelte';
  import Learnplatform from 'pages/projects/Learnplatform.svelte';
  import Mueslibar from 'pages/projects/Mueslibar.svelte';
  import CloseButton from 'components/atoms/CloseButton.svelte';
  import { projectContainerScrollTop } from 'util/store.js';
  export let projectId;

  let templates = [
    { cp: TurnOver, id: 'turnOverApp' },
    { cp: Projection, id: 'human-projection' },
    { cp: Rijksmuseum, id: 'rijksmuseum' },
    { cp: Ecographis, id: 'ecographis' },
    { cp: PosterGallery, id: 'postergallery' },
    { cp: Learnplatform, id: 'learnplattform' },
    { cp: Mueslibar, id: 'mueslibar' },
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

<style lang="scss">
  main {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    scroll-behavior: smooth;
    background-color: #fff;
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

  .header-grid {
    display: grid;
    max-width: 1400px;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    position: relative;
    padding-left: 70px;
    padding-right: 70px;
    grid-template-columns: 1fr 2fr;
    &__text-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      &__text_inner {
        font-size: 50px;
        line-height: 65px;
        color: #000;
        position: absolute;
        top: 50%;
        font-weight: 500;
        transform: translateY(-90%);
        right: -80%;
        z-index: 20;
      }
    }
  }
</style>

<main>
  <div class="header">
    <CloseButton link="/" />
  </div>
  <div class="wrapper mt-100">
    <div class="header-grid mb-150">
      <div class="header-grid__text-wrapper">
        <div class="header-grid__text-wrapper__text_inner">
          <span style="font-weight: 600"> Hi, I'm Andi! </span>
          <br />
          Creative Front-end Developer
          <br />
          based in Stuttgart.
        </div>
      </div>
      <img
        src="https://ik.imagekit.io/andreasriedel/profil_tgnA2Eu3_vIu_.jpg"
        alt="Andreas Riedel"
        style="width: 100%; z-index: 0" />
    </div>
  </div>
</main>
