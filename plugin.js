'use strict';

var sf = require('sf');
var Path = require('path');
var _ = require('lodash-node');

exports.register = function (plugin, options, next) {

    if (!options.enabled) {
        return next();
    }

    plugin.path(Path.join(__dirname, '.'));

    var views = {
        engines: {
            handlebars: require('handlebars')
        },
        path: './src/views',
        helpersPath: './src/helpers'
    };

    plugin.views(views);

    function calculateRoutingTable(request, reply) {
        var routes = _.pluck(request.server.table()[0].table, 'public');
        var categorised = _.groupBy(routes, function(route) { return route.method; });

        _.each(routes, function(route, i) {
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

              var data = _.map(route.settings.validate.payload._inner.children, function(child) {
                  return sf('{key}={example}', {key: child.key, example: examples[child.schema._type]});
              });
              route.jsonPayload = data.join('&');

            }

        });

        reply({
          categorised: categorised,
          routes: routes,
          baseUrl: options.baseUrl,
          logoUrl: options.logoUrl || '/assets/img/hapi-logo.svg'});
    }

    plugin.route({
        method: 'GET',
        path: (options.path || '') + '/assets/{param*}',
        description: "Asset delivery url for hapi-ending plugin",
        tags: ['metadata', 'private', 'api', 'assets'],
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

exports.register.attributes = { pkg: require('./package.json') };
