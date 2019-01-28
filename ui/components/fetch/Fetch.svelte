<h4>Fetch example</h4>
<pre>
{@html code}
</pre>

<script>
  import Prism from 'prismjs'
  import 'prismjs/themes/prism'
  import parseExample from '../../lib/example-parser'

  export default {
    computed: {
      searchParams ({ query }) {
        if (!query) { return null }
        const example = parseExample(query)
        return `const searchParams = new URLSearchParams(${JSON.stringify(example, null, 2)})\n\n`
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
        let code = [
          ... searchParams ? [ searchParams ] : [],
          `const res = await fetch(params.path, ${options})`,
          `const json = await res.json()`
        ]

        return Prism.highlight(code.join('\n'), Prism.languages.javascript, 'javascript')
      }
    }
  }
</script>