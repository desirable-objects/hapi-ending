'use strict'

const { join } = require('path')
const Inert = require('inert')
const Vision = require('vision')
const handlebars = require('handlebars')
const pkg = require('../package.json')
const { flatten } = require('./route-flattener')

exports.register = async function (server, options) {
  if (!options.enabled) {
    return
  }

  server.path(join(__dirname, '.'))

  try {
    await server.register([
      Inert,
      Vision
    ])
  } catch (err) {
    if (err) {
      console.error('Failed to register plugin dependencies:', err)
    }
  }

  const views = {
    engines: {
      handlebars
    },
    path: './views',
    helpersPath: './helpers'
  }

  server.views(views)

  function routing (svr, options) {
    let assetsPath = options.assetsPath || 'assets'

    let allRoutes = server.table()

    return {
      routes: flatten(allRoutes),
      baseUrl: options.baseUrl,
      assetsPath,
      logoUrl: options.logoUrl || `/${assetsPath}/img/hapi-logo.svg`,
      documentationUrl: options.path || ''
    }
  }

  server.method('routing', routing, {
    generateKey: () => {
      return 'routing'
    },
    cache: { expiresIn: 60000, generateTimeout: 30000 }
  })

  server.route({
    method: 'GET',
    path: `${options.path || ''}/${options.assetsPath || 'assets'}/{param*}`,
    config: {
      auth: false,
      description: 'Asset delivery url for hapi-ending plugin',
      tags: ['metadata', 'private', 'api', 'assets']
    },
    handler: {
      directory: {
        path: './public',
        listing: true
      }
    }
  })

  server.route({
    method: 'GET',
    path: options.path || '/',
    config: {
      auth: false,
      description: 'Describes endpoints in your application',
      tags: ['metadata', 'private', 'api']
    },
    handler: async function (request, h) {
      let model = await request.server.methods.routing(request.server, options)
      return h.view('root', model)
    }
  })
}

exports.name = 'hapi-ending'
exports.pkg = pkg
