<script>
  import { register, activeRoute } from "./Router.svelte";
  import Footer from "components/layout/Footer.svelte";

  // page.js catch all handler
  export let path = "*";
  export let component = null;

  register({ path, component, middleware: [] });
</script>

{#if $activeRoute.path === path}
  <div class="display-flex flex-direction-column height-100">
    <div class="not-found-wrapper">
      <img
        width="200"
        src="https://ik.imagekit.io/andreasriedel/404_2_R1LrhaO2S.gif"
        alt="404"
      />

      <br />
      Whoops, you seem to be lost. <span style="font-size: 20px">🦦</span>
      <br />
      <a class="link" href="/">Lets head back home...</a>
    </div>
    <Footer />
  </div>
{/if}

<style lang="scss">
  .not-found-wrapper {
    color: #fff;
    flex-grow: 1;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    display: flex;
    flex-direction: column;
  }

  .link {
    color: #fff;
    display: block;
    margin-top: 10px;
  }
</style>
