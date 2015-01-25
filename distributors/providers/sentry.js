var _ = require('lodash'),
    Q = require('q');

module.exports = function(server, notification) {
  var defered = Q.defer();

  _.defaults(notification, {
    level: 'info',
    version: server.config.version
  });

  var message = notification.message;
  delete notification.message;

  server.raven.captureMessage(message, notification, function() {
    defered.resolve();
  });

  return defered.promise;
};
