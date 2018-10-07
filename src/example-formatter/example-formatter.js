'use strict'

const dot = require('dot-object')

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

module.exports = function (type, items, entry) {
  return exampleFormats[type](items, entry)
}
