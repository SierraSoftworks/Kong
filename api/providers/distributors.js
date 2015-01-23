var _ = require('lodash');

module.exports = function(server) {

  server.get('/api/distributors', function(req, res, next) {
    res.json(Object.keys(server.distributors));
    return next();
  });

};