var restify = require('restify'),
    _ = require('lodash'),
    Raven = require('raven'),
    logRequest = require('debug')('kong:requests'),
    logDistribution = require('debug')('kong:distributions'),
    debug = require('debug')('kong:debug'),
    error = require('debug')('kong:errors');

var DistributorProvider = require('./distributors'),
    EndpointProvider = require('./endpoints'),
    MapProvider = require('./maps'),
    API = require('./api'),
    pkg = require('./package.json');

module.exports = function(config, keys) {
  var raven = new Raven.Client(config.raven);
  raven.patchGlobal();

  var server = restify.createServer({
    name: 'Kong',
    version: pkg.version
  });

  server.raven = raven;

  server.on('uncaughtException', function(req, res, route, err) {
    res.send(err);
    error("%s", err.stack);
    raven.captureError(err, { level: 'error', version: config.version, extra: { route: route } })
  });

  server.config = config;
  server.keys = keys;

  server.distributors = new DistributorProvider(server);
  server.endpoints = new EndpointProvider(server);
  server.maps = new MapProvider(server);

  server.use(function(req, res, next) {
    logRequest("%s %s", req.method, req.url);
    next();
  });
  server.use(restify.queryParser());
  server.use(restify.bodyParser({
    mapParams: true
  }));
  server.use(restify.throttle({
    burst: 5,
    rate: 1,
    ip: true
  }));

  server.notify = function(source, notification) {
    server.maps.distribute(source, notification).then(function() {
      logDistribution("=> %s %j", source, notification);
    }).catch(function(errors) {
      _.each(errors, server.error, server);
    });
  };

  server.error = function(err, extra) {
    extra = extra || {};
    _.defaults(extra, {

    });

    var report = raven.captureError(err, { level: 'error', version: config.version, extra: extra });
    error("{%s} %s %j\n%s", report.id, err.message || err, extra, err.stack);
  };

  API(server);

  server.distributors.registerAll();
  server.endpoints.registerAll();
  server.maps.registerAll();

  function defaultSource(req, res, next) {
    var source = req.params[0];
    delete req.params[0];
    server.notify(source, req.params);
    res.send(200);
    return next();
  }

  server.head(/^\/push\/((?:[a-z0-9_\\]+\/?)+)$/, defaultSource);
  server.get(/^\/push\/((?:[a-z0-9_\\]+\/?)+)$/, defaultSource);
  server.post(/^\/push\/((?:[a-z0-9_\\]+\/?)+)$/, defaultSource);
  server.put(/^\/push\/((?:[a-z0-9_\\]+\/?)+)$/, defaultSource);

  return server;
};
