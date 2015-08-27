var _ = require('lodash');

module.exports = function(server) {

  server.get('/api/distributors', function(req, res, next) {
    res.json(200, Object.keys(server.distributors));
    return next();
  });

};