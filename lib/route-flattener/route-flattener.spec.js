'use strict'

const { expect } = require('code')
const flattener = require('.')

function buildPrivateRoute () {
  return {
    settings: {
      tags: ['private']
    }
  }
}

function buildRoute (method, validationType, description) {
  const validate = {}
  validate[validationType] = {
    _inner: {
      children: [
        {
          key: 'items',
          schema: {
            _type: 'string',
            _description: description,
            _valids: {
              _set: ['four', 'five']
            }
          }
        }
      ]
    }
  }

  return {
    path: '/counter',
    method: method,
    settings: {
      tags: ['one', 'two'],
      description: 'One Two',
      notes: ['Counts Numbers'],
      validate
    }
  }
}

describe('route-flattener', () => {
  it('Flattens a single route', () => {
    const singleRouteWithQuery = buildRoute('get', 'query', 'Thing the stuff')

    const output = {
      tags: ['one', 'two'],
      description: 'One Two',
      notes: ['Counts Numbers'],
      validation: {
        query: {
          elements: {
            items: {
              type: 'string',
              valid: ['four', 'five'],
              description: 'Thing the stuff'
            }
          }
        }
      }
    }

    const flat = flattener.flattenEntry(singleRouteWithQuery)
    expect(flat.toString().includes(output.toString())).to.be.true()
  })

  context('with query', () => {
    const singleRouteWithQuery = buildRoute('get', 'query')

    const output = {
      tags: ['one', 'two'],
      description: 'One Two',
      notes: ['Counts Numbers'],
      validation: {
        query: {
          example: 'items=four',
          elements: {
            items: {
              type: 'string',
              valid: ['four', 'five']
            }
          }
        }
      }
    }

    const flat = flattener.flattenEntry(singleRouteWithQuery)

    it('has validation', () => {
      expect(flat.validation).not.to.be.undefined()
    })

    it('has validation query', () => {
      expect(flat.validation.query).not.to.be.undefined()
    })

    it('has validation query example', () => {
      expect(flat.validation.query.example).not.to.be.undefined()
    })

    it('includes the validation query example in its output', () => {
      expect(
        flat.validation.query.example.toString()
      ).to.include(
        output.validation.query.example.toString()
      )
    })
  })

  context('Provides payload example', () => {
    const singleRouteWithQuery = buildRoute('get', 'payload')

    const output = {
      tags: ['one', 'two'],
      description: 'One Two',
      notes: ['Counts Numbers'],
      validation: {
        payload: {
          example: { items: 'four' },
          elements: {
            items: {
              type: 'string',
              valid: ['four', 'five']
            }
          }
        }
      }
    }

    const flat = flattener.flattenEntry(singleRouteWithQuery)

    it('has validation', () => {
      expect(flat.validation).not.to.be.undefined()
    })

    it('has validation payload', () => {
      expect(flat.validation.payload).not.to.be.undefined()
    })

    it('has validation payload example', () => {
      expect(flat.validation.payload.example).not.to.be.undefined()
    })

    it('includes the validation payload example in its output', () => {
      expect(
        flat.validation.payload.example.toString()
      ).to.include(
        output.validation.payload.example.toString()
      )
    })
  })

  context('Grouping', () => {
    const tables = [
      { public: buildRoute('get', 'query') },
      { public: buildRoute('post', 'query') },
      { public: buildRoute('put', 'query') }
    ]

    const flat = flattener.flatten(tables)

    it('has flattened object', () => {
      expect(Object.keys(flat)).to.have.length(1)
    })

    it('has three grouped methods', () => {
      expect(Object.keys(flat['/counter'])).to.have.length(3)
    })
  })

  it('Ignores private routes', () => {
    const table = [
      { public: buildRoute('get', 'query') },
      { public: buildPrivateRoute() }
    ]

    const routes = flattener.flatten(table)

    expect(Object.keys(routes)).to.have.length(1)
  })

  it('Flattens nested validators', () => {
    const depth = {
      path: '/nester',
      method: 'put',
      settings: {
        tags: ['one', 'two'],
        description: 'One Two',
        notes: ['Counts Numbers'],
        validate: {
          payload: {
            _inner: {
              children: [{
                key: 'one',
                schema: {
                  _type: 'object',
                  _valids: {},
                  _description: null,
                  _inner: {
                    children: [
                      {
                        key: 'two',
                        schema: {
                          _type: 'object',
                          _valids: {},
                          _description: null,
                          _inner: {
                            children: [
                              {
                                key: 'three',
                                schema: {
                                  _type: 'string',
                                  _description: null,
                                  _valids: {},
                                  _inner: {}
                                }
                              }
                            ]
                          }
                        }
                      },
                      {
                        key: 'extra',
                        schema: {
                          _type: 'number',
                          _valids: {},
                          _description: null
                        }
                      }
                    ]
                  }
                }
              }
              ]
            }
          }
        }
      }
    }

    const output = {
      tags: ['one', 'two'],
      description: 'One Two',
      notes: ['Counts Numbers'],
      validation: {
        payload: {
          elements: {
            one: {
              type: 'object'
            },
            'one.two': {
              type: 'object'
            },
            'one.extra': {
              type: 'number'
            },
            'one.two.three': {
              type: 'string'
            }
          }
        }
      }
    }

    const flat = flattener.flattenEntry(depth)

    expect(
      flat.toString()
    ).to.include(
      output.toString()
    )
  })
})
