### Hapi Ending

Lists routes, parameters, and validation constraints for HAPI.

## Plugin status

[![Build Status](https://travis-ci.org/desirable-objects/hapi-ending.svg)](https://travis-ci.org/desirable-objects/hapi-ending)

## Configuration

    Currently you can configure the baseUrl which is useful if you want to copy and paste urls, and whether the plugin is enabled or not. Disabling the plugin is highly advised for production environments.

    var whatamiConfig = {
        baseUrl: 'http://your.domain:1234' // defaults to protocol-less server host+port,
        enabled: true // defaults to false
    }

## Usage

Install the plugin in the standard way:

    server.pack.register([
        {
            plugin: require('hapi-ending'),
            whatamiConfig
        }
    ], function pluginsRegistered(err) {
        ...
    }

### Describing endpoints

You can add a description to routes using the parameters 'description', 'tags', and 'notes' as follows:

    {
        method: 'GET',
        path: '/you/{foo}/name/{baz}',
        config: {
            description: "Describe your endpoint here",
            tags: ['foo', 'authenticated', 'any tag']
            validate: {
                params: {
                    foo: Joi.number().describe('It should more than likely be a number'),
                    baz: Joi.string().describe('Some string thing goes here')
                }
            },
            notes: [
                'This is just a note',
                "?foo This describes the 'foo' parameter and possible usages",
                "?bar This describes the 'bar' parameter",
            ]
        },
        handler: function(request, reply) {
            ...
        }
    };

Query string definitions should be placed as notes array entries, and start with ?<parameterName> since HAPI doesn't allow specification of them otherwise.
