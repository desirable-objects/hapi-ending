'use strict'

const { transform } = require('reorient')

function parse (settings) {
  const schema = {
    tags: 'tags',
    description: 'description',
    notes: 'notes'
  }

  const endpoint = transform(settings, schema)
  return Object.assign({ validation: {} }, endpoint)
}

exports.parse = parse
