var fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    log = require('debug')('kong:endpoints:log'),
    debug = require('debug')('kong:endpoints:debug');

function EndpointProvider(server) {
  Object.defineProperty(this, 'server', {
    value: server,
    configurable: false,
    enumerable: false
  });
}

EndpointProvider.prototype.register = function(name, endpoint) {
  if(~Object.keys(EndpointProvider.prototype).indexOf(name) || ~Object.keys(this).indexOf(name)) return this.server.error(new Error("Cannot register an endpoint with the name " + name + " as this name is reserved"));
  this[name] = endpoint(this.server, this.server.notify.bind(this.server, name));
};

EndpointProvider.prototype.registerAll = function(directory) {
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

module.exports = EndpointProvider;
