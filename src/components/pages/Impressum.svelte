<script>
  import CloseButton from "components/atoms/CloseButton.svelte";
</script>

<style>
  .main {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    position: relative;
    scroll-behavior: smooth;
  }

  .close {
    position: fixed;
    right: 70px;
    top: 20px;
  }
</style>

<div class="main mb-100">
  <div class="close">
    <CloseButton link="/" />
  </div>
  <div
    class="max-width-800 width-100 margin-left-auto margin-right-auto pl-50 pr-50 pt-100 pb-100 color-white">
    <h1 class="headline1 mb-40">Impressum</h1>

    <h2 class="headline2 mb-20">Angaben gem&auml;&szlig; &sect; 5 TMG</h2>
    <p class="mb-30">
      Andreas Riedel<br />
      Conrad-R&ouml;ntgen Str. 23<br />
      74321 Bietigheim-Bissingen
    </p>

    <h2 class="headline2 mb-20">Kontakt</h2>
    <p class="mb-30">
      Telefon: 017632579715<br />
      E-Mail: andreas.riedel95@gmail.com
    </p>

    <h3 class="headline3 mb-20">Haftung f&uuml;r Inhalte</h3>
    <p class="mb-30">
      Als Diensteanbieter sind wir gem&auml;&szlig; &sect; 7 Abs.1 TMG f&uuml;r
      eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
      verantwortlich. Nach &sect;&sect; 8 bis 10 TMG sind wir als
      Diensteanbieter jedoch nicht verpflichtet, &uuml;bermittelte oder
      gespeicherte fremde Informationen zu &uuml;berwachen oder nach
      Umst&auml;nden zu forschen, die auf eine rechtswidrige T&auml;tigkeit
      hinweisen.
    </p>
    <p class="mb-30">
      Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen
      nach den allgemeinen Gesetzen bleiben hiervon unber&uuml;hrt. Eine
      diesbez&uuml;gliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis
      einer konkreten Rechtsverletzung m&ouml;glich. Bei Bekanntwerden von
      entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend
      entfernen.
    </p>
    <h3 class="headline3 mb-20">Haftung f&uuml;r Links</h3>
    <p class="mb-30">
      Unser Angebot enth&auml;lt Links zu externen Websites Dritter, auf deren
      Inhalte wir keinen Einfluss haben. Deshalb k&ouml;nnen wir f&uuml;r diese
      fremden Inhalte auch keine Gew&auml;hr &uuml;bernehmen. F&uuml;r die
      Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder
      Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum
      Zeitpunkt der Verlinkung auf m&ouml;gliche Rechtsverst&ouml;&szlig;e
      &uuml;berpr&uuml;ft. Rechtswidrige Inhalte waren zum Zeitpunkt der
      Verlinkung nicht erkennbar.
    </p>
    <p class="mb-30">
      Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch
      ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei
      Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend
      entfernen.
    </p>
    <h3 class="headline3 mb-20">Urheberrecht</h3>
    <p class="mb-30">
      Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen
      Seiten unterliegen dem deutschen Urheberrecht. Die Vervielf&auml;ltigung,
      Bearbeitung, Verbreitung und jede Art der Verwertung au&szlig;erhalb der
      Grenzen des Urheberrechtes bed&uuml;rfen der schriftlichen Zustimmung des
      jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind
      nur f&uuml;r den privaten, nicht kommerziellen Gebrauch gestattet.
    </p>
    <p class="mb-30">
      Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden,
      werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte
      Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine
      Urheberrechtsverletzung aufmerksam werden, bitten wir um einen
      entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden
      wir derartige Inhalte umgehend entfernen.
    </p>

    <p class="mb-30">
      Quelle:
      <a
        style="color: #fff"
        href="https://www.e-recht24.de">https://www.e-recht24.de</a>
    </p>
  </div>
</div>
