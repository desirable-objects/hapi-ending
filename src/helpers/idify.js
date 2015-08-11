var shortid = require('shortid');

module.exports = function(url) {
  return shortid.generate();
};
