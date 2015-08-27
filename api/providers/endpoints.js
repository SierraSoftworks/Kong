var _ = require('lodash');

module.exports = function(server) {

  server.get('/api/endpoints', function(req, res, next) {
    res.json(200, Object.keys(server.endpoints));
    return next();
  });

};