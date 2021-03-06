var _ = require('lodash'),
    Handlebars = require('handlebars'),
    Q = require('q'),
    fs = require('fs'),
    path = require('path'),
    log = require('debug')('kong:maps:log'),
    debug = require('debug')('kong:maps:debug'),
    Q = require('q');

var match = require('../utils/PathMatcher.js');

function registerHelpers(directory) {
  directory = directory || path.resolve(__dirname, "helpers");
  _.each(fs.readdirSync(directory), function(filename) {
    var helperName = filename.replace(/(.+)\.js$/, function(_, name) { return name; });
    debug("registering Handlebars helper %s", helperName);
    Handlebars.registerHelper(helperName, require(path.resolve(directory, filename)));
  });
};

module.exports = MapProvider;

function MapProvider(server) {
  this.server = server;
  this.maps = [];
}

MapProvider.RegisterHelpers = registerHelpers;

MapProvider.prototype.distribute = function(source, notification) {
  var pending = _.map(this.maps, function(map) {
    if(!match(map.source, source)) return;

    var distributor = this.server.distributors[map.target];
    if(!distributor) return this.server.error("distributor '" + map.target + "' could not be found");

    for(var k in map.when)
      if(notification[k] != map.when[k]) return;

    var output = {};
    for(var k in map.transforms) {
      try {
        output[k] = map.transforms[k]({
          config: this.server.config,
          keys: this.server.keys,
          source: source,
          notification: notification
        });
      } catch(ex) {
        return Q.reject({ source: source, target: map.target, success: false, result: new Error("Template error in " + map.id + ":" + k + " (" + map.map[k] + ")") });
      }
    }

    debug("%s %j => %s %j", source, notification, map.target, output);
    return distributor(output).then(function(result) {
      return Q({ source: source, target: map.target, success: true, result: result });
    }, function(err) {
      return Q.reject({ source: source, target: map.target, success: false, result: err });
    });
  }, this);

  return Q.all(pending);
};

MapProvider.prototype.register = function(definition, id) {
  definition.id = id;
  definition.transforms = {};
  for(var k in definition.map) {
    definition.transforms[k] = makeTransform(definition.map[k]);
  }
  log("%s => %s %j", definition.source, definition.target, definition.when);
  this.maps.push(definition);
};

MapProvider.prototype.registerAll = function(directory) {
  _.each(fs.readdirSync(directory), function(filename) {
    if(/\.json$/.test(filename)) {
      log("registering %s", filename);
      try {
        this.register(require(path.resolve(directory, filename)), filename);
      } catch(ex) {
        var error = new Error("Failed to load map file. " + ex.message);
        error.stack = ex.stack;
        this.server.error(error, { file: filename });
      }
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