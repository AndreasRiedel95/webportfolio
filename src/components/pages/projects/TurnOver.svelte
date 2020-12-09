<script>
  import ProjectHeader from 'components/layout/ProjectHeader.svelte';
  import Parralax from 'components/layout/Parralax.svelte';
  import ProjectIntro from 'components/layout/ProjectIntro.svelte';

  let template = {
    header: {
      title: ['TURN-', 'OVER-APP'],
      year: "18'",
      skills: 'University <br /> React Native, iOS iPad App',
    },
    parralax: {
      video: true,
      url: '/videos/toa.mp4',
    },
    intro: {
      introTitle: 'A reacte native app to improve communication between flight crew and gate agents at the airport.',
      introText: [
        'This project was a cooperation between the Hogeschool van Amsterdam and the Dutch IT and Consulting company Gen25. ',
        'The goal of the app is to avoid delays in flight operations by digitizing the communication between the crew and the gate agents at the airport.',
        'The design was provided by Gen25. The application is developed in React Native and communicates with a Salesforce backend. The application has a login, a task manager and a chat/message function.Tasks are synchronized between the staff involved in a flight process.',
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
</style>

<main>
  <div class="wrapper">
    <ProjectHeader {...template.header} />
    <Parralax {...template.parralax} />
    <div class="content">
      <ProjectIntro {...template.intro} />
    </div>
  </div>
</main>
