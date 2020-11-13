<script>
  import { register, activeRoute } from './Router.svelte';
  export let path = '/';
  export let component = null;
  // define new middleware property
  export let middleware = [];

  // Define empty params object
  let params = {};

  register({ path, component, middleware });

  // if active route -> extract params
  $: if ($activeRoute.path === path) {
    params = $activeRoute.params;
  }
</script>

{#if $activeRoute.path === path}
  <!-- if component passed in ignore slot property -->
  {#if $activeRoute.component}
    <!-- passing custom properties and page.js extracted params -->
    <svelte:component this={$activeRoute.component} {...$$restProps} {...params} />
  {:else}
    <!-- expose params on the route via let:params -->
    <slot {params} />
  {/if}
{/if}
