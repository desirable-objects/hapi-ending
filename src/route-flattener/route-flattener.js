'use strict'

const dot = require('dot-object')
const { transform } = require('reorient')
const examples = require('../payload-example')

function transformRouteSettings (settings) {
  const schema = {
    tags: 'tags',
    description: 'description',
    notes: 'notes'
  }

  const endpoint = transform(settings, schema)
  return Object.assign({ validation: {} }, endpoint)
}

function getExample (items, key) {
  return (items[key].valid && items[key].valid.length > 1) ? items[key].valid[0] : items[key].example
}

function isIterable (obj) {
  if (obj == null) {
    return false
  }
  return obj[Symbol.iterator] !== undefined
}

class RouteFlattener {
  flattenEntry (entry) {
    const endpoint = transformRouteSettings(entry.settings)

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

        this.recursivelyAbsorb(entry.settings.validate[validationType]._inner.children, null, endpoint.validation[validationType].elements)

        let items = endpoint.validation[validationType].elements

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

  recursivelyAbsorb (children, parentKey, master) {
    if (!isIterable(children)) { return }

    for (let param of children) {
      const key = `${parentKey ? parentKey + '.' : ''}${param.key}`

      function extractValidParams (data) {
        const valids = data._valids
        const isSet = valids && valids._set
        const items = isSet ? Array.from(valids._set) : []
        return items.length > 0 ? items : undefined
      }

      const schema = {
        type: '_type',
        valid: extractValidParams,
        description: '_description'
      }

      master[key] = transform(param.schema, schema)

      if (param.schema._type === 'object') {
        this.recursivelyAbsorb(param.schema._inner.children, key, master)
      } else {
        const { type } = master[key]
        master[key].example = examples[type] || `<${type}>`
      }
    }
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
