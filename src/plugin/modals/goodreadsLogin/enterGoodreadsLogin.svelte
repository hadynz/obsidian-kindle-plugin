<script>
  import { onMount } from 'svelte';

  export let onSubmit, submitting;
  let emailInput, passwordInput;

  onMount(() => {
    setTimeout(() => {
      emailInput.focus();
    }, 0);
  });
</script>

<div class="setting-item">
  <div class="setting-item-info">
    <div class="setting-item-name">Email address</div>
  </div>
  <div class="setting-item-control">
    <input bind:this={emailInput} type="text" placeholder="you@yours.com" />
  </div>
</div>

<div class="setting-item">
  <div class="setting-item-info">
    <div class="setting-item-name">Password</div>
  </div>
  <div class="setting-item-control">
    <input bind:this={passwordInput} type="password" />
  </div>
</div>

<div style="float: right">
  {#if submitting}
    <button class="mod-muted" disabled>Signing in...</button>
  {/if}
  {#if !submitting}
    <button
      class="mod-cta"
      on:click={() => onSubmit(emailInput.value, passwordInput.value)}
    >
      Sign in
    </button>
  {/if}
</div>
