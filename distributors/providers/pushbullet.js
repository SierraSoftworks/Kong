var restify = require('restify'),
	  _ = require('lodash'),
    Q = require('q');

var api = restify.createJsonClient({
  url: 'https://api.pushbullet.com'
});

module.exports = function(server, notification) {
  var defered = Q.defer();

  _.defaults(notification, {
  	token: server.keys.pushover.token,
  	user: server.keys.pushover.user
  });

  api.post({
    path: "/v2/pushes",
    headers: {
      Authorization: "Bearer " + server.keys.pushbullet.token
    }
  }, notification, function(err, req, res, obj) {
    if(err) return defered.reject(err);
    defered.resolve(obj);
  });

  return defered.promise;
};
