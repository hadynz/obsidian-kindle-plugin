<script lang="ts">
  import { numberWithCommas } from '../../../utils';
  import { syncSessionStore as store } from '../../../store';
  import BookItem from './BookItem.svelte';

  import obsidianLogo from '../../../assets/obsidianLogo.png';
  import kindleLogo from '../../../assets/kindleLogo.png';

  const processed = store.getJobs('done');
  const highlightsProcessed = processed.reduce((aggregate, job) => {
    return aggregate + job.highlightsProcessed;
  }, 0);
</script>

<div class="books-list grid-container">
  <BookItem />
  <BookItem />
  <BookItem />
  <BookItem />
  <BookItem />
  <BookItem />
</div>

<style>
  .books-list {
    overflow-y: scroll;
    height: 300px;
  }

  .grid-container {
    display: grid;
    grid-template-columns: auto 200px 1fr auto;
    grid-template-rows: 1fr;
    gap: 14px 18px;
    grid-template-areas: 'index cover meta action';
  }
</style>
