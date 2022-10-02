<script lang="ts">
  import Form from './Form.svelte';
  import Preview from './Preview.svelte';
</script>

<div class="row">
  <div class="form">
    <Form />
  </div>
  <div class="preview">
    <Preview />
  </div>
</div>

<style>
  .row {
    display: flex;
  }

  .form {
    flex-grow: 1;
  }

  .preview {
    margin-left: 50px;
    overflow: hidden;
  }
</style>
