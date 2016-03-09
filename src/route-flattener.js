'use strict';

class RouteFlattener {

  flattenEntry(entry) {

    let endpoint = {};

    endpoint.tags = entry.settings.tags;
    endpoint.description = entry.settings.description;
    endpoint.notes = entry.settings.notes;

    for (let validationType of ['query', 'params', 'payload']) {

      if (entry.settings.validate.hasOwnProperty(validationType)) {
        endpoint.validation = {};
        endpoint.validation[validationType] = {};
        this.recursivelyAbsorb(entry.settings.validate[validationType]._inner.children, null, endpoint.validation[validationType]);
      }

    }

    return endpoint;

  }

  recursivelyAbsorb(children, parentKey, master) {

    for (let param of children) {

      let key = `${parentKey ? parentKey+'.' : ''}${param.key}`,
          valids = param.schema._valids,
          type = param.schema._type;

      master[key] = { type };

      if (this._notEmpty(valids)) {
        master[key].valid = valids._set;
      }

      if (param.schema._type === 'object') {
        this.recursivelyAbsorb(param.schema._inner.children, key, master);
      } else {
        console.log(param.schema._type);
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

}

module.exports = new RouteFlattener();
