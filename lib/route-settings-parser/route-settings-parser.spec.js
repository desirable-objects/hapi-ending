'use strict'

const { expect } = require('code')
const { parse } = require('.')

describe('route-settings-parser', () => {
  const original = {
    other: 'xxx',
    settings: 'settings',
    description: 'description',
    notes: 'notes'
  }

  it('extracts required values', () => {
    expect(
      parse(original)
    ).to.equal({
      settings: 'settings',
      description: 'description',
      notes: 'notes',
      validation: {}
    })
  })
})
