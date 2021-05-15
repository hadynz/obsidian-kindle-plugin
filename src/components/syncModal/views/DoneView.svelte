<script lang="ts">
  import { numberWithCommas } from '../../../utils';
  import { syncSessionStore as store } from '../../../store';

  import obsidianLogo from '../../../assets/obsidianLogo.png';
  import kindleLogo from '../../../assets/kindleLogo.png';

  const processed = store.getJobs('done');
  const highlightsProcessed = processed.reduce((aggregate, job) => {
    return aggregate + job.highlightsProcessed;
  }, 0);
</script>

<div class="kp-done--wrapper">
  <div class="kp-done--source">
    Source
    <div class="kp-done--item">
      <div>Total books</div>
      <div class="kp-done--value">
        {numberWithCommas(store.getJobs().length)}
      </div>
    </div>
  </div>
  <div class="kp-done--target">
    Target
    <img src={obsidianLogo} alt="" width="50px" />
    <img src={kindleLogo} alt="" width="35px" />
    <div class="kp-done--item">
      <div>Books processed</div>
      <div class="kp-done--value">{numberWithCommas(processed.length)}</div>
    </div>
    <div class="kp-done--item">
      <div>Highlights processed</div>
      <div class="kp-done--value">{numberWithCommas(highlightsProcessed)}</div>
    </div>
    <div class="kp-done--item">
      <div>Books skipped</div>
      <div class="kp-done--value">
        {numberWithCommas(store.getJobs('skip').length)}
      </div>
    </div>
    <div class="kp-done--item">
      <div>Errors</div>
      <div class="kp-done--value">
        {numberWithCommas(store.getJobs('error').length)}
      </div>
    </div>
  </div>
</div>

<style>
  .kp-done--wrapper {
    margin-top: 40px;
    display: flex;
    flex-direction: row;
    justify-content: center;
  }

  .kp-done--source {
    margin-right: 40px;
  }

  .kp-done--item {
    margin-right: 40px;
  }

  .kp-done--item:last-child {
    margin-right: 0;
  }

  .kp-done--value {
    color: var(--text-accent);
    font-size: 3em;
    line-height: normal;
  }
</style>
