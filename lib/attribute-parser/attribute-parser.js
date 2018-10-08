'use strict'

const { transform } = require('reorient')
const examples = require('../payload-example')

function isIterable (obj) {
  if (obj == null) {
    return false
  }
  return obj[Symbol.iterator] !== undefined
}

function extractValidParams (data) {
  const valids = data._valids
  const isSet = valids && valids._set
  const items = isSet ? Array.from(valids._set) : []
  return items.length > 0 ? items : undefined
}

function parse (children, parentKey, master) {
  if (!isIterable(children)) { return }

  for (let param of children) {
    const key = `${parentKey ? parentKey + '.' : ''}${param.key}`

    const schema = {
      type: '_type',
      valid: extractValidParams,
      description: '_description'
    }

    master[key] = transform(param.schema, schema)

    if (param.schema._type === 'object') {
      parse(param.schema._inner.children, key, master)
    } else {
      const { type } = master[key]
      master[key].example = examples[type] || `<${type}>`
    }
  }
}

exports.parse = parse
