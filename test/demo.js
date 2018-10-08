'use strict'

const Hapi = require('hapi')

const server = Hapi.server({
  host: 'localhost',
  port: 3000
})

server.register([{
  plugin: require('../plugin'),
  options: { enabled: true }
}]).then(async () => {
  server.route(require('./routes/example.js'))

  await server.start()

  console.log(`Server running at: ${server.info.uri}`)
}).catch(err => {
  console.log('Failed to register the plugin:', err)
  process.exit(1)
})
