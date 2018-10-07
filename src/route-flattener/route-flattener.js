'use strict'

const dot = require('dot-object')
const routeSettingsParser = require('../route-settings-parser')
const attributeParser = require('../attribute-parser')

function getExample (items, key) {
  return (items[key].valid && items[key].valid.length > 1) ? items[key].valid[0] : items[key].example
}

class RouteFlattener {
  flattenEntry (entry) {
    const endpoint = routeSettingsParser.parse(entry.settings)

    const validationTypes = {
      query: 'Query String',
      params: 'URI Components',
      payload: 'JSON Payload'
    }

    for (let validationType of Object.keys(validationTypes)) {
      if (entry.settings.validate[validationType]) {
        endpoint.validation[validationType] = {
          humanName: validationTypes[validationType],
          elements: {}
        }

        attributeParser.parse(
          entry.settings.validate[validationType]._inner.children,
          null,
          endpoint.validation[validationType].elements
        )

        const items = endpoint.validation[validationType].elements

        let example

        switch (validationType) {
          case 'query':
            example = Object.keys(items).map((key) => {
              return `${key}=${getExample(items, key)}`
            }).join('&')
            break
          case 'payload':
            let mapping = {}
            for (let key of Object.keys(items)) {
              mapping[key] = getExample(items, key)
            }
            example = dot.object(mapping)
            break
          case 'params':
            example = entry.path
            for (let key of Object.keys(items)) {
              example = example.replace('{' + key + '}', getExample(items, key))
            }
            break
        }

        endpoint.validation[validationType].example = example
      }
    }

    return endpoint
  }

  flatten (table) {
    let routing = {}

    for (let endpoint of table) {
      let plc = endpoint.public
      if (!plc.settings.tags || plc.settings.tags.indexOf('private') === -1) {
        routing[plc.path] = routing[plc.path] || {}
        try {
          routing[plc.path][plc.method] = this.flattenEntry(plc)
        } catch (e) {
          console.error(e, e.stack)
        }
        routing[plc.path][plc.method].validation.params = routing[plc.path][plc.method].validation.params || { example: plc.path }
      }
    }

    return routing
  }
}

module.exports = new RouteFlattener()
