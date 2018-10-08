'use strict'

const { expect } = require('code')
const { parse } = require('.')

describe('attribute-parser', () => {
  context('Not iterable', () => {
    it('returns', () => {
      expect(
        parse(null)
      ).to.equal()
    })
  })

  context('parses validation schema', () => {
    const children = [
      {
        key: 'key',
        schema: {
          _type: 'string',
          _valids: {},
          _description: 'description'
        }
      },
      {
        key: 'key2',
        schema: {
          _type: 'randomtype',
          _valids: {},
          _description: 'description2'
        }
      },
      {
        key: 'key3',
        schema: {
          _type: 'string',
          _valids: {
            _set: new Set(['foo', 'bar'])
          },
          _description: 'description3'
        }
      }
    ]
    const parentKey = 'parent'
    const master = {}
    const expectedKey = 'parent.key'

    beforeEach(() => {
      parse(children, parentKey, master)
    })

    it('augments master', () => {
      expect(master).to.include(expectedKey)
    })

    it('maps type', () => {
      expect(master[expectedKey].type).to.equal('string')
    })

    it('maps description', () => {
      expect(master[expectedKey].description).to.equal('description')
    })

    it('maps example', () => {
      expect(master[expectedKey].example).to.equal('qux')
    })

    it('maps example', () => {
      expect(master[`${expectedKey}2`].example).to.equal('<randomtype>')
    })

    it('maps valids', () => {
      expect(
        master[`${expectedKey}3`].valid
      ).to.equal([ 'foo', 'bar' ])
    })
  })

  context('no parent key', () => {
    const children = [
      {
        key: 'key',
        schema: {
          _type: 'string',
          _valids: {},
          _description: 'description'
        }
      }
    ]
    const parentKey = null
    const master = {}
    const expectedKey = 'key'

    beforeEach(() => {
      parse(children, parentKey, master)
    })

    it('augments master', () => {
      expect(master).to.include(expectedKey)
    })
  })

  context('nested validation', () => {
    const children = [
      {
        key: 'key',
        schema: {
          _type: 'object',
          _valids: {},
          _description: 'description',
          _inner: {
            children: [
              {
                key: 'nested-key',
                schema: {
                  _type: 'number',
                  _valids: {},
                  _description: 'nested-description'
                }
              }
            ]
          }
        }
      }
    ]
    const parentKey = 'parent'
    const master = {}
    const expectedKey = 'parent.key.nested-key'

    beforeEach(() => {
      parse(children, parentKey, master)
    })

    it('augments master', () => {
      expect(master).to.include(expectedKey)
    })

    it('maps type', () => {
      expect(master[expectedKey].type).to.equal('number')
    })

    it('maps description', () => {
      expect(master[expectedKey].description).to.equal('nested-description')
    })

    it('maps example', () => {
      expect(master[expectedKey].example).to.equal(123)
    })
  })
})
