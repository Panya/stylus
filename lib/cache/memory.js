var crypto = require('crypto')
  , utils = require('../utils');

var MemoryCache = module.exports = function() {
  this._cache = {};
};

MemoryCache.prototype.set = function(key, value) {
  this._cache[key] = value;
};

MemoryCache.prototype.get = function(key) {
  return this._cache[key];
};

MemoryCache.prototype.has = function(key) {
  return key in this._cache;
};

MemoryCache.prototype.key = function(str, options) {
  var hash = crypto.createHash('sha1');
  options = utils.merge({}, options);
  options.root = options.filename = options.Evaluator = null;
  hash.update(str + JSON.stringify(options));
  return hash.digest('hex');
};
