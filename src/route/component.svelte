
{#each methods as method}
  <h1 data-path="{method}">{method}</h1>
  <h2>
    <span class="method">{method}</span> {validation.params.example}
  </h2>

  <pre style="display: block;">
    <code class="highlight shell">curl <span class="s2">"{validation.params.example}"</span> \
      {#if validation.payload}
        -H <span class="s2">"Content-Type: application/json"</span> \
        -d <span class="s2">{validation.payload.example}</span>
      {/if}
    </code>
  </pre>

  <pre style="display: block;">
    <code class="highlight javascript">
      <!-- const request = require('request')

      const options = {
        method: '<span class="s2">{{@key}}</span>',
        path: '<span class="s2">{{validation.params.example}}</span>',
        {#if validation.payload}
        json: true,
        body: '<span class="s2">{{stringify validation.payload.example}}</span>'
        {/if}
      }

      request(options, (error, response, body) => {
        console.log(error, body)
      }) -->
    </code>
  </pre>

  <p class="endpoint-description">{description}</p>

  <h3>HTTP REQUEST</h3>
  <p class="url-mapping">
    <code prettyprint="true">
      <span class="method">method</span> {method}
    </code>
  </p>

  <h3>TAGS</h3>
  <ul class="tags">
    {#each tags as tag}
    <li class="tag">{tag}</li>
    {/each}
  </ul>
              
  {#each queryType as qType}
  {#if qType.elements}
  <h3>{qType.humanName}</h3>
  <table class="{qType}-table">
    <thead>
      <tr>
        <td>Key</td>
        <td>Type</td>
        <td>Description</td>
        <td>Allowed Values</td>
      </tr>
    </thead>
    <tbody>
      {#each qType.elements as el, v}
      <tr>
        <td>{el}</td>
        <td>{v.type}</td>
        <td>{v.description}</td>
        <td>
          {#if valid}
            <ul class="valids">
              {#each valids as valid}
                <li class="valid">{valid}</li>
              {/each}
            </ul>
          {/if}
        </td>
      </tr>
      {/each}
    </tbody>
  </table>
  {/if}
  {/each}
{/each}