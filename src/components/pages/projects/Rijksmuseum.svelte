<script>
</script>

<style lang="scss">
  main {
    background-color: #161616;
    color: #fff;
    width: 100%;
  }

  .wrapper {
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    flex-direction: column;
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
    background-image: url('/images/rijksmuseum_hero2.jpg');
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

  .wireframe {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 70px;
    &__user-stories {
      text-align: right;
      max-width: 500px;
      margin-left: auto;
      position: relative;
      &__text {
        position: sticky;
        margin-top: 200px;
        top: 200px;
      }
    }
    &__container {
      width: 100%;
      padding-top: 50px;
      padding-bottom: 50px;
    }
  }

  .wireframe-img {
    width: 100%;
  }
</style>

<main>
  <div class="wrapper">
    <div class="header">
      <div class="header__wrapper">
        <div class="header__project-title">Rijksmuseum</div>
        <div class="header__year">18'</div>
        <div class="header__skills">University <br />Conception, User Stories, Prototyping</div>
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
      <div class="wireframe mb-100">
        <div class="wireframe__user-stories">
          <div class="wireframe__user-stories__text">
            <div class="content-header__title mb-20">TO GET MORE INFORMATION ABOUT AN ARTWORK</div>
            When I’m in Amsterdam with my family for only two days, we are visiting the Rijksmuseum and my son is
            annoyed by long and boring guided tours or reading long art descriptions, I want to have an easy, fast and
            entertaining way to get compact and interesting background information about the artworks we are passing by,
            so I can enjoy my visit at the museum, while my son is busy and entertained and we all can improve our
            knowledge about arts.
          </div>
        </div>
        <div class="wireframe__container">
          <!-- <img class="wireframe-img" src="/svg/wireframe_1_a.svg" alt="" /> -->
          <img class="wireframe-img mt-50" src="/svg/wireframe_1_b.svg" alt="" />
        </div>
      </div>
    </div>
  </div>
</main>
