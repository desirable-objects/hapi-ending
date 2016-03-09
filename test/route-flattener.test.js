'use strict';

var Lab = require("lab"),
    Code = require('code'),
    lab = exports.lab = Lab.script();

var expect = Code.expect;

let flattener = require('../src/route-flattener');

function buildRoute(method) {
  return {
    path: '/counter',
    method: method,
    settings: {
      tags: ['one', 'two'],
      description: 'One Two',
      notes: ['Counts Numbers'],
      validate: {
        query: {
          _inner: {
            children: [
              {
                key: 'items',
                schema: {
                  _type: 'string',
                  _valids: {
                    _set: ['four', 'five']
                  }
                }
              }
            ]
          }
        }
      }
    }
  }
}

lab.experiment('Route Flattener', () => {

  lab.test('Flattens a routing table', (done) => {

    let singleRouteWithQuery = buildRoute('get');

    let output = {
      tags: ['one', 'two'],
      description: 'One Two',
      notes: ['Counts Numbers'],
      validation: {
        query: {
          items: {
            type: 'string',
            valid: ['four', 'five']
          }
        }
      }
    }

    let flat = flattener.flattenEntry(singleRouteWithQuery);
    expect(flat).to.deep.equal(output);
    done();

  });

  lab.test('Groups by endpoint', (done) => {

    // server.table()[0].table[0]

    let tables = [
      { public: buildRoute('get') },
      { public: buildRoute('post') },
      { public: buildRoute('put') }
    ];

    let flat = flattener.flatten(tables);
    expect(Object.keys(flat).length).to.equal(1);
    expect(Object.keys(flat['/counter']).length).to.equal(3);
    done();

  });

  lab.test('Groups by endpoint', (done) => {

    let tables = [
      { public: buildRoute('get') },
      { public: buildRoute('post') },
      { public: buildRoute('put') }
    ];

    let flat = flattener.flatten(tables);
    expect(Object.keys(flat).length).to.equal(1);
    expect(Object.keys(flat['/counter']).length).to.equal(3);
    done();

  });

  lab.test('Flattens nested validators', (done) => {

    let depth = {
      path: '/nester',
      method: 'put',
      settings: {
        tags: ['one', 'two'],
        description: 'One Two',
        notes: ['Counts Numbers'],
        validate: {
          payload: {
            _inner: {
              children: [
                {
                  key: 'one',
                  schema: {
                    _type: 'object',
                    _valids: {},
                    _inner: {
                        children: [
                          {
                            key: 'two',
                            schema: {
                              _type: 'object',
                              _valids: {},
                              _inner: {
                                  children: [
                                    {
                                      key: 'three',
                                      schema: {
                                        _type: 'string',
                                        _valids: {},
                                        _inner: {}
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
                  ]
                }
              }
            }
          }
        };

        let output = {
          tags: ['one', 'two'],
          description: 'One Two',
          notes: ['Counts Numbers'],
          validation: {
            payload: {
              one: {
                type: 'object'
              },
              'one.two': {
                type: 'object'
              },
              'one.two.three': {
                type: 'string'
              }
            }
          }
        }

    let flat = flattener.flattenEntry(depth);
    expect(flat).to.deep.equal(output);
    done();

  });

});

/**
console.log(server.table()[0].table[0].settings.validate.query._inner.children);

[ { key: 'items',
schema:
{ isJoi: true,
_type: 'number',
_settings: null,
_valids: [Object],
_invalids: [Object],
_tests: [],
_refs: [],
_flags: {},
_description: 'Number of items in the cart',
_unit: null,
_notes: [],
_tags: [],
_examples: [],
_meta: [],
_inner: {} } } ]

***/
