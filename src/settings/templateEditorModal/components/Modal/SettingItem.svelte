<script lang="ts">
  export let name: string;
  export let description: string = '';
</script>

<div class="setting-item vertical">
  <div class="setting-item-name">{name}</div>
  {#if description !== ''}
    <div class="setting-item-description">{description}</div>
  {/if}
  <slot />
</div>

<style>
  .vertical {
    flex-direction: column;
    align-items: start;
  }
</style>
