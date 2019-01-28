<h4>Got example</h4>
<pre>
{@html code}
</pre>

<style>
  pre {
    background-color: white;
  }
</style>

<script>
  import Prism from 'prismjs'
  import 'prismjs/themes/prism'
  import parseExample from '../../lib/example-parser'

  export default {
    computed: {
      searchParams ({ query }) {
        if (!query) { return '' }
        const example = parseExample(query)
        return query ? `const searchParams = new URLSearchParams(${JSON.stringify(example, null, 2)})\n\n` : ''
      },

      options ({ method, payload }) {
        const options = {
          method
        }

        if (payload) {
          options['body'] = parseExample(payload)
        }

        return JSON.stringify(options, null, 2)
      },

      code ({ searchParams, options }) {
        const code = `
const got = require('got')

${searchParams}const json = await got(params.path, ${options})
        `
        return Prism.highlight(code, Prism.languages.javascript, 'javascript')
      }
    },
  }
</script>