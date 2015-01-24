var _ = require('lodash'),
    Handlebars = require('handlebars'),
    Q = require('q'),
    fs = require('fs'),
    path = require('path'),
    log = require('debug')('kong:maps:log'),
    debug = require('debug')('kong:maps:debug');

var match = require('../utils/PathMatcher.js');

(function(Handlebars, fs, path) {
  var directory = path.resolve(__dirname, "helpers");
  _.each(fs.readdirSync(directory), function(filename) {
    var helperName = filename.replace(/(.+)\.js$/, function(_, name) { return name; });
    debug("registering Handlebars helper %s", helperName);
    Handlebars.registerHelper(helperName, require(path.resolve(directory, filename)));
  });
})(Handlebars, fs, path);

module.exports = MapProvider;

function MapProvider(server) {
  this.server = server;
  this.maps = [];
}

MapProvider.prototype.distribute = function(source, notification) {
  var pending = _.map(this.maps, function(map) {
    if(!match(map.source, source)) return;

    var distributor = this.server.distributors[map.target];
    if(!distributor) return this.server.error("distributor '" + map.target + "' could not be found");

    for(var k in map.when)
      if(notification[k] != map.when[k]) return;

    var output = {};
    for(var k in map.transforms) {
      output[k] = map.transforms[k]({
        config: this.server.config,
        keys: this.server.keys,
        source: source,
        notification: notification
      });
    }

    debug("%s %j => %s %j", source, notification, map.target, output);
    return distributor(output);
  }, this);

  return Q.all(pending);
};

MapProvider.prototype.register = function(definition) {
  definition.transforms = {};
  for(var k in definition.map) {
    definition.transforms[k] = makeTransform(definition.map[k]);
  }
  log("%s => %s %j", definition.source, definition.target, definition.when);
  this.maps.push(definition);
};

MapProvider.prototype.registerAll = function() {
  var directory = path.resolve(__dirname, "providers");

  _.each(fs.readdirSync(directory), function(filename) {
    if(/\.json$/.test(filename)) {
      log("registering %s", filename);
      this.register(require(path.resolve(directory, filename)));
    }
  }, this);
};

function makeTransform(definition) {
  if(_.isString(definition)) return Handlebars.compile(definition, { noEscape: true });
  return function(values) {
    var result = {};
    for(var k in definition) {
      if(k == '$') return _.merge(result, values[definition[k]]);
      else result[k] = makeTransform(definition[k])(values);
    }
    return result;
  }
}