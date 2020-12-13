<script>
  import CloseButton from 'components/atoms/CloseButton.svelte';
  import { fly } from 'svelte/transition';
  import { expoOut } from 'svelte/easing';
  import { onMount } from 'svelte';
  import SlideScroller from '../containers/SlideScroller.svelte';

  let intersectWrappers = [];
  let active;
  let scrollEvent;
  const animationDelay = 1000;
  const animationDuration = 1500;

  let observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        active = parseInt(entry.target.dataset.index);
        observer.unobserve(entry.target);
      }
    });
  });

  onMount(() => {
    intersectWrappers.forEach((wrapper) => {
      observer.observe(wrapper);
    });
  });

  const fadeWidth = (node, { duration, delay }) => {
    return {
      duration,
      delay,
      css: (t) => {
        const eased = expoOut(t);
        return `
        width: ${eased * 100}%;
        `;
      },
    };
  };
</script>

<style lang="scss">
  main {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    scroll-behavior: smooth;
    background-color: #fff;
  }

  .footer {
    background-color: #151515;
    width: 100%;
    position: relative;
    padding-top: 20px;
    padding-bottom: 20px;
    flex-shrink: 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .impressum {
    color: #fff;
    text-decoration: none;
    font-size: 12px;
  }

  .header {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    padding: 15px;
    z-index: 20;
    display: flex;
    justify-content: flex-end;
  }

  .header-img-wrapper {
    position: relative;
    padding-top: 65%;
    width: 100%;
  }

  .header-img {
    position: absolute;
    top: 0;
    transform: scale(1);
    transition: transform 0.5s ease-out;
    left: 0;
    height: 100%;
    -webkit-user-drag: none;
    -khtml-user-drag: none;
    -moz-user-drag: none;
    -o-user-drag: none;
    width: 100%;
    object-fit: cover;
  }

  .headline-text {
    font-size: 50px;
    line-height: 65px;
    color: #000;
    font-weight: 300;
    width: 100%;
    @media screen and (max-width: 700px) {
      font-size: 30px;
      line-height: 45px;
    }
  }

  .header-wrapper {
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
    padding-left: 50px;
    padding-right: 50px;
    @media screen and (max-width: 700px) {
      padding-left: 30px;
      padding-right: 30px;
    }
  }

  .intro-wrapper {
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
    padding-left: 50px;
    padding-right: 50px;
    width: 100%;
    @media screen and (max-width: 700px) {
      padding-left: 30px;
      padding-right: 30px;
    }
  }

  .award-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding-left: 100px;
    grid-gap: 200px;
    padding-right: 100px;
    color: #000;
    width: 100%;
    align-items: center;
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
    @media screen and (max-width: 900px) {
      grid-template-columns: 1fr;
      grid-gap: 70px;
      padding-right: 30px;
      padding-left: 30px;
    }
    &__text-wrapper {
      align-self: center;
    }
  }

  .award-img {
    position: absolute;
    left: 50%;
    top: 0;
    transform: translate(-50%, -50%);
  }

  .contact-wrapper {
    background-color: #000;
  }

  .link-profile {
    text-decoration: none;
    background: #000;
    color: #fff;
    width: 100%;
    text-align: center;
    height: 100%;
    &:hover {
      background: linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%);
    }
  }
</style>

<main on:scroll={(e) => (scrollEvent = e)}>
  <div class="header">
    <CloseButton link="/" />
  </div>
  <div class="wrapper mt-100">
    <div class="display-flex flex-direction-column mb-150 header-wrapper">
      <div class="headline-text mb-50">
        <div
          in:fly={{ y: 80, duration: animationDuration, delay: animationDelay, easing: expoOut }}
          style="font-weight: 500">
          Hi, I'm Andi!
        </div>
        <div
          in:fly={{ y: 80, duration: animationDuration, delay: animationDelay + 300, easing: expoOut }}
          style="color: #8d8f9a">
          Creative Front-end Developer based in Stuttgart.
        </div>
      </div>
      <div class="header-img-wrapper">
        <img
          in:fadeWidth={{ duration: animationDuration, delay: animationDelay }}
          class="header-img"
          src="https://ik.imagekit.io/andreasriedel/profil_tgnA2Eu3_vIu_.jpg"
          alt="Andreas Riedel" />
      </div>
    </div>
    <div
      class="intro-wrapper display-grid grid-template-columns-responsive-400 mt-150 mb-150 grid-gap-small position-relative"
      data-index="0"
      bind:this={intersectWrappers[0]}>
      <div class="headline1 max-width-400 font-weight-bold opacity-0" class:activeFadeUp={active >= 0}>
        The whole is more than the sum of its parts.
      </div>
      <div class="opacity-0" class:activeFadeUp={active >= 0}>
        <p>I know you are busy. Let me come straight to the point.</p>
        <p class="mt-20">
          I grew up in Southern Germany and successfully completed my Bachelor's degree in Print and Media Technology –
          Digital Publishing at the Stuttgart Media University. Two wonderful years I lived, studied and worked in
          Amsterdam. I like to create user-driven products and applications with fancy machines and special tools.
          Currently, I am doing a PreMaster Program at the Bosch Engineering GmbH in the IoT-Cloud area and create data
          visualizations.
        </p>
        <p class="mt-20">
          You can
          <span class="font-weight-medium">contact me</span>
          <a href="mailto:andreas.riedel95@gmail.com" class="link">here</a>.
        </p>
        <p class="mt-20">That's basically it. But if you’re still curious, keep scrolling.</p>
      </div>
    </div>
    <SlideScroller {scrollEvent} slideIdentifier="skill" />
    <div class="pt-200 pb-150 mb-150 position-relative" style="background-color: #fff">
      <img class="award-img" src="/svg/award.svg" alt="award" width="110" />
      <div class="award-grid mb-100" data-index="1" bind:this={intersectWrappers[1]}>
        <img
          src="https://ik.imagekit.io/andreasriedel/award_winning_qrMgxUUhtCnv.JPG"
          alt="award winning"
          style="width: 100%; opacity: 0"
          class:activeFadeUpDelay300={active >= 1} />
        <div class="award-grid__text-wrapper opacity-0" class:activeFadeUpDelay300={active >= 1}>
          <div class="headline2 headline2--thin mb-30" id="award">
            Best graduate of the Faculty of Printing and Media Technology 2019
          </div>
          <div>
            I successfully graduated in my Bachelor's degree in Print and Media Technology – Digital Publishing. Here,
            I've been awarded by the Print and Media Association of the State of Baden-Württemberg e.V. (dpmi) for being
            the best graduate student in my faculty.
          </div>
        </div>
      </div>
    </div>
    <SlideScroller {scrollEvent} slideIdentifier="about" />
    <div class="contact-wrapper color-white display-grid grid-template-columns-responsive-400">
      <a
        href="mailto:andreas.riedel95@gmail.com"
        class="link-profile pt-100 pb-100  pr-20 pl-20 headline1 display-flex justify-content-center align-items-center">Hit
        me up!</a>
      <a
        target="_blank"
        href="https://bitbucket.org/AndreasRiedel/"
        class="link-profile pt-100 pb-100 pr-20 pl-20  headline1 display-flex justify-content-center align-items-center">Check
        out on GitHub!</a>
    </div>
    <div class="footer pl-70 pr-70"><a class="impressum" href="/impressum">Impressum</a></div>
  </div>
</main>
