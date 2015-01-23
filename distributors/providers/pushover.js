var restify = require('restify'),
	_ = require('lodash'),
    Q = require('q');

var api = restify.createJsonClient({
  url: 'https://api.pushover.net'
});

module.exports = function(server, notification) {
  var defered = Q.defer();

  _.defaults(notification, {
  	token: server.keys.pushover.token,
  	user: server.keys.pushover.user
  });

  api.post("/1/messages.json", notification, function(err, req, res, obj) {
    if(err) return defered.reject(err);
    defered.resolve(obj);
  });

  return defered.promise;
};
