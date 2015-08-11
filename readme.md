### Hapi Ending

Lists routes, parameters, and validation constraints for HAPI version 8.

## Plugin status

[![Build Status](https://travis-ci.org/desirable-objects/hapi-ending.svg)](https://travis-ci.org/desirable-objects/hapi-ending)

## What it looks like

<img src="https://raw.githubusercontent.com/desirable-objects/hapi-ending/master/screenshot.png" style="width: 90%" alt="Hapi Ending" title="Hapi Ending" />

## Configuration

    Currently you can configure the baseUrl which is useful if you want to copy and paste urls, and whether the plugin is enabled or not. Disabling the plugin is highly advised for production environments.

    var whatamiConfig = {
        baseUrl: 'http://your.domain:1234' // defaults to protocol-less server host+port,
        enabled: true // defaults to false
    }

## Live Demo

To run a quick local demo, use the npm target 'demo':

```npm run demo```

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

```
    {
        method: 'GET',
        path: '/you/{foo}/name/{baz}',
        config: {
            description: "Describe your endpoint here",
            tags: ['foo', 'authenticated', 'any tag']
            validate: {
		query: {
		    a: Joi.number().describe('This is where you put the number of As'),
		    now: Joi.boolean().describe('Whether I should do it now or later');
		},
                params: {
                    foo: Joi.number().describe('It should more than likely be a number'),
                    baz: Joi.string().describe('Some string thing goes here')
                }
            },
            notes: [
                'This is just a note',
            ]
        },
        handler: function(request, reply) {
            ...
        }
    };
```

### Private endpoints

Adding 'private' to any endpoint's tags will make the endpoint private (i.e. unlisted by the plugin)
