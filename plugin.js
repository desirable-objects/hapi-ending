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
        path: './src/views'
    };

    plugin.views(views);

    plugin.route({
        method: 'GET',
        path: options.path || '/',
        config: {
            description: "Describes endpoint",
            tags: ['metadata']
        },
        handler: function(request, reply) {

            var routes = request.server.routingTable ? request.server.routingTable() : request.server.table();
            var categorised = _.groupBy(routes, function(route) { return route.settings.method; });

            _.each(routes, function(route) {
                route.settings.fullQuery = route.settings.path;

                if (route.settings.validate.query) {
                    var query = _.map(route.settings.validate.query._inner.children, function(child) {
                        return sf('{key}=<{schema._type}>', child);
                    });
                    route.settings.fullQuery += sf('?{queryString}', { queryString: query.join('&') });
                }
            });

            return reply.view('root', {
                categorised: categorised,
                routes: routes,
                baseUrl: options.baseUrl || sf('//{_host}:{_port}', routes[0].server)
            });
        }
    });

    next();
};

exports.register.attributes = { pkg: require('./package.json') };
