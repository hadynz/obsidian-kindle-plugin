<script lang="ts">
  import { Jumper } from 'svelte-loading-spinners';

  import CircleTick from '~/assets/circleTick.svg';
  import CircleExclamation from '~/assets/circleExclamation.svg';
  import { statusBarStore, settingsStore } from '~/store';
</script>

<div class="kp-statusbar--wrapper">
  {#if $statusBarStore.isSyncing}
    <div class="kp-statusbar--icon">
      <Jumper color="#7f6df2" size="18" duration="1.2s" />
    </div>
  {:else if !$settingsStore.isLoggedIn && $settingsStore.lastSyncDate}
    <div class="kb-statusbar--circleExclamationIcon">
      {@html CircleExclamation}
    </div>
  {:else if $settingsStore.lastSyncDate}
    <div class="kb-statusbar--circleIcon">
      {@html CircleTick}
    </div>
  {/if}
  <div class="kp-statusbar--status">
    {$statusBarStore.text}
  </div>
</div>

<style>
  .kp-statusbar--wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .kp-statusbar--icon {
    margin-right: 3px;
  }

  .kb-statusbar--circleIcon {
    width: 11px;
    fill: green;
    margin-right: 5px;
  }

  .kb-statusbar--circleExclamationIcon {
    position: relative;
    top: 2px;
    width: 14px;
    fill: orange;
    margin-right: 5px;
  }
</style>
