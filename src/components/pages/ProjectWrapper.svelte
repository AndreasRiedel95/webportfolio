<script>
  import TurnOver from 'pages/projects/TurnOver.svelte';
  import Projection from 'pages/projects/Projection.svelte';
  import Rijksmuseum from 'pages/projects/Rijksmuseum.svelte';
  import Ecographis from 'pages/projects/Ecographis.svelte';
  import PosterGallery from 'pages/projects/PosterGallery.svelte';
  import Learnplatform from 'pages/projects/Learnplatform.svelte';
  export let projectId;

  let templates = [
    { cp: TurnOver, id: 'turnOverApp' },
    { cp: Projection, id: 'human-projection' },
    { cp: Rijksmuseum, id: 'rijksmuseum' },
    { cp: Ecographis, id: 'ecographis' },
    { cp: PosterGallery, id: 'postergallery' },
    { cp: Learnplatform, id: 'learnplattform' },
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
    overflow-y: auto;
  }

  .header {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    padding: 40px;
    z-index: 20;
  }
</style>

<main>
  <div class="header"><a href="/">Close</a></div>
  <svelte:component this={template.cp} />
</main>
