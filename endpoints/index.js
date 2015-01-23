var fs = require('fs'),
  path = require('path'),
  _ = require('lodash');

function EndpointProvider(server) {
  this.server = server;
}

EndpointProvider.prototype.register = function(name, endpoint) {
  if(~Object.keys(EndpointProvider.prototype).indexOf(name) || Object.keys(this).indexOf(name)) throw new Error("Cannot register an endpoint with the name " + name + " as this name is reserved");
  this[name] = endpoint(server, server.notify.bind(server, name));
};

EndpointProvider.prototype.registerAll = function() {
  var directory = path.resolve(__dirname, "providers");

  _.each(fs.readdirSync(directory), function(filename) {
    if(/\.js$/.test(filename)) this.register(
      filename.replace(/(.+)\.js$/, function(_, name) { return name; }),
      require(path.resolve(directory, filename)));
  }, this);
};

module.exports = EndpointProvider;
