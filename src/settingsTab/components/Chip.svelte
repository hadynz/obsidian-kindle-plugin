<script lang="ts">
  export let title: string;
</script>

<div class="kp-chip setting-command-hotkeys">
  <span class="setting-hotkey">{`{{${title}}}`}</span>
</div>

<style>
  .kp-chip {
    display: inline-flex;
    color: var(--text-normal);
  }
</style>
