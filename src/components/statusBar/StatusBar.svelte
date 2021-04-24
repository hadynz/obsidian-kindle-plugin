<script>
  import { Jumper } from 'svelte-loading-spinners';

  import { statusBarStore } from '../../store';
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
  {#if $statusBarStore.isSyncing}
    <div class="kp-statusbar--icon">
      <Jumper color="#7f6df2" size="18" duration="1.2s" />
    </div>
  {/if}
  <div class="kp-statusbar--status">
    {$statusBarStore.text}
  </div>
</div>
