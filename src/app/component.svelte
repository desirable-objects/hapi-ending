<a id="nav-button">
  <span>
    NAV
    <img src="{{documentationUrl}}/{{assetsPath}}/img/navbar.png" />
  </span>
</a>

<div class="tocify-wrapper">
  <img src="{logoUrl}" alt="hapijs" style="width: 80%; margin: 20px;" />
  <!-- <LangSelector /> -->
  <div class="search">
    <input ref:search type="text" class="search" placeholder="Search">
  </div>
  <ul class="search-results"></ul>
  <div id="toc">
  </div>
  <ul class="toc-footer">
      <li><a href='http://github.com/tripit/slate'>Documentation based on Slate</a>
      </li>
  </ul>
</div>
<div class="page-wrapper">
  <div class="dark-box"></div>
  <div class="content">
    {#each routes as route}
      <!-- <Route route="route" /> -->
    {/each}
  </div>
  <div class="dark-box">
    <!-- <LangSelector /> -->
  </div>
</div>

<script>
  // import Route from '../route/component.svelte'
  // import LangSelector from '../lang-selector/component.svelte'

  export default {
    async oncreate () {
      const res = await fetch('http://localhost:3000/api/v1/routes')
      const routes = await res.json()
      this.set({ routes })
    },

    components: {
      // Route,
      // LangSelector
    }
  }
</script>
