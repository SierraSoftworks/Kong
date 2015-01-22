var restify = require('restify');

var DistributorProvider = require('./distributors'),
    EndpointProvider = require('./endpoints'),
    pkg = require('./package.json');

module.exports = function(config) {
  var server = restify.createServer({
    name: 'Kong',
    version: pkg.version
  });

  server.config = config;

  server.distributors = new DistributorProvider(server);
  server.endpoints = new EndpointProvider(server);

  return server;
};
