<script lang="ts">
  import Chip from './Chip.svelte';
</script>

<tr>
  <td><Chip title={'title'} /></td>
  <td>Book title - short <span class="mute">- (always set)</span></td>
</tr>
<tr>
  <td><Chip title={'longTitle'} /></td>
  <td>Book title - full <span class="mute">- (always set)</span></td>
</tr>
<tr>
  <td><Chip title={'author'} /></td>
  <td>Authors' names <span class="mute">- (always set)</span></td>
</tr>
<tr>
  <td><Chip title={'authorsLastNames'} /></td>
  <td
    >Combined Authors' last names <span class="mute"
      >e.g. "Sanderson_et_al", Robin-Dominguez" - (always set)</span
    ></td
  >
</tr>
<tr>
  <td><Chip title={'firstAuthorFirstName'} /></td>
  <td>First name of first author <span class="mute">- (always set)</span></td>
</tr>
<tr>
  <td><Chip title={'firstAuthorLastName'} /></td>
  <td>Last name of first author <span class="mute">- (always set)</span></td>
</tr>
<tr>
  <td><Chip title={'secondAuthorFirstName'} /></td>
  <td>First name of second author</td>
</tr>
<tr>
  <td><Chip title={'secondAuthorLastName'} /></td>
  <td>Last name of second author</td>
</tr>
