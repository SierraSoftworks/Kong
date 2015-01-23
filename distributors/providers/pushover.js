var restify = require('restify'),
    Q = require('q');

var api = restify.createJsonClient({
  url: 'https://api.pushover.net',
  version: "1.x"
});



module.exports = function(server, notification) {
  var defered = Q.defer();

  api.post("/1/messages.json", notification, function(err, req, res, obj) {
    if(err) return defered.reject(err);
    defered.resolve(obj);
  });

  return defered.promise;
};
