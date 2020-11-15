<script>
</script>

<style lang="scss">
  main {
    background-color: #161616;
    color: #fff;
    width: 100%;
  }

  .wrapper {
    max-width: 1400px;
    padding-left: 20px;
    padding-right: 20px;
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
    background-image: url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/project-one.png');
    width: 100%;
    padding-bottom: 65%;
    background-attachment: fixed;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
  }

  .content {
    height: 1000px;
    background-color: #161616;
  }
</style>

<main>
  <div class="wrapper">
    <div class="header">
      <div class="header__wrapper">
        <div class="header__project-title">TURN- <br /> OVER APP</div>
        <div class="header__year">18'</div>
        <div class="header__skills">University <br /> iOS iPad App</div>
      </div>
    </div>
    <div class="parralax" />
    <div class="content" />
  </div>
</main>
