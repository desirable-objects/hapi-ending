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

    let endpoint = {};

    endpoint.tags = entry.settings.tags;
    endpoint.description = entry.settings.description;
    endpoint.notes = entry.settings.notes;

    for (let validationType of ['query', 'params', 'payload']) {

      if (entry.settings.validate.hasOwnProperty(validationType)) {
        endpoint.validation = {};
        endpoint.validation[validationType] = {
          elements: {}
        };
        this.recursivelyAbsorb(entry.settings.validate[validationType]._inner.children, null, endpoint.validation[validationType].elements);

        let items = endpoint.validation[validationType].elements,
            example;

        switch (validationType) {
          case 'query':
            example = Object.keys(items).map((item) => {
              let preferredValue = items[item].valid ? items[item].valid[0] : items[item].example;
              return `${item}=${preferredValue}`;
            }).join('&');
            break;
          case 'payload':
            let mapping = {};
            for (let key of Object.keys(items)) {
              mapping[key] = items[key].example;
            }
            example = dot.object(mapping);
            break;
          case 'params':
            example = entry.settings.path;
            break;
        }

        endpoint.validation[validationType].example = example;

      }

    }

    return endpoint;

  }

  recursivelyAbsorb(children, parentKey, master) {

    for (let param of children) {

      let key = `${parentKey ? parentKey+'.' : ''}${param.key}`,
          valids = param.schema._valids,
          type = param.schema._type,
          description = param.schema._description;

      master[key] = { type, example: this.examples[type] || `<${type}>` };

      if (this._notEmpty(valids)) {
        master[key].valid = valids._set;
      }

      if (description) {
        master[key].description = description;
      }

      if (param.schema._type === 'object') {
        this.recursivelyAbsorb(param.schema._inner.children, key, master);
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

      routing[plc.path] = routing[plc.path] || {};
      routing[plc.path][plc.method] = this.flattenEntry(plc);
    }

    return routing;

  }

  fetchRoutes(server) {

    let routes = [];

    for (let table of server.tables()) {
      routes = routes.concat(table.table);
    }

    return routes;

  }

}

module.exports = new RouteFlattener();
