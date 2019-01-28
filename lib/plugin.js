'use strict'

const { join } = require('path')
const Inert = require('inert')
const pkg = require('../package.json')
const { flatten } = require('./route-flattener')

exports.register = async function (server, options) {
  if (!options.enabled) {
    return
  }

  server.path(join(__dirname, '.'))

  try {
    await server.register([
      Inert
    ])
  } catch (err) {
    if (err) {
      console.error('Failed to register plugin dependencies:', err)
    }
  }

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
    path: `${options.path || ''}/{param*}`,
    config: {
      auth: false,
      description: 'Asset delivery url for hapi-ending plugin',
      tags: ['metadata', 'private', 'api', 'assets']
    },
    handler: {
      directory: {
        path: '../dist/',
        listing: true
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/api/v1/routes',
    config: {
      auth: false,
      description: 'Api for describing endpoints in your application',
      tags: ['metadata', 'private', 'api']
    },
    handler: async function (request, h) {
      return request.server.methods.routing(request.server, options)
    }
  })
}

exports.name = 'hapi-ending'
exports.pkg = pkg
