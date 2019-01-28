<h4>Curl example</h4>
<pre>
{@html code}
</pre>

<script>
  import Prism from 'prismjs'
  import 'prismjs/themes/prism'

  export default {
    computed: {
      data ({ payload }) {
        if (!payload) { return '' }
        const { elements, example } = payload

        return Object.keys(elements).reduce((curr, name) => {
          curr.push(`${name}=${example[name]}`)
          return curr
        }, []).join('&')
      },

      url ({ query, params }) {
        let qp = ''
        if (query) {
          const { elements, example } = query
          qp = '?' + Object.keys(elements).reduce((curr, name) => {
            curr.push(`${name}=${elements[name].example}`)
            return curr
          }, []).join('&')
        }

        const { example: path } = params

        return `${path}${qp || ''}`
      },

      code ({ method, data, url }) {
        const code = `curl -X ${method} ${data} ${url}`
        //return Prism.highlight(code, Prism.languages.bash, 'bash')
        return code
      }
    }
  }
</script>