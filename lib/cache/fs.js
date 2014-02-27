var crypto = require('crypto')
  , fs = require('fs')
  , join = require('path').join
  , version = require('../../package').version
  , utils = require('../utils')
  , nodes = require('../nodes')
  , CircularJSON = require('circular-json');

var FSCache = module.exports = function(options) {
  options = options || {};
  this._location = options.location = options.location || '.styl';
  if (!fs.existsSync(this._location)) fs.mkdirSync(this._location);
};

FSCache.prototype.set = function(key, value) {
  fs.writeFileSync(join(this._location, key), CircularJSON.stringify(value));
};

FSCache.prototype.get = function(key) {
  var data = fs.readFileSync(join(this._location, key), 'utf-8');
  return FSCache.fromJSON(CircularJSON.parse(data));
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

FSCache.fromJSON = function(node) {
  if (!node.__type || node.seen) return node;

  node.seen = true;

  for (var prop in node) {
    if (node[prop] instanceof Array) {
      for (var i = 0, len = node[prop].length; i < len; ++i) {
        node[prop][i] = FSCache.fromJSON(node[prop][i]);
      }
    } else if (null !== node[prop] && 'object' === typeof node[prop]) {
      node[prop] = FSCache.fromJSON(node[prop]);
    }
  }

  node.__proto__ = nodes[node.__type].prototype;

  return node;
};
