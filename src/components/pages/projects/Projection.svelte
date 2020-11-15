<script>
</script>

<style lang="scss">
  main {
    background-color: #161616;
    color: #fff;
    overflow-y: auto;
    width: 100%;
  }

  .wrapper {
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .header {
    height: 100vh;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    &__wrapper {
      position: relative;
    }
    &__project-title {
      font-size: 7rem;
      font-weight: 600;
      line-height: 7.5rem;
    }
    &__year {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      position: absolute;
      left: 0;
      transform: translateX(-180%);
      top: 15px;
      font-size: 3rem;
    }
    &__skills {
      position: absolute;
      bottom: 0;
      transform: translate(100%, 180%);
      font-weight: 400;
      right: 0;
    }
  }

  .parralax {
    width: 100%;
    background-image: url('/images/hero_projection.jpg');
    padding-bottom: 65%;
    background-attachment: fixed;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
  }

  .parralax-video {
  }

  .content {
    background-color: #161616;
  }

  .content-header {
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
    padding-left: 20px;
    padding-right: 20px;
    &__title {
      font-size: 32px;
      font-weight: 500;
      line-height: 40px;
    }
  }

  .divider {
    width: 80%;
    height: 1px;
    background-color: #fff;
  }
</style>

<main>
  <div class="wrapper">
    <div class="header">
      <div class="header__wrapper">
        <div class="header__project-title">Human <br /> Projection</div>
        <div class="header__year">18'</div>
        <div class="header__skills">University <br />Conception, Photography</div>
      </div>
    </div>
    <div class="parralax" />
    <div class="content">
      <div class="content-header mt-100 mb-100">
        <div class="divider mt-100 mb-50" />
        <div class="content-header__title mb-30">
          Our team created this site to memorialize the works of great fashion photographer Peter Lindbergh.
        </div>
        <p class="content-header__paragraph">
          Obys agency is a fan of his photography and his vision, so our mission in creating this site was to remind the
          world of Lindbergh’s work and perhaps introduce someone to his art. Here in Ukraine, many people don’t know
          about him, unfortunately.
        </p>
        <p class="content-header__paragraph mt-20">
          The site was created entirely on Readymag, so any extra development wasn’t needed. Before this, we had only
          used Readymag for internal tasks and meetings. The list of animation opportunities was very attractive to us.
        </p>
      </div>
    </div>
  </div>
</main>
