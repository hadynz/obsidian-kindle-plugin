<script lang="ts">
  import Chip from './Chip.svelte';
  import CommonVariables from './CommonVariables.svelte';

  import type { TemplateTab } from '../../types';

  export let template: TemplateTab;
</script>

<div id="wrapper">
  {#if template === 'file-name'}
    <table>
      <tbody>
        <CommonVariables />
      </tbody>
    </table>
  {:else if template === 'file'}
    <table>
      <tbody>
        <CommonVariables />
        <tr>
          <td><Chip title={'asin'} /></td>
          <td>Book ASIN</td>
        </tr>
        <tr>
          <td><Chip title={'url'} /></td>
          <td>Book Url on Amazon.com</td>
        </tr>
        <tr>
          <td><Chip title={'imageUrl'} /></td>
          <td>Book cover page Url</td>
        </tr>
        <tr>
          <td><Chip title={'lastAnnotatedDate'} /></td>
          <td>Date of last book highlight</td>
        </tr>
        <tr>
          <td><Chip title={'appLink'} /></td>
          <td>Link to book in Kindle app</td>
        </tr>
        <tr>
          <td><Chip title={'isbn'} /></td>
          <td>ISBN</td>
        </tr>
        <tr>
          <td><Chip title={'pages'} /></td>
          <td>Number of pages in book</td>
        </tr>
        <tr>
          <td><Chip title={'publicationDate'} /></td>
          <td>Publication date</td>
        </tr>
        <tr>
          <td><Chip title={'publisher'} /></td>
          <td>Name of publisher</td>
        </tr>
        <tr>
          <td><Chip title={'authorUrl'} /></td>
          <td>Author's page on Amazon.com</td>
        </tr>
        <tr>
          <td><Chip title={'highlightsCount'} /></td>
          <td>Number of highlights <span class="mute">- (always set)</span></td>
        </tr>
        <tr>
          <td><Chip title={'highlights'} /></td>
          <td>Block of book highlights <span class="mute">- (always set)</span></td>
        </tr>
      </tbody>
    </table>
  {:else if template === 'highlight'}
    <table>
      <tbody>
        <CommonVariables />
        <tr /><tr>
          <td><Chip title={'text'} /></td>
          <td>Highlighted text<span class="mute">- (always set)</span></td>
        </tr>
        <tr>
          <td><Chip title={'location'} /></td>
          <td>Location</td>
        </tr>
        <tr>
          <td><Chip title={'page'} /></td>
          <td>Page</td>
        </tr>
        <tr>
          <td><Chip title={'note'} /></td>
          <td>Your note annotation</td>
        </tr>
        <tr>
          <td><Chip title={'color'} /></td>
          <td>Highlighted color</td>
        </tr>
        <tr>
          <td><Chip title={'createdDate'} /></td>
          <td
            >Highlight creation date. <br /><span class="mute"
              >Use
              <a href="https://momentjs.com/docs/#/displaying/format/"
                >moment's format strings</a
              >
              to format date e.g. <Chip title={'createdDate | date("DD-MM-YYYY")'} /></span
            >
          </td>
        </tr>
        <tr>
          <td><Chip title={'appLink'} /></td>
          <td>Link to highlighted text in Kindle app</td>
        </tr>
      </tbody>
    </table>
  {/if}
</div>

<style>
  #wrapper {
    max-height: 500px;
    overflow-y: auto;
  }

  table {
    display: grid;
    min-width: 100%;
    grid-template-columns: auto auto;
    column-gap: 1rem;
    row-gap: 1rem;
  }

  #wrapper :global(tbody),
  #wrapper :global(tr) {
    display: contents;
  }

  #wrapper :global(tr td:nth-child(2)) {
    font-size: 0.8em;
  }

  #wrapper :global(.mute) {
    color: var(--text-muted);
  }
</style>
