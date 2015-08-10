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
        });

        reply({categorised: categorised, routes: routes, baseUrl: options.baseUrl});
    }

    plugin.route({
        method: 'GET',
        path: '/assets/{param*}',
        handler: {
            directory: {
                path: 'src/public'
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
