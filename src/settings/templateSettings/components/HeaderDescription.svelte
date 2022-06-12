<script lang="ts">
  export let onClick: () => void;
</script>

<div class="wrapper">
  Customise plugin settings using <a href="https://mozilla.github.io/nunjucks/templating.html"
    >Nunjucks</a
  >
  templating.
  <a href="/" on:click|preventDefault={() => onClick()}>See available template variables</a>
</div>

<style>
  .wrapper {
    margin-bottom: 10px;
    font-weight: normal;
  }
</style>
