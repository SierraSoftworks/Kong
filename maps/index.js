var _ = require('lodash'),
    handlebars = require('handlebars'),
    Q = require('q'),
    fs = require('fs'),
    path = require('path');

module.exports = MapProvider;

function MapProvider(server) {
  this.server = server;
  this.maps = [];
}

MapProvider.prototype.distribute = function(source, notification) {
  var pending = _.map(this.maps, function(map) {
    if(map.source != source) return;

    var distributor = this.server.distributors[map.target];
    if(!distributor) return;

    var output = {};
    for(var k in map.transforms) {
      output[k] = map.transforms[k]({
        config: this.server.config,
        keys: this.server.keys,
        source: notification
      });
    }

    return distributor(output);
  }, this);

  return Q.all(pending);
};

MapProvider.prototype.register = function(definition) {
  $definition.transforms = {};
  for(var k in definition.map) {
    $definition.transforms[k] = handlebars.compile($definition.map[k], { noEscape: true });
  }
  $this.maps.push(definition);
};

MapProvider.prototype.registerAll = function() {
  var directory = path.resolve(__dirname, "providers");

  _.each(fs.readdirSync(directory), function(filename) {
    if(/\.json$/.test(filename)) this.register(require(path.resolve(directory, filename)));
  }, this);
};
