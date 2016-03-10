'use strict';
var shortid = require('shortid');

module.exports = function(part1, part2) {
  let ep = `${part2.toString()}__${part1.toString()}`;
  return new Buffer(ep).toString('base64');
};
