<script lang="ts">
  import fileSyncIcon from '~/assets/fileSyncIcon.svg';

  export let onClick: () => void;
</script>

<div class="kp-upgrade--wrapper">
  <div class="kp-upgrade-welcome-column">
    <div class="kp-icon">
      {@html fileSyncIcon}
    </div>
  </div>
  <div>
    <p>
      This new version of the Kindle plugin introduces the highly requested feature of
      resyncing. The plugin will detect any new annotations that you've made on your Kindle and
      intelligently insert it in the right place in your Obsidian highlight file.
    </p>
    <p>
      Implementation of this feature required a <span class="kp-upgrade-highlight"
        >breaking change</span
      > in how the plugin writes Kindle highlights — (a) use of frontmatter to store sync state
      information and (b) block references for every synced highlight.
    </p>
    <p>
      You will need to re-run sync to download all your Kindle annotations which <span
        class="kp-upgrade-highlight">will result in double ups</span
      > – You will manually need to manage this to remove them. This is a one-time process. Future
      updates for the plugin are not planned to introduce anymore breaking changes.
    </p>
    <div class="setting-item-control">
      <button class="mod-cta" on:click={onClick}>I understand</button>
    </div>
  </div>
</div>

<style>
  .kp-upgrade--wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .kp-upgrade-welcome-column {
    margin-right: 50px;
    width: 330px;
  }

  .kp-upgrade-highlight {
    color: var(--text-accent);
  }

  .kp-icon {
    fill: var(--text-accent);
  }
</style>
