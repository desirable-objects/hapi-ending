### Hapi Ending

Lists routes, parameters, and validation constraints for HAPI version 17.x.

[![CircleCI](https://circleci.com/gh/desirable-objects/hapi-ending.svg?style=shield)](https://circleci.com/gh/desirable-objects/hapi-ending) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Thanks

Original plugin by [Antony Jones](https://github.com/antony/), updated for Hapi v17+ by [Yulia Tenincheva](https://github.com/Y-LyN-10)

* For HapiJS < v17, use branch hapi-pre-v17 or npm tag 0.9.2
* For HapiJS > v17, use master, or npm tag > ^1.0.0

## What it looks like

<img src="https://raw.githubusercontent.com/desirable-objects/hapi-ending/master/screenshot.png" style="width: 90%" alt="Hapi Ending" title="Hapi Ending" />

## Configuration

    Currently you can configure the baseUrl which is useful if you want to copy and paste urls, and whether the plugin is enabled or not. Disabling the plugin is highly advised for production environments.

    var options = {
        baseUrl: 'http://your.domain:1234' // defaults to protocol-less server host+port,
        enabled: true // defaults to false,
        assetsPath: '/mount-point-for-plugin-assets' // defaults to 'assets' - change if this conflicts with your own routes,
        logoUrl: 'http://example.net/logo.webp'
    }

## Live Demo

To run a quick local demo, use the npm target 'demo':

```npm run demo```

## Usage

Install the plugin in the standard way:

    server.register([
        {
            plugin: require('hapi-ending'),
            options: options
        }
    ], (err) => {
        ...
    }

### Describing endpoints

You can add a description to routes using the parameters 'description', 'tags', and 'notes' as follows:

```
    {
        method: 'GET',
        path: '/you/{foo}/name/{baz}',
        options: {
            description: "Describe your endpoint here",
            tags: ['foo', 'authenticated', 'any tag']
            validate: {
                query: {
                    a: Joi.number().describe('This is where you put the number of As'),
                    now: Joi.boolean().describe('Whether I should do it now or later')
                },
                params: {
                    foo: Joi.number().describe('It should more than likely be a number'),
                    baz: Joi.string().describe('Some string thing goes here')
                }
            },
            notes: [
                'This is just a note'
            ]
        },
        handler: function(request, h) {
            ...
        }
    }
```

### Private endpoints

Adding 'private' to any endpoint's tags will make the endpoint private (i.e. unlisted by the plugin)
