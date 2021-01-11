<style>
    .footer {
        background-color: #000;
        width: 100%;
        position: relative;
        flex-shrink: 0;
        display: flex;
        align-items: center;
    }

    .footer-text {
        color: #fff;
        text-decoration: none;
        font-size: 12px;
    }

    .icon {
        height: 20px;
    }
</style>

<div class="footer pl-70 pt-30 pb-30 pr-70">
    <div class="footer-text">Anreas Riedel © {new Date().getFullYear()}</div>
    <div class="display-flex margin-left-auto align-items-center">
        <a
            class="icon display-flex mr-20"
            href="mailto:andreas.riedel95@gmail.com">
            <img src="/svg/mail.svg" alt="MailLogo" />
        </a>
        <a
            class="icon display-flex"
            target="_blank"
            href="https://www.linkedin.com/in/andreas-riedel-470206186/">
            <img src="/svg/linkedin.svg" class="icon" alt="Linked In Logo" />
        </a>
        <span class="ml-20 color-white"> – </span>
        <a class="footer-text ml-20" href="/impressum">Impressum</a>
    </div>
</div>
