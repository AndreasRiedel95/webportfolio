<script>
  import ProjectHeader from 'components/layout/ProjectHeader.svelte';
  import Parralax from 'components/layout/Parralax.svelte';
  import ProjectIntro from 'components/layout/ProjectIntro.svelte';
  import { onMount } from 'svelte';
  let wrappers = [];
  let active;

  let observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        active = parseInt(entry.target.dataset.index);
        observer.unobserve(entry.target);
      } else {
      }
    });
  });

  onMount(() => {
    wrappers.forEach((wrapper) => {
      observer.observe(wrapper);
    });
  });

  let template = {
    header: {
      title: ['HTML- & CSS-', 'eLearning'],
      year: "18'",
      skills: 'University <br /> Web, Application, Bachelorthesis',
      award: true,
    },
    parralax: {
      video: true,
      url: '/videos/learnplatform.mp4',
    },
    intro: {
      introTitle: 'Our team created this site to memorialize the works of great fashion photographer Peter Lindbergh.',
      introText: [
        'Obys agency is a fan of his photography and his vision, so our mission in creating this site was to remind the world of Lindbergh’s work and perhaps introduce someone to his art. Here in Ukraine, many people don’t know about him, unfortunately.',
        'The site was created entirely on Readymag, so any extra development wasn’t needed. Before this, we had only used Readymag for internal tasks and meetings. The list of animation opportunities was very attractive to us.',
      ],
    },
  };
</script>

<style lang="scss">
  main {
    background-color: #161616;
    color: #fff;
    width: 100%;
    z-index: 10;
  }

  .wrapper {
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    flex-direction: column;
    z-index: 10;
  }

  .content {
    background-color: #161616;
    z-index: 10;
  }

  .award-grid {
    display: grid;
    opacity: 0;
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

  .content-grid {
    max-width: 1500px;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    padding-left: 70px;
    padding-right: 70px;
    @media screen and (max-width: 700px) {
      padding-right: 30px;
      padding-left: 30px;
    }
    &__row {
      display: flex;
      opacity: 0;
      @media screen and (max-width: 700px) {
        margin-bottom: 40px;
      }
      &__image-wrapper {
        width: 60vw;
        opacity: 0;
        @media screen and (max-width: 700px) {
          margin-bottom: 100px;
          width: 100%;
          margin-left: 0;
          & > img {
            object-fit: contain;
            width: 100%;
            height: 100%;
          }
        }
      }
    }
  }
</style>

<main>
  <div class="wrapper">
    <ProjectHeader {...template.header} />
    <Parralax {...template.parralax} />
    <div class="content">
      <ProjectIntro {...template.intro} />
      <div class="pt-200 pb-150 mb-150" style="background-color: #fff">
        <div class="award-grid mb-100" data-index="0" bind:this={wrappers[0]} class:activeFadeUp={active >= 0}>
          <img
            src="https://ik.imagekit.io/andreasriedel/award_winning_qrMgxUUhtCnv.JPG"
            alt="award winning"
            style="width: 100%" />
          <div class="award-grid__text-wrapper">
            <div class="headline2 headline2--thin mb-30" id="award">
              Best graduate of the Faculty of Printing and Media Technology
            </div>
            <div>
              I successfully graduated in my bachelor's degree in Print and Media Technology – Digital Publishing and
              have been awarded by the Print and Media Association of the State of Baden-Württemberg e.V. (dpmi) for
              being the best graduate student in my faculty.
            </div>
          </div>
        </div>
      </div>
      <div class="content-grid">
        <div class="content-grid__row" bind:this={wrappers[1]} data-index="1" class:activeFadeUp={active >= 1}>
          <div class="margin-left-auto max-width-400 mb-40">
            <div class="headline2 headline2--thin mb-10" style="color: #929292">Admin panel for easy data fill in.</div>
            <div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam quae magni.</div>
          </div>
        </div>
        <div class="content-grid__row__image-wrapper mb-150" class:activeFadeUpDelay300={active >= 1}>
          <img class="width-100" src="https://ik.imagekit.io/andreasriedel/learning_1_Ewj67eAneDuTA.png" alt="" />
        </div>
        <div class="content-grid__row" bind:this={wrappers[2]} data-index="2" class:activeFadeUp={active >= 2}>
          <div class="margin-right-auto max-width-400 mb-40">
            <div class="headline2 headline2--thin mb-10" style="color: #929292">Easy UI to navigate through.</div>
            <div>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam quae magni mollitia, architecto labore.
            </div>
          </div>
        </div>
        <div class="content-grid__row__image-wrapper mb-150 margin-left-auto" class:activeFadeUpDelay300={active >= 2}>
          <img class="width-100" src="https://ik.imagekit.io/andreasriedel/learning_2_7RkDHKVolSk-.png" alt="" />
        </div>
        <div class="content-grid__row" bind:this={wrappers[3]} data-index="3" class:activeFadeUp={active >= 3}>
          <div class="margin-left-auto max-width-400 mb-40">
            <div class="headline2 headline2--thin mb-10" style="color: #929292">Read. Understand. <br /> Solve.</div>
            <div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam quae magni.</div>
          </div>
        </div>
        <div class="content-grid__row__image-wrapper mb-100" class:activeFadeUpDelay300={active >= 3}>
          <img src="https://ik.imagekit.io/andreasriedel/learning_3_SYYbjzvlK-0l.png" style="width: 100%" alt="" />
        </div>
      </div>
    </div>
  </div>
</main>
