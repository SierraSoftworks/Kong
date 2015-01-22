function EndpointProvider(server) {
  this.server = server;
}

EndpointProvider.prototype.register = function(name, endpoint) {
  if(~Object.keys(EndpointProvider.prototype).indexOf(name) || Object.keys(this).indexOf(name)) throw new Error("Cannot register an endpoint with the name " + name + " as this name is reserved");
  this[name] = endpoint;
};

module.exports = EndpointProvider;
