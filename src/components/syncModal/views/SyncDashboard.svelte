<script lang="ts">
  const { moment } = window;

  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  export let lastSyncDate: Date;
  export let totalBooks: number;
  export let totalHighlights: number;
</script>

<div class="kp-dashboard--wrapper">
  <div class="kp-dashboard--item">
    <div>Books</div>
    <div class="kp-dashboard--value">{numberWithCommas(totalBooks)}</div>
  </div>
  <div class="kp-dashboard--item">
    <div>Highlights</div>
    <div class="kp-dashboard--value">{numberWithCommas(totalHighlights)}</div>
  </div>
</div>

<div class="kp-dashboard--secondary">
  Last sync {moment(lastSyncDate).fromNow()}
</div>

<style>
  .kp-dashboard--wrapper {
    display: flex;
    flex-direction: row;
    margin: 40px 0;
    justify-content: center;
  }

  .kp-dashboard--item {
    margin-right: 40px;
  }

  .kp-dashboard--item:last-child {
    margin-right: 0;
  }

  .kp-dashboard--value {
    color: var(--interactive-accent);
    font-size: 3em;
    line-height: normal;
  }

  .kp-dashboard--secondary {
    color: var(--text-muted);
    font-size: 0.85em;
    text-align: right;
  }
</style>
