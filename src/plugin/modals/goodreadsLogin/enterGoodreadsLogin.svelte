<script lang="ts">
    export let onSubmit: (value: string) => void;
    let tokenInput: HTMLInputElement;
</script>

<div class="setting-item">
    <div class="setting-item-info">
        <div class="setting-item-name">Readwise Token</div>
        <div class="setting-item-description">
            <span
                >You can find the token
                <a href="https://readwise.io/access_token"> here!</a></span
            >
        </div>
    </div>
    <div class="setting-item-control">
        <input bind:this={tokenInput} type="text" placeholder="API token" />
    </div>
</div>
<button
    class="mod-cta"
    style="float: right"
    on:click={() => onSubmit(tokenInput.value)}
>
    Submit
</button>
