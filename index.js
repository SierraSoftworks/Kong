var restify = require('restify'),
    _ = require('lodash');

var DistributorProvider = require('./distributors'),
    EndpointProvider = require('./endpoints'),
    MapProvider = require('./maps'),
    pkg = require('./package.json');

module.exports = function(config, keys) {
  var server = restify.createServer({
    name: 'Kong',
    version: pkg.version
  });

  server.config = config;
  server.keys = keys;

  server.distributors = new DistributorProvider(server);
  server.endpoints = new EndpointProvider(server);
  server.maps = new MapProvider(server);

  server.use(restify.bodyParser());
  server.use(restify.throttle({
    burst: 5,
    rate: 1,
    ip: true
  }));

  server.notify = function(source, notification) {
    server.maps.distribute(source, notification).then(function() {
      console.log("%s: %j", source, notification)
    }).catch(function(err) {
      console.error(err.stack);
    });
  };

  server.distributors.registerAll();
  server.endpoints.registerAll();
  server.maps.registerAll();

  return server;
};
