'use strict'

module.exports = function (json) {
  return JSON.stringify(json, null, '\t')
}
