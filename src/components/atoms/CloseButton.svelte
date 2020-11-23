<script>
  export let link;
</script>

<style lang="scss">
  .close {
    position: absolute;
    width: 25px;
    height: 25px;
    opacity: 0.7;
    padding: 20px;
    transition: opacity 0.5s;
  }
  .close:hover {
    opacity: 1;
  }
  .close:before,
  .close:after {
    position: absolute;
    top: 10px;
    left: 18px;
    content: ' ';
    height: 25px;
    width: 2px;
    border-radius: 8px;
    background-color: #969696;
  }
  .close:before {
    transform: rotate(45deg);
  }
  .close:after {
    transform: rotate(-45deg);
  }
</style>

<a href={link} class="close" />
