<script>
  import { Jumper } from 'svelte-loading-spinners';
  const moment = window.moment;

  export let text, isSyncing;
</script>

<style>
  .kp-statusbar--wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .kp-statusbar--icon {
    margin-right: 3px;
  }
</style>

<div class="kp-statusbar--wrapper">
  {#if isSyncing}
    <div class="kp-statusbar--icon">
      <Jumper color="#7f6df2" size="18" duration="1.2s" />
    </div>
  {/if}
  <div class="kp-statusbar--status">
    {text}
  </div>
</div>
