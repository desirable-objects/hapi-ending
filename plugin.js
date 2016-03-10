'use strict';

var sf = require('sf');
var Path = require('path');
var _ = require('lodash');

let routeFlattener = require('./src/route-flattener');

exports.register = function (plugin, options, next) {

    if (!options.enabled) {
        return next();
    }

    plugin.path(Path.join(__dirname, '.'));

    plugin.register([
      require('vision'),
      require('inert')
    ], (err) => {
        if (err) {
            console.error('Failed to load plugin:', err);
        }
    });

    var views = {
        engines: {
            handlebars: require('handlebars')
        },
        path: './src/views',
        helpersPath: './src/helpers'
    };

    plugin.views(views);

    function routing(svr, options, next) {

        let assetsPath = options.assetsPath || 'assets',
            allRoutes = routeFlattener.fetchRoutes(svr);

        return next(null, {
          routes: routeFlattener.flatten(allRoutes),
          baseUrl: options.baseUrl,
          assetsPath,
          logoUrl: options.logoUrl || `/${assetsPath}/img/hapi-logo.svg`,
          documentationUrl: options.path || ''
        });
    }

    plugin.method('routing', routing, { generateKey: () => { return 'routing' }, cache: { expiresIn: 60000, generateTimeout: 30000 } });

    plugin.route({
        method: 'GET',
        path: `${options.path || ''}/${options.assetsPath || 'assets'}/{param*}`,
        config: {
          auth: false,
          description: "Asset delivery url for hapi-ending plugin",
          tags: ['metadata', 'private', 'api', 'assets']
        },
        handler: {
            directory: {
                path: './src/public',
                listing: true
            }
        }
    });

    plugin.route({
        method: 'GET',
        path: options.path || '/',
        config: {
            auth: false,
            description: "Describes endpoints in your application",
            tags: ['metadata', 'private', 'api']
        },
        handler: function(request, reply) {
          request.server.methods.routing(request.server, options, (err, model) => {
            return reply.view('root', model);
          });
        }
    });

    next();
};

exports.register.attributes = {
  pkg: require('./package.json')
};
