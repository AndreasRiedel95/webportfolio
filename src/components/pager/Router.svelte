<script context="module">
  import { writable } from 'svelte/store';
  export const activeRoute = writable({});
  let routes = {};
  export function register(route) {
    routes[route.path] = route;
  }
</script>

<script>
  import page from 'page';
  import { onMount, onDestroy } from 'svelte';

  // this is where we set the active componentc
  const setActiveRoute = (route) => {
    return function (ctx) {
      console.log(ctx);
      $activeRoute = { ...route, params: ctx.params };
    };
  };

  const setupPage = () => {
    for (let [path, route] of Object.entries(routes)) {
      page(path, ...route.middleware, setActiveRoute(route));
    }

    // start page.js
    page.start();
  };
  onMount(setupPage);
  onDestroy(page.stop);
</script>

<slot />
