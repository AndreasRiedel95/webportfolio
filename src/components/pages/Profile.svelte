<script>
  import { fly } from 'svelte/transition';
  import { onDestroy } from 'svelte';

  onDestroy(() => {
    console.log('destroy');
  });
</script>

<style lang="scss">
  main {
    position: absolute;
    background-color: #fff;
    width: 100%;
    padding: 70px;
  }

  .headline {
    font-size: 4rem;
    position: absolute;
    line-height: 1.4;
    font-weight: 800;
    left: 0;
    z-index: 10;
    width: 60%;
    padding-top: 80px;
    & > span {
      color: #ed5d41;
    }
  }

  .wrapper {
    background-color: #fff;
    position: relative;
    width: 100%;
    height: 100%;
    max-width: 1400px;
    margin-left: auto;
    overflow-y: auto;
    margin-right: auto;
    display: flex;
    flex-direction: column;
  }

  .hero_image {
    position: relative;
    right: 0;
    top: 0;
    margin-left: auto;
    z-index: 1;
    width: 70%;
  }

  .intro-text {
    max-width: 500px;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    margin-top: 150px;
    &__headline {
      font-size: 32px;
      margin-bottom: 50px;
    }
    &__content {
      font-size: 15px;
      line-height: 28px;
      & > p {
        margin-top: 25px;
      }
    }
  }

  .highlight-text {
    font-size: 4rem;
    width: 100%;
    margin-top: 100px;
    margin-bottom: 100px;
    font-weight: 500;
  }
</style>

<main>
  <a href="/">Close</a>
  <div class="wrapper">
    <div class="headline">
      Creative Full Stack Developer creating
      <span>unique and grown-driven</span>
      Products & Brands.
    </div>
    <img class="hero_image" src="/images/Riedel_Andreas.jpg" alt="Andreas Riedel" />
  </div>
  <div class="intro-text">
    <div class="intro-text__headline">
      Our team created this site to memorialize the works of great fashion photographer Peter Lindbergh.
    </div>

    <div class="intro-text__content">
      <p>
        Obys agency is a fan of his photography and his vision, so our mission in creating this site was to remind the
        world of Lindbergh’s work and perhaps introduce someone to his art. Here in Ukraine, many people don’t know
        about him, unfortunately.
      </p>
      <p>
        The site was created entirely on Readymag, so any extra development wasn’t needed. Before this, we had only used
        Readymag for internal tasks and meetings. The list of animation opportunities was very attractive to us.
      </p>
    </div>
  </div>
  <div class="highlight-text">Your website should turn visitors into engaged customers.</div>
</main>
