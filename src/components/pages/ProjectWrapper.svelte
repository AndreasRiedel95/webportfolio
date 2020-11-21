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

<main on:scroll={(e) => projectContainerScrollTop.set(e.target.scrollTop)}>
  <div class="header">
    <CloseButton link="/" />
  </div>
  <svelte:component this={template.cp} />
</main>
