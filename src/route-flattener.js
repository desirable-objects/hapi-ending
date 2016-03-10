'use strict';

let dot = require('dot-object');

class RouteFlattener {

  constructor() {

    this.examples = {
      string: 'qux',
      number: 123,
      array: ['foo', 'bar', 'baz'],
      object: {foo: 'bar'},
      boolean: true,
      date: new Date().toISOString()
    }

  }

  flattenEntry(entry) {

    let endpoint = {
      tags: entry.settings.tags,
      description: entry.settings.description,
      notes: entry.settings.notes,
      validation: {}
    };

    let validationTypes = {
      query: 'Query String',
      params: 'URI Components',
      payload: 'JSON Payload'
    }

    for (let validationType of Object.keys(validationTypes)) {

      if (entry.settings.validate[validationType]) {
        endpoint.validation[validationType] = {
          humanName: validationTypes[validationType],
          elements: {}
        };

        this.recursivelyAbsorb(entry.settings.validate[validationType]._inner.children, null, endpoint.validation[validationType].elements);

        let items = endpoint.validation[validationType].elements,
            example;

        switch (validationType) {
          case 'query':
            example = Object.keys(items).map((key) => {
              return `${key}=${this._example(items, key)}`;
            }).join('&');
            break;
          case 'payload':
            let mapping = {};
            for (let key of Object.keys(items)) {
              mapping[key] = this._example(items, key);
            }
            example = dot.object(mapping);
            break;
          case 'params':
            example = entry.path;
            for (let key of Object.keys(items)) {
              example = example.replace('{'+key+'}', this._example(items, key));
            }
            break;
        }

        endpoint.validation[validationType].example = example;

      }

    }

    return endpoint;

  }

  _mapExamples(items) {
    let mapping = {};
    for (let key of Object.keys(items)) {
      mapping[key] = this._example(items, key);
    }
    return mapping;
  }

  _example(items, key) {
    return (items[key].valid && items[key].valid.length > 1) ? items[key].valid[0] : items[key].example;
  }

  _isIterable(obj) {
    if (obj == null) {
      return false
    }
    return obj[Symbol.iterator] !== undefined
  }

  recursivelyAbsorb(children, parentKey, master) {

    if (!this._isIterable(children)) { return; }

    for (let param of children) {

      let key = `${parentKey ? parentKey+'.' : ''}${param.key}`,
          valids = param.schema._valids,
          type = param.schema._type,
          description = param.schema._description;

      master[key] = { type };

      if (this._notEmpty(valids)) {
        master[key].valid = valids._set;
      }

      if (description) {
        master[key].description = description;
      }

      if (param.schema._type === 'object') {
        this.recursivelyAbsorb(param.schema._inner.children, key, master);
      } else {
        master[key].example = this.examples[type] || `<${type}>`;
      }

    }

  }

  _notEmpty(thing) {
    return Object.keys(thing).length > 0;
  }

  flatten(table) {

    let routing = {};

    for (let endpoint of table) {

      let plc = endpoint.public;
      if (!plc.settings.tags || plc.settings.tags.indexOf('private') === -1) {
        routing[plc.path] = routing[plc.path] || {};
        try {
          routing[plc.path][plc.method] = this.flattenEntry(plc);
        } catch (e) {
          console.error(e, e.stack);
        }
        routing[plc.path][plc.method].validation.params = routing[plc.path][plc.method].validation.params || { example: plc.path };
      }

    }

    return routing;

  }

  fetchRoutes(server) {

    let routes = [];

    for (let table of server.table()) {
      routes = routes.concat(table.table);
    }

    return routes;

  }

}

module.exports = new RouteFlattener();
