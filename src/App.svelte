<script>
  import Home from 'pages/Home.svelte';
  import Profile from 'pages/Profile.svelte';
  import Project from 'pages/Project.svelte';
  import { Router, Route, NotFound, redirect } from 'pager/index.js';
  import { lastActiveRoute, filterClick } from 'util/store.js';
  import Masks from 'components/layout/Masks.svelte';
  let mask = 0;
  let destroyMask;
  let animate = true;
  let transitionLength = 6000;
  let displayNewSiteTime = 3400;

  const maskTransition = (ctx, next) => {
    destroyMask = false;
    //Init Load
    if (Object.keys($lastActiveRoute).length === 0 && $lastActiveRoute.constructor === Object) {
      mask = 1;
      animate = true;
      displayNewSiteTime = 2400;
      transitionLength = 4000;
      //Filter Click Animation
    } else if ($lastActiveRoute.path === '/' && $filterClick) {
      mask = 2;
      animate = true;
      filterClick.set(false);
      displayNewSiteTime = 1800;
      transitionLength = 3400;
      // Animation for Projects and Profile
    } else {
      mask = 3;
      displayNewSiteTime = 1800;
      transitionLength = 3400;
      animate = true;
    }

    //Update new site
    setTimeout(() => {
      animate = false;
      console.log('NEXT');
      next();
    }, displayNewSiteTime);

    //Destroy mask
    setTimeout(() => {
      destroyMask = true;
    }, transitionLength);
  };
</script>

<style lang="scss" global>
  @use './scss/spacing';

  body {
    height: 100vh;
    padding: 0;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    margin: 0;
    overflow: hidden;
    background-color: #212121;
    user-select: none;
    font-family: 'Montserrat', sans-serif;
    font-size: 1rem;
    line-height: 1.7;
    font-weight: 300;
  }

  /* Hide scrollbar */
  html,
  body {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  ::-webkit-scrollbar-thumb {
    background-color: transparent;
  }
  ::-webkit-scrollbar {
    background-color: transparent;
    display: none;
  }
  ::-webkit-scrollbar-track {
    background-color: transparent;
  }
</style>

{#if !destroyMask}
  <Masks {mask} {animate} />
{/if}
<Router>
  <Route path="/" component={Home} middleware={[maskTransition]} />
  <Route path="/profile" component={Profile} middleware={[maskTransition]} />
  <Route path="/project/:projectId" component={Project} middleware={[maskTransition]} />
  <NotFound />
</Router>
