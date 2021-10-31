<script lang="ts">
  import type { SyncMode } from '~/models';
  import { settingsStore } from '~/store';
  import amazonIcon from '~/assets/amazonIcon.svg';
  import clippingsIcon from '~/assets/clippingsIcon.svg';

  export let onClick: (mode: SyncMode) => void;

  let selectedSyncType: SyncMode = $settingsStore.lastSyncMode;
</script>

<div class="kp-syncbuttons--wrapper">
  <div class="kp-syncbuttons--option">
    <a
      href="#sync"
      class="kp-syncbuttons--icon"
      class:kp-syncbuttons--icon-selected={selectedSyncType === 'amazon'}
      on:click={() => {
        selectedSyncType = 'amazon';
      }}
    >
      {@html amazonIcon}
    </a>
    <div class="kp-syncbuttons-text">Amazon Cloud</div>
  </div>
  <div class="kp-syncbuttons--option">
    <a
      href="#sync"
      class="kp-syncbuttons--icon"
      class:kp-syncbuttons--icon-selected={selectedSyncType === 'my-clippings'}
      on:click={() => {
        selectedSyncType = 'my-clippings';
      }}
    >
      {@html clippingsIcon}
    </a>
    <div class="kp-syncbuttons-text">Upload "My Clippings" file</div>
  </div>
</div>

<div class="setting-item-control">
  <button
    class="mod-cta"
    on:click={() => {
      onClick(selectedSyncType);
    }}>Sync now</button
  >
</div>

<style>
  .kp-syncbuttons--wrapper {
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin: 40px 0;
  }

  .kp-syncbuttons--option {
    width: 120px;
  }

  .kp-syncbuttons--option:first-child {
    margin-right: 20px;
  }

  .kp-syncbuttons--icon {
    display: block;
    height: 120px;
    padding: 32px;
    border-radius: 4px;
  }

  .kp-syncbuttons--icon-selected {
    background-color: var(--interactive-accent);
  }

  .kp-syncbuttons--icon:not(.kp-syncbuttons--icon-selected):hover {
    background-color: var(--interactive-hover);
  }

  .kp-syncbuttons-text {
    margin-top: 14px;
    font-size: 0.9em;
    text-align: center;
    line-height: normal;
    color: var(--text-muted);
  }
</style>
