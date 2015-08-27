var _ = require('lodash');

module.exports = function(server) {
  server.get('/api/maps', function(req, res, next) {
    res.json(200, _.map(server.maps.maps, function(map) {
      return _.at(map, 'source', 'target', 'when', 'map')
    }));
    return next();
  });
};