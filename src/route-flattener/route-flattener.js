'use strict'

const routeSettingsParser = require('../route-settings-parser')
const attributeParser = require('../attribute-parser')
const exampleFormatter = require('../example-formatter')

function flattenEntry (entry) {
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

      validation.example = exampleFormatter(validationType, validation.elements, entry)
      endpoint.validation[validationType] = validation
    }
  }

  return endpoint
}

function flatten (table) {
  let routing = {}

  for (let endpoint of table) {
    let plc = endpoint.public
    if (!plc.settings.tags || plc.settings.tags.indexOf('private') === -1) {
      routing[plc.path] = routing[plc.path] || {}
      try {
        routing[plc.path][plc.method] = flattenEntry(plc)
      } catch (e) {
        console.error(e, e.stack)
      }
      routing[plc.path][plc.method].validation.params = routing[plc.path][plc.method].validation.params || { example: plc.path }
    }
  }

  return routing
}

exports.flatten = flatten
