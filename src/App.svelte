<script>
  import Home from 'pages/Home.svelte';
  import Profile from 'pages/Profile.svelte';
  import Project from 'pages/Project.svelte';
  import { Router, Route, NotFound, redirect } from 'pager/index.js';
</script>

<Router>
  <Route path="/" component={Home} />
  <Route path="/profile" component={Profile} />
  <Route path="/project" component={Project} />
  <NotFound />
</Router>
