<script lang="ts">
  import type { Book } from '../../../models';
  import CircleTick from '../../../assets/circleTick.svg';

  export let index: number;
  export let book: Book;
</script>

<tr class="book-item">
  <td class="book-item--count vcenter muted">{index}</td>
  <td class="book-item--cover">
    <img src={book.imageUrl} class="book-item--cover-img" alt="" />
  </td>
  <td class="book-item--meta">
    <div class="book-item--title">{book.title}</div>
    <div class="book-item--author muted small ellipsis">{book.author}</div>
  </td>
  <td class="book-item--action vcenter">
    <div class="skip-icon">
      {@html CircleTick}
    </div>
    <div class="muted small ellipsis">Skipped</div>
    <div class="muted smaller ellipsis">(No highlights)</div>
  </td>
</tr>

<style>
  .book-item--count {
    font-size: 1.5em;
  }

  .book-item--cover {
    margin-right: 12px;
  }

  .book-item--cover-img {
    width: 60px;
    border-radius: 4px;
    overflow: hidden;
  }

  .book-item--meta {
    vertical-align: top;
  }

  .book-item--title {
    font-size: 0.9em;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 1.4em;
  }

  .book-item--action {
    margin: 0 10px;
    grid-area: action;
  }

  /* .success-icon {
    width: 20px;
    fill: green;
  } */

  .skip-icon {
    width: 20px;
    fill: var(--text-muted);
  }

  .muted {
    color: var(--text-muted);
  }

  .small {
    font-size: 0.85em;
  }

  .smaller {
    font-size: 0.7em;
    line-height: normal;
  }

  .ellipsis {
    /* white-space: nowrap; */
    text-overflow: ellipsis;
    overflow: hidden;
  }
</style>
