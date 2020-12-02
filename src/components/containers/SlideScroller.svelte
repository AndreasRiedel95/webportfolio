<script>
  import { onMount } from 'svelte';
  import 'intersection-observer';
  export let scrollEvent;
  let maxBound;
  let transformSkillWrapper = false;
  let actualScroll = 0;
  let startScroll = 0;
  let inScroll = false;
  let wrapper;
  let skillWrapper;
  let vw;
  let intersector = [];

  $: calculateScroll(scrollEvent);

  onMount(() => {
    intersector.forEach((intersect) => {
      scrollObserver.observe(intersect);
    });

    getBoundings();
  });

  let scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        transformSkillWrapper = true;
      } else {
        transformSkillWrapper = false;
      }
    });
  });
  const getBoundings = () => {
    inScroll = false;
    maxBound = skillWrapper.scrollWidth;
  };

  const calculateScroll = (e) => {
    if (transformSkillWrapper && !inScroll) {
      inScroll = true;
      let height = maxBound - vw * 0.2;
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
</style>

<svelte:window bind:innerWidth={vw} on:resize={getBoundings} />
<div class="skill-outer-wrapper" bind:this={wrapper} style="--height: {maxBound}px">
  <div class="skill-wrapper" bind:this={skillWrapper}>
    <div class="skill-wrapper__inner" style="transform: translate3d(-{actualScroll}px, 0,0)">
      <div class="divider-padding" />
      <div class="skill skill--first">
        <div class="max-width-500">
          <span class="font-weight-medium">Allrounder.</span>
          From the development and conception to the programming of multimedia apps and websites: In my past projects
          and companys I was allowrd to work for, I gained a lot of practical experience in various areas. I'm able to
          to communicate to the respective specialists at eye level. I'm aware of the wride ranges of possibilities in
          programming and its implementation as well I have the knowledge about UX Design.
        </div>
      </div>
      <div class="divider-padding" />
      <div class="skill skill--second">
        <div class="max-width-500">
          <span class="font-weight-medium">Maker.</span>
          In my past projects, I had to adapt and learn fast in order to meet the challenge of teaching myself various
          programming languages. My goal is to keep evolving and always doing something to be part of the Digital
          Transformation. I think that Customer Relationship Management will play a major role in the future as it
          allows personalized customer care. The most important thing for companies of the future is to know thier
          customers to offer personalized digital solutions.
        </div>
      </div>
      <div class="divider-padding" />
      <div class="skill skill--third">
        <div class="max-width-500">
          <span class="font-weight-medium">Socializer.</span>
          Through my work at the Deutsche Oper am Rhein Duesseldorf, as well as my two years working experience in
          Amsterdam, I learned to communicate efficiently in interdisciplinary team constellations. It is important to
          me to do my tasks properly and conscientiously. I'm always up for fun as well as an open-minded guy.
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
