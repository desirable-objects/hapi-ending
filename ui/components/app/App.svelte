<svelte:head>
	<link href='https://fonts.googleapis.com/css?family=Open+Sans:400,300,600,700&subset=latin,cyrillic' rel='stylesheet' type='text/css'>
</svelte:head>
<header>
	<div class="container">
		<div class="row">
			<div class="col-lg-2 col-xs-12 left">
				<div id="logo">
					<img src="{logo}" alt="vdoc">
				</div>
			</div>
			<div class="col-lg-8 col-md-7 col-xs-12">
				<div class="slogan">
					Hapi Ending
				</div>
			</div>
			<div class="col-lg-2 col-md-3 col-xs-12 right">
				<a class="btn" href="http://www.github.com/beyonk-adventures/">Github</a>
			</div>
		</div>
	</div>
</header>
<section class="content">
	<div class="container">
		<div class="content-wrap">
			<div class="row">
				<aside>
					<div class="menu-box routes">
						<h4>Routes</h4>	
						<nav>
							<ul>
                {#each Object.entries(routes) as [ path, methods ] (path)}
								<li><a href="#about" on:click="navigate('about')" class:current="page === 'about'">{path}</a></li>
                <ul>
                  {#each Object.entries(methods) as [ method, metadata ] (method)}
                  <li>
                    <a href="#about" on:click="navigate('about')" class:current="page === 'about'">
                    <span class="tag {method}">{method}</span>
                    {path}
                    </a>
                  </li>
                  {/each}
							  </ul>
                {/each}
							</ul>					
						</nav>
					</div>
				</aside>
				<div class="content-info">
          {#each Object.entries(routes) as [ path, methods ] (path)}
            {#each Object.entries(methods) as [ method, metadata ] (method)}
            <div class="section-txt" id="about">
              <div>
                <h3>{method} {path}</h3>
                <p>{metadata.description || '(no description set)'}</p>
                <div>
                  {#if metadata.tags}
                    {#each metadata.tags as tag (tag)}
                      <span class="tag generic">{tag}</span>
                    {/each}
                  {/if}
                </div>
              </div>
              {#each Object.entries(metadata.validation) as [ type, options ] (type)}
                {#if options.elements}
                <h4>{options.humanName}</h4>
                <Table elements="{options.elements}" />
                {/if}
              {/each}

              <Tabs>
                <div slot="browser">
                  <Fetch {method} query={metadata.validation.query} params={metadata.validation.params} payload={metadata.validation.payload} />
                </div>
                <div slot="node">
                  <Got {method} query={metadata.validation.query} params={metadata.validation.params} payload={metadata.validation.payload} />
                </div>
                <div slot="curl">
                  <Curl {method} query={metadata.validation.query} params={metadata.validation.params} payload={metadata.validation.payload} />
                </div>
              </Tabs>
            </div>
            {/each}
          {/each}
			</div>
		</div>
	</div>
</section>
<div class="footer-area">
	<div class="container">
		<div class="row">
			<div class="col-lg-12 center">
				Powered by Hapi Ending
			</div>
		</div>
	</div>
</div>
<footer>
	<div class="container">
		<div class="row">
			<div class="col-lg-12 center">
				© 2018 Antony Jones. All rights reserved.
			</div>
		</div>
	</div>
</footer>

<style>
  .routes nav > ul {
    font-weight: bold;
  }

  .section-txt > div {
    margin-bottom: 24px;
  }

  ul > ul {
    font-weight: normal;
  }

  .tag.post {
    background-color: red;
    color: white;
  }

  .tag.put {
    background-color: yellow;
  }

  .tag.get {
    background-color: green;
    color: white;
  }

  .tag.delete {
    background-color: black;
    color: white;
  }

  .tag.generic {
    background-color: grey;
    color: white;
  }

  .tag {
    border-radius: 2px;
    font-weight: bold;
    padding: 4px 6px;
    margin-right: 4px;
    background-color: white;
    color: grey;
  }
</style>

<script>
  import './normalize.css'
  import './prettify.css'
  import './style.css'

  import logo from './hapi-logo.svg'

  export default {
    data () {
      return {
        logo,
        page: 'about',
        routes: {}
      }
    },

    methods: {
      navigate (page) {
        this.set({ page })
      }
    },

    async oncreate () {
      const response = await fetch('/api/v1/routes')
      const { routes } = await response.json()
      this.set({ routes })
    },

    components: {
      Table: '../table/Table.svelte',
      Curl: '../curl/Curl.svelte',
      Tabs: '../tabs/Tabs.svelte',
      Got: '../got/Got.svelte',
      Fetch: '../fetch/Fetch.svelte',
    }
  }
</script>