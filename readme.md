### WhatAmI plugin

Lists routes, parameters, and validation constraints for HAPI.

Currently in a PROTOTYPE stage - hence the lack of tests, but good for development.

## Configuration

    var whatamiConfig = {
        baseUrl: 'http://your.domain:1234' // defaults to protocol-less server host+port,
        enabled: true // defaults to false
    }

## Usage

Install the plugin in the standard way:

    server.pack.register([
        {
            plugin: require('plugin-tsl-whatami'),
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
