<script>
  import CloseButton from 'components/atoms/CloseButton.svelte';
  import { fly } from 'svelte/transition';
  import 'intersection-observer';
  import { expoOut } from 'svelte/easing';
  import { onMount } from 'svelte';

  let wrapper;
  let skillWrapper;
  let intersectWrappers = [];
  let intersector = [];
  let actualScroll = 0;
  let startScroll = 0;
  let inScroll = false;
  let vw;
  let active;
  let maxBound;
  let transformSkillWrapper = false;

  const animationDelay = 1000;
  const animationDuration = 1500;

  let scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        transformSkillWrapper = true;
      } else {
        transformSkillWrapper = false;
      }
    });
  });

  let observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        active = parseInt(entry.target.dataset.index);
        observer.unobserve(entry.target);
      }
    });
  });

  onMount(() => {
    intersector.forEach((intersect) => {
      scrollObserver.observe(intersect);
    });

    intersectWrappers.forEach((wrapper) => {
      observer.observe(wrapper);
    });
    getBoundings();
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

  const getBoundings = () => {
    inScroll = false;
    maxBound = skillWrapper.scrollWidth;
  };

  const calculateScroll = (e) => {
    if (transformSkillWrapper && !inScroll) {
      inScroll = true;
      let height = maxBound;
      startScroll = height - e.target.scrollTop;
    }

    if (transformSkillWrapper) {
      actualScroll = startScroll - (maxBound - e.target.scrollTop);
      actualScroll = clamp(actualScroll, 0, maxBound - vw);
    }
  };

  const clamp = (val, min, max) => {
    return Math.min(Math.max(val, min), max);
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

  .skill-outer-wrapper {
    height: var(--height);
  }

  .skill-wrapper {
    height: 100vh;
    position: sticky;
    top: 0;
    width: 100%;
    background-color: #fafafa;
    display: flex;
    align-items: center;
    &__inner {
      width: 100%;
      display: flex;
    }
  }

  .skill {
    width: 95%;
    flex-shrink: 0;
    min-height: 400px;
    height: 100%;
    padding: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    &--first {
      background: linear-gradient(90deg, rgba(225, 85, 66, 1) 0%, rgba(245, 200, 95, 1) 100%);
    }
    &--second {
      background: linear-gradient(90deg, rgba(241, 200, 95, 1) 0%, rgba(128, 195, 105, 1) 100%);
    }
    &--third {
      background: linear-gradient(90deg, rgba(128, 195, 105, 1) 0%, #4994e9 100%);
    }
    &--fourth {
      background: linear-gradient(90deg, #4994e9 0%, #603db1 100%);
    }
  }

  .divider-padding {
    width: 40px;
    flex-shrink: 0;
    height: 400px;
  }

  .intersector {
    position: absolute;
    bottom: 20%;
    right: 0;
    width: 100px;
    height: 50px;
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

  .contact-wrapper {
    background-color: #000;
  }

  .link {
    text-decoration: none;
    background-color: #000;
    color: #fff;
    transition: background-color 0.5s;
    width: 100%;
    height: 100%;
    &:hover {
      background-color: rgba(241, 200, 95, 1);
    }
  }
</style>

<svelte:window bind:innerWidth={vw} on:resize={getBoundings} />

<main on:scroll={(e) => calculateScroll(e)}>
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
      class="intro-wrapper display-grid grid-template-columns-responsive-400 mt-150 mb-150 grid-gap-medium"
      data-index="0"
      bind:this={intersectWrappers[0]}>
      <div class="headline1 max-width-400 font-weight-bold opacity-0" class:activeFadeUp={active >= 0}>
        The whole is more than the sum of its parts.
      </div>
      <div class="opacity-0" class:activeFadeUp={active >= 0}>
        <p>
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quod, rem labore fuga commodi, ab dolores expedita
          qui repellendus ipsam placeat, et nostrum corporis deleniti nemo provident delectus asperiores! Voluptas,
          dolorem?
        </p>
        <p class="mt-20">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quod, rem labore fuga commodi, ab dolores expedita
          qui repellendus ipsam placeat, et nostrum corporis deleniti nemo provident delectus asperiores! Voluptas,
          dolorem?
        </p>
        <p class="mt-20">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quod, rem labore fuga commodi, ab dolores expedita
          qui repellendus ipsam placeat, et nostrum corporis deleniti nemo provident delectus asperiores! Voluptas,
          dolorem? et nostrum corporis deleniti nemo provident delectus asperiores! Voluptas, dolorem?
        </p>
      </div>
    </div>
    <div class="skill-outer-wrapper" bind:this={wrapper} style="--height: {maxBound}px">
      <div class="skill-wrapper" bind:this={skillWrapper}>
        <div class="skill-wrapper__inner" style="transform: translate3d(-{actualScroll}px, 0,0)">
          <div class="divider-padding" />
          <div class="skill skill--first">
            <div class="max-width-500">
              <span class="font-weight-medium">Allrounder.</span>
              From the development and conception to the programming of multimedia apps and websites: In my past
              projects and companys I was allowrd to work for, I gained a lot of practical experience in various areas.
              I'm able to to communicate to the respective specialists at eye level. I'm aware of the wride ranges of
              possibilities in programming and its implementation as well I have the knowledge about UX Design.
            </div>
          </div>
          <div class="divider-padding" />
          <div class="skill skill--second">
            <div class="max-width-500">
              <span class="font-weight-medium">Maker.</span>
              In my past projects, I had to adapt and learn fast in order to meet the challenge of teaching myself
              various programming languages. My goal is to keep evolving and always doing something to be part of the
              Digital Transformation. I think that Customer Relationship Management will play a major role in the future
              as it allows personalized customer care. The most important thing for companies of the future is to know
              thier customers to offer personalized digital solutions.
            </div>
          </div>
          <div class="divider-padding" />
          <div class="skill skill--third">
            <div class="max-width-500">
              <span class="font-weight-medium">Socializer.</span>
              Through my work at the Deutsche Oper am Rhein Duesseldorf, as well as my two years working experience in
              Amsterdam, I learned to communicate efficiently in interdisciplinary team constellations. It is important
              to me to do my tasks properly and conscientiously. I'm always up for fun as well as an open-minded guy.
            </div>
          </div>
          <div class="divider-padding" />
          <div class="skill skill--fourth">
            <div class="max-width-500">
              <span class="font-weight-medium">International.</span>
              Due to my semester abroad in Amsterdam and my subsequently year of working as a Front-end Developer in an
              Amsterdam StartUp, I'm used to work in multicultural and international teams.
            </div>
          </div>
          <div class="divider-padding" />
        </div>
        <div class="intersector" bind:this={intersector[0]} />
      </div>
    </div>
    <div class="pt-200 pb-150 mb-150" style="background-color: #fff">
      <div class="award-grid mb-100" data-index="1" bind:this={intersectWrappers[1]}>
        <img
          src="https://ik.imagekit.io/andreasriedel/award_winning_qrMgxUUhtCnv.JPG"
          alt="award winning"
          style="width: 100%; opacity: 0"
          class:activeFadeUpDelay300={active >= 1} />
        <div class="award-grid__text-wrapper opacity-0" class:activeFadeUpDelay300={active >= 1}>
          <div class="headline2 headline2--thin mb-30" id="award">
            Best graduate of the Faculty of Printing and Media Technology
          </div>
          <div>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam quae magni mollitia, architecto labore,
            exercitationem praesentium nulla cupiditate voluptas illo maiores aspernatur accusamus dolor odit, nisi cum
            tempore assumenda natus!
          </div>
        </div>
      </div>
    </div>
    <div class="contact-wrapper color-white display-grid grid-template-columns-responsive-400">
      <a
        href="mailto:andreas.riedel95@gmail.com"
        class="link pt-100 pb-100  pr-20 pl-20 headline1 display-flex justify-content-center align-items-center">Hit me
        up!</a>
      <a
        target="_blank"
        href="https://bitbucket.org/AndreasRiedel/"
        class="link pt-100 pb-100 pr-20 pl-20  headline1 display-flex justify-content-center align-items-center">Check
        out on GitHub!</a>
    </div>
  </div>
</main>
