var fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    log = require('debug')('kong:distributors:log'),
    debug = require('debug')('kong:distributors:debug');

function DistributionProvider(server) {
  Object.defineProperty(this, 'server', {
    value: server,
    configurable: false,
    enumerable: false
  });
}

DistributionProvider.prototype.register = function(name, distributor) {
  if(~Object.keys(DistributionProvider.prototype).indexOf(name) || ~Object.keys(this).indexOf(name)) return this.server.error(new Error("Cannot register a distributor with the name " + name + " as this name is reserved"));
  debug('registered %s', name);
  this[name] = distributor.bind(null, this.server);
};

DistributionProvider.prototype.registerAll = function(directory) {
  directory = directory || path.resolve(__dirname, "providers");

  _.each(fs.readdirSync(directory), function(filename) {
    if(/\.js$/.test(filename)) {
      log("registering %s", filename.substr(0, filename.length - 3));
      this.register(
        filename.substr(0, filename.length - 3),
        require(path.resolve(directory, filename)));
    }
    }, this);
  };

module.exports = DistributionProvider;
