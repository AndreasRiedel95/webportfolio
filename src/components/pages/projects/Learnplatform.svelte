<script>
  import ProjectHeader from 'components/layout/ProjectHeader.svelte';
  import Parralax from 'components/layout/Parralax.svelte';
  import ProjectIntro from 'components/layout/ProjectIntro.svelte';

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
    grid-template-columns: 1fr 1fr;
    padding-left: 100px;
    grid-gap: 200px;
    padding-right: 100px;
    color: #000;
    width: 100%;
    align-items: center;
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
    &__row {
      display: flex;
      &--image {
        width: 60vw;
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
        <div class="award-grid mb-100">
          <img
            src="https://ik.imagekit.io/andreasriedel/award_winning_qrMgxUUhtCnv.JPG"
            alt="award winning"
            style="width: 100%" />
          <div class="award-grid__text-wrapper">
            <div class="headline2 headline2--thin mb-30" id="award">
              Best graduate of the Faculty of Printing and Media Technology
            </div>
            <div>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam quae magni mollitia, architecto labore,
              exercitationem praesentium nulla cupiditate voluptas illo maiores aspernatur accusamus dolor odit, nisi
              cum tempore assumenda natus!
            </div>
          </div>
        </div>
      </div>
      <div class="content-grid">
        <div class="content-grid__row">
          <div style="margin-left: auto; max-width: 400px">
            <div class="headline2 headline2--thin mb-10">Admin panel for easy data fill in.</div>
            <div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam quae magni.</div>
          </div>
        </div>
        <div class="content-grid__row content-grid__row--image mb-150">
          <img src="https://ik.imagekit.io/andreasriedel/learning_1_Ewj67eAneDuTA.png" style="width: 100%" alt="" />
        </div>
        <div class="content-grid__row">
          <div style="margin-right: auto; max-width: 400px">
            <div class="headline2 headline2--thin mb-10">Easy UI to navigate through.</div>
            <div>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam quae magni mollitia, architecto labore.
            </div>
          </div>
        </div>
        <div class="content-grid__row content-grid__row--image mb-150" style="margin-left: auto">
          <img src="https://ik.imagekit.io/andreasriedel/learning_2_7RkDHKVolSk-.png" style="width: 100%" alt="" />
        </div>
        <div class="content-grid__row">
          <div style="margin-left: auto; max-width: 400px">
            <div class="headline2 headline2--thin mb-10">Read. Understand. <br /> Solve.</div>
            <div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam quae magni.</div>
          </div>
        </div>
        <div class="content-grid__row content-grid__row--image mb-100">
          <img src="https://ik.imagekit.io/andreasriedel/learning_3_SYYbjzvlK-0l.png" style="width: 100%" alt="" />
        </div>
      </div>
    </div>
  </div>
</main>
