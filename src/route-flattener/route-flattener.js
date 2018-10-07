'use strict'

const dot = require('dot-object')
const routeSettingsParser = require('../route-settings-parser')
const attributeParser = require('../attribute-parser')

function getExample (items, key) {
  return (items[key].valid && items[key].valid.length > 1) ? items[key].valid[0] : items[key].example
}

const exampleFormats = {
  query: function (items) {
    return Object.keys(items).map((key) => {
      return `${key}=${getExample(items, key)}`
    }).join('&')
  },
  payload: function (items) {
    const mapping = Object.keys(items).reduce((acc, key) => {
      acc[key] = getExample(items, key)
      return acc
    }, {})
    return dot.object(mapping)
  },
  params: function (items, entry) {
    return Object.keys(items).reduce((acc, key) => {
      return acc.replace('{' + key + '}', getExample(items, key))
    }, entry.path)
  }
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

        const validation = {
          humanName: validationTypes[validationType],
          elements: {}
        }

        attributeParser.parse(
          entry.settings.validate[validationType]._inner.children,
          null,
          validation.elements
        )

        validation.example = exampleFormats[validationType](validation.elements, entry)

        endpoint.validation[validationType] = validation
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
