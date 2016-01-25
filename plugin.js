'use strict';

var sf = require('sf');
var Path = require('path');
var _ = require('lodash');

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

    function calculateRoutingTable(request, reply) {

        var tables = _.mapValues(request.server.table(), 'table');
        var allRoutes = [];

        var i = 0;
        _.each(tables, function(table) {
          _.merge(allRoutes, table);
        });

        var routes = _.mapValues(allRoutes, 'public');

        var publicRoutes = _.reject(routes, function(route) {
          return route.settings.tags ? (route.settings.tags.indexOf('private') > -1) : false;
        });

        var categorised = _.groupBy(publicRoutes, function(route) { return route.method; });

        _.each(publicRoutes, function(route, i) {

            route.fullQuery = route.path;

            if (route.settings.validate.query) {

                var query = _.map(route.settings.validate.query._inner.children, function(child) {
                    return sf('{key}=<{schema._type}>', child);
                });
                route.fullQuery += sf('?{queryString}', { queryString: query.join('&') });
            }

            if (route.settings.validate.payload) {

              var examples = {
                string: 'qux',
                number: 123,
                array: ['foo', 'bar', 'baz'],
                object: {foo: 'bar'}
              }

              route.jsonPayload = {};
              for (var child of route.settings.validate.payload._inner.children) {
                route.jsonPayload[child.key] = examples[child.schema._type];
              }

            }

        });

        reply({
          categorised: categorised,
          routes: publicRoutes,
          baseUrl: options.baseUrl,
          assetsPath: options.assetsPath,
          logoUrl: options.logoUrl || `/${options.assetsPath || 'assets'}/img/hapi-logo.svg`,
          documentationUrl: options.path || ''
        });
    }

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
            pre: [
                { assign: 'model', method: calculateRoutingTable }
            ],
            description: "Describes endpoints in your application",
            tags: ['metadata', 'private', 'api']
        },
        handler: function(request, reply) {
            return reply.view('root', request.pre.model);
        }
    });

    next();
};

exports.register.attributes = {
  pkg: require('./package.json')
};
