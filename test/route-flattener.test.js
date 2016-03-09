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
                  _description: null,
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

  lab.test('Flattens a single route', (done) => {

    let singleRouteWithQuery = buildRoute('get');

    let output = {
      tags: ['one', 'two'],
      description: 'One Two',
      notes: ['Counts Numbers'],
      validation: {
        query: {
          elements: {
            items: {
              type: 'string',
              valid: ['four', 'five']
            }
          }
        }
      }
    }

    let flat = flattener.flattenEntry(singleRouteWithQuery);
    expect(flat).to.deep.include(output);
    done();

  });

  lab.test('Provides example', (done) => {

    let singleRouteWithQuery = buildRoute('get');

    let output = {
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

    let flat = flattener.flattenEntry(singleRouteWithQuery);
    expect(flat).to.deep.include(output);
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

  lab.test('Merges all servers', (done) => {

    let server = {
      tables: function() {
        return [
          {
            table: [
              buildRoute('get'),
              buildRoute('put')
           ]
         },
         {
           table: [
             buildRoute('post'),
             buildRoute('delete'),
             buildRoute('options')
          ]
        },
        ]
      }
    }

    let routes = flattener.fetchRoutes(server);
    expect(routes.length).to.equal(5);
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
              elements: {
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
        }

    let flat = flattener.flattenEntry(depth);
    expect(flat).to.deep.include(output);
    done();

  });



});
