'use strict'

const { expect } = require('code')
const format = require('.')

describe('example-formatter', () => {
  const items = {
    foo: {
      example: 'bar'
    },
    baz: {
      example: 'qux'
    },
    quux: {
      valid: ['zug', 'zif'],
      example: 'fee'
    }
  }

  context('query', () => {
    it('creates example', () => {
      expect(
        format('query', items)
      ).to.equal(
        'foo=bar&baz=qux&quux=zug'
      )
    })
  })

  context('params', () => {
    it('creates example', () => {
      const entry = {
        path: '/some/{foo}/path/{baz}/{quux}'
      }

      expect(
        format('params', items, entry)
      ).to.equal(
        '/some/bar/path/qux/zug'
      )
    })
  })

  context('payload', () => {
    it('creates example', () => {
      expect(
        format('payload', items)
      ).to.equal({
        foo: 'bar',
        baz: 'qux',
        quux: 'zug'
      })
    })

    it('creates nested example', () => {
      const nested = {
        'foo.whee': {
          example: 'lux'
        }
      }

      expect(
        format('payload', nested)
      ).to.equal({
        foo: {
          whee: 'lux'
        }
      })
    })
  })
})
