<script>
  import TurnOver from 'pages/projects/TurnOver.svelte';
  export let projectId;

  let templates = [{ cp: TurnOver, id: 'turn-over-app' }];
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
  }

  .header {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    padding: 40px;
  }
</style>

<main>
  <div class="header"><a href="/">Close</a></div>
  <svelte:component this={template.cp} />
</main>
