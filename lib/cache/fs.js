var crypto = require('crypto')
  , fs = require('fs')
  , join = require('path').join
  , version = require('../../package').version
  , utils = require('../utils')
  , nodes = require('../nodes')
  , CircularJSON = require('circular-json');

var FSCache = module.exports = function(options) {
  options = options || {};
  this._location = options.location = options.location || '.styl-cache';
  if (!fs.existsSync(this._location)) fs.mkdirSync(this._location);
};

FSCache.prototype.set = function(key, value) {
  fs.writeFileSync(join(this._location, key), CircularJSON.stringify(value));
};

FSCache.prototype.get = function(key) {
  var data = fs.readFileSync(join(this._location, key), 'utf-8');
  return CircularJSON.parse(data, FSCache.fromJSON);
};

FSCache.prototype.has = function(key) {
  return fs.existsSync(join(this._location, key));
};

FSCache.prototype.key = function(str, options) {
  var hash = crypto.createHash('sha1');
  options = utils.merge({}, options);
  options.root = options.filename = options.Evaluator = null;
  hash.update(str + version + JSON.stringify(options));
  return hash.digest('hex');
};

FSCache.fromJSON = function(key, val) {
  if (val.__type) {
    val.__proto__ = nodes[val.__type].prototype;
  }
  return val;
};
