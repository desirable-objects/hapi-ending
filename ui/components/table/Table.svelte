{#if elements}
<table>
  <thead>
    <th>Name</th>
    <th>Description</th>
    <th>Type</th>
    <th>Value</th>
    <th>Valid Values</th>
  </thead>
  <tbody>
    {#each Object.entries(elements) as [name, parameters] (name)}
    <tr>
      <td>{name}</td>
      <td>{parameters.description}</td>
      {#if parameters.type === 'object'}
        <td colspan="3" class="descendant">
          ⬎
        </td>
      {:else}
        <td>{parameters.type}</td>
        <td><input type="text" bind:value="parameters.example" /></td>
        <td>{parameters.valid ? parameters.valid.join(', ') : '-'}</td>
      {/if}
    </tr>
    {/each}
  </tbody>
</table>
{/if}

<style>
  table {
    width:100%;
    table-layout: fixed;
  }

  thead {
    background-color: rgba(255,255,255,0.3);
  }

  .tbody {
    overflow-x:auto;
    margin-top: 0px;
  }

  th {
    padding: 20px 15px;
    text-align: left;
    font-weight: 500;
    font-size: 12px;
    color: grey;
    text-transform: uppercase;
  }

  td {
    padding: 15px;
    text-align: left;
    vertical-align:middle;
    font-weight: 300;
    font-size: 12px;
    color: grey;
  }

  td.descendant {
    font-size: 18px;
  }
</style>