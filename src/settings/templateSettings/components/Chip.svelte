<script lang="ts">
  export let title: string;
</script>

<div class="chip setting-command-hotkeys">
  <span class="setting-hotkey">{`{{${title}}}`}</span>
</div>

<style>
  .chip {
    display: inline-flex;
    color: var(--text-normal);
    margin: 0;
  }
</style>
