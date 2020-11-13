<script>
  import { register, activeRoute } from './Router.svelte';

  // page.js catch all handler
  export let path = '*';
  export let component = null;

  register({ path, component, middleware: [] });
</script>

<style>
  .not-found-wrapper {
    color: #fff;
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
</style>

{#if $activeRoute.path === path}
  <div class="not-found-wrapper">404. <br /> Sorry page not found.</div>
{/if}
